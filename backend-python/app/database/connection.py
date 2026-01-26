from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 🔥 FINAL DATABASE URL (DEMO)
DATABASE_URL = "sqlite:///./CSMP.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    future=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
