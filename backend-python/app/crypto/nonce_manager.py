import time

class NonceManager:
    _used_nonces = {} # nonce: timestamp
    _TTL = 300 

    @classmethod
    def validate(cls, nonce: str) -> bool:
        current_time = time.time()
        cls._cleanup(current_time)

        if not nonce or nonce in cls._used_nonces:
            return False
        
        cls._used_nonces[nonce] = current_time
        return True

    @classmethod
    def _cleanup(cls, current_time):
        expired = [n for n, t in cls._used_nonces.items() if current_time - t > cls._TTL]
        for n in expired:
            del cls._used_nonces[n]