import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class AESGCMCipher:
    @staticmethod
    def encrypt(key: bytes, plaintext: str, associated_data: str = "") -> dict:
        """
        Encrypts with optional associated data (Session ID).
        """
        aesgcm = AESGCM(key)
        nonce = os.urandom(12) 
        
        # associated_data ko handle karne ka sahi tarika
        ad_bytes = associated_data.encode() if associated_data else None
        
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), ad_bytes)

        return {
            "ciphertext": ciphertext.hex(),
            "nonce": nonce.hex()
        }

    @staticmethod
    def decrypt(key: bytes, ciphertext_hex: str, nonce_hex: str, associated_data: str = "") -> str:
        aesgcm = AESGCM(key)
        ad_bytes = associated_data.encode() if associated_data else None
        
        plaintext = aesgcm.decrypt(
            bytes.fromhex(nonce_hex),
            bytes.fromhex(ciphertext_hex),
            ad_bytes
        )
        return plaintext.decode()