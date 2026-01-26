# app/crypto/hasher.py

import hmac
import hashlib

class Hasher:
    """
    HMAC-based hashing for message integrity.
    """

    @staticmethod
    def hmac_sha256(key: bytes, message: str) -> str:
        return hmac.new(
            key,
            message.encode(),
            hashlib.sha256
        ).hexdigest()
