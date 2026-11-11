import os
from urllib.parse import quote_plus, urlparse

from beanie import init_beanie
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

from models.notes_model import Notes

load_dotenv()


def get_mongo_url() -> str:
    configured_url = os.getenv("MONGO_URL")
    if configured_url:
        return configured_url

    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    database = os.getenv("DB_NAME")

    if not all((user, password, host, database)):
        raise RuntimeError(
            "MongoDB is not configured. Set MONGO_URL or DB_USER, DB_PASSWORD, DB_HOST and DB_NAME."
        )

    return (
        f"mongodb+srv://{quote_plus(user)}:{quote_plus(password)}@{host}/{database}"
        "?retryWrites=true&w=majority"
    )


MONGO_URL = get_mongo_url()
client = AsyncMongoClient(MONGO_URL)

uri_database = urlparse(MONGO_URL).path.lstrip("/").split("?", 1)[0]
db = client[uri_database or os.getenv("DB_NAME", "sic_db_notes")]


async def init_db() -> None:
    await init_beanie(database=db, document_models=[Notes])
