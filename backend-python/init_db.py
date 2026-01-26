from app.database.connection import engine
from app.database.base import Base
from app.models.chat_message_model import ChatMessage

Base.metadata.create_all(bind=engine)
print("✅ Database created successfully")
