from datetime import datetime, timezone

from beanie import Document
from pydantic import Field

class Notes(Document):
    user_id: str
    content: str
    title: str = "Sem título"

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "notes" 