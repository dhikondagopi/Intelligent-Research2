import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "intelligent_research"
)

if not MONGO_URI:
    raise ValueError(
        "MONGO_URI is not configured in backend/.env"
    )


client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]

users_collection = db["users"]

research_profiles_collection = db[
    "research_profiles"
]