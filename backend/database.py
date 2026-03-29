import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://clerisy47:nenOA2qIDG0wD9uM@cluster0.87bdjhd.mongodb.net/?appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mediwo")

# Singleton MongoDB client
_client = None
_db = None


def get_mongodb_client():
    """Get MongoDB client instance"""
    global _client
    if _client is None:
        try:
            _client = MongoClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Test connection
            _client.admin.command('ping')
            print("✓ Connected to MongoDB successfully")
        except ServerSelectionTimeoutError as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            raise
    return _client


def get_database():
    """Get MongoDB database instance"""
    global _db
    if _db is None:
        client = get_mongodb_client()
        _db = client[DATABASE_NAME]
    return _db


def close_mongodb():
    """Close MongoDB connection"""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
