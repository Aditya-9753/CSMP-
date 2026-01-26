import hmac
import hashlib

class Signer:
    @staticmethod
    def sign(key: bytes, data: str) -> str:
        return hmac.new(key, data.encode(), hashlib.sha256).hexdigest()

    @staticmethod
    def verify(key: bytes, data: str, signature: str) -> bool:
        expected = hmac.new(key, data.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

class Hasher:
    @staticmethod
    def hmac_sha256(key: bytes, message: str) -> str:
        return hmac.new(key, message.encode(), hashlib.sha256).hexdigest()