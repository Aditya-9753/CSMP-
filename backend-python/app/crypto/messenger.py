import time
from .key_manager import KeyManager
from .aes_gcm import AESGCMCipher
from .signer import Signer
from .nonce_manager import NonceManager

class SecureChat:
    @staticmethod
    def get_session_id(user_a: str, user_b: str) -> str:
        """
        Dono users ki IDs ko sort karke unique session banata hai.
        Yahan user_a aur user_b kuch bhi ho sakte hain (UUID, Username, ID).
        """
        ids = sorted([str(user_a), str(user_b)])
        return f"sess_{ids[0]}_{ids[1]}"

    @classmethod
    def encrypt_message(cls, sender_id: str, receiver_id: str, message: str):
        """
        User ID input lega aur encryption process start karega.
        Kuch bhi hardcoded nahi hai.
        """
        # Dynamic Session ID
        sid = cls.get_session_id(sender_id, receiver_id)
        
        # Keys derive karna (Unique for this session)
        enc_key = KeyManager.derive_key(sid, "encryption")
        sig_key = KeyManager.derive_key(sid, "signature")
        
        # 1. AES-GCM Encryption
        payload = AESGCMCipher.encrypt(enc_key, message, sid)
        
        # 2. Metadata & Timestamp
        payload.update({
            "sender": sender_id,
            "receiver": receiver_id,
            "timestamp": time.time()
        })
        
        # 3. Signature (Security binding)
        sign_content = f"{payload['ciphertext']}|{payload['timestamp']}|{sender_id}"
        payload["signature"] = Signer.sign(sig_key, sign_content)
        
        return payload

    @classmethod
    def decrypt_message(cls, current_user: str, sender_of_msg: str, payload: dict):
        """
        Current user aur sender ki ID ke basis par verify aur decrypt karega.
        """
        # 1. Replay Protection
        if not NonceManager.validate(payload.get("nonce")):
            return {"error": "Invalid or Replayed Nonce"}

        # Dynamic SID according to users
        sid = cls.get_session_id(current_user, sender_of_msg)
        
        enc_key = KeyManager.derive_key(sid, "encryption")
        sig_key = KeyManager.derive_key(sid, "signature")
        
        # 2. Signature Verification
        sign_content = f"{payload['ciphertext']}|{payload['timestamp']}|{payload['sender']}"
        if not Signer.verify(sig_key, sign_content, payload["signature"]):
            return {"error": "Integrity Check Failed: Message Tampered"}
            
        # 3. AES-GCM Decryption
        try:
            plain_text = AESGCMCipher.decrypt(
                enc_key, 
                payload["ciphertext"], 
                payload["nonce"], 
                sid
            )
            return {
                "status": "decrypted",
                "message": plain_text,
                "from": payload["sender"],
                "time": payload["timestamp"]
            }
        except Exception as e:
            return {"error": f"Decryption Error: {str(e)}"}

# --- KAISE USE KAREIN (EXAMPLE) ---

# Maan lo aapka system dynamic IDs generate karta hai
any_sender = "ID_99210" 
any_receiver = "ID_11025"

# Message bhejna
encrypted_data = SecureChat.encrypt_message(any_sender, any_receiver, "Ye message dynamic hai!")
print(f"Server ko ye bhejo: {encrypted_data}")

# Message receive karna (Receiver ki side par)
decrypted_data = SecureChat.decrypt_message(any_receiver, any_sender, encrypted_data)
print(f"User ko ye dikhao: {decrypted_data}")