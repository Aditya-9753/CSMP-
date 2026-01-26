# app/utils/uuid_utils.py
import uuid

def generate_id() -> str:
    """
    Generate a unique UUID-based ID as a string.
    """
    return str(uuid.uuid4())