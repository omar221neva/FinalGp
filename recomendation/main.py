from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
import json

# Load environment variables from .env file safely
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Read Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "").strip()

# Debug: print to confirm they're loaded correctly
print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_SERVICE_KEY:", SUPABASE_SERVICE_KEY[:8] + "...")

# Check if values loaded properly
if not SUPABASE_URL.startswith("https://") or not SUPABASE_SERVICE_KEY:
    raise Exception("Supabase credentials not loaded correctly from .env")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Setup FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/test-connection")
async def test_connection():
    try:
        response = supabase.table("properties").select("*").limit(1).execute()
        if response.data:
            return {"status": "connected", "sample": response.data}
        return {"status": "connected but no data"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Recommendation endpoint
@app.get("/recommend")
async def recommend_properties(user_id: str, top_n: int = 5):
    try:
        bookings = supabase.table("bookings").select("property_id").eq("customer_id", user_id).execute()
        if not bookings.data:
            return []

        booked_ids = [b["property_id"] for b in bookings.data]
        properties = supabase.table("properties").select("*").execute()
        if not properties.data:
            return []

        df = pd.DataFrame(properties.data)
        df.fillna("", inplace=True)
        
        # Parse picture_urls from JSON string if needed
        df["picture_urls"] = df["picture_urls"].apply(lambda x: 
            json.loads(x) if isinstance(x, str) and x else 
            x if isinstance(x, list) else []
        )
        
        df["text_features"] = df["description"] + " " + df["property_type"] + " " + df["amenities"]

        tfidf = TfidfVectorizer(stop_words="english")
        tfidf_matrix = tfidf.fit_transform(df["text_features"])
        sim_matrix = cosine_similarity(tfidf_matrix)

        booked_indices = df[df["id"].isin(booked_ids)].index.tolist()
        if not booked_indices:
            return []

        avg_sim = sim_matrix[booked_indices].mean(axis=0)
        recommended_indices = avg_sim.argsort()[::-1]
        recommended_indices = [i for i in recommended_indices if i not in booked_indices]
        top_df = df.iloc[recommended_indices[:top_n]]

        return top_df[
            ["id", "name", "description", "price", "city", "country", "property_type", "beds", "bathrooms", "picture_urls"]
        ].to_dict(orient="records")

    except Exception as e:
        print(f"Error in recommend_properties: {str(e)}")
        return {"error": str(e)}
