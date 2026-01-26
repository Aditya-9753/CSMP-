import hashlib
import hmac
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from app.config import settings

class KeyManager:
    @staticmethod
    def derive_key(session_id: str, purpose: str = "general") -> bytes:
        """
        Derives a high-entropy key using HKDF.
        Purpose can be 'encryption' or 'signing'.
        """
        master_secret = getattr(settings, "SECRET_KEY", "dev_secret_key_32_chars_long_!!!").encode()
        
        return HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=session_id.encode(),
            info=purpose.encode(),
        ).derive(master_secret)