PROTOCOL_VERSION = "1.0"

ERROR_CODES = {
    "INVALID_VERSION": 1001,
    "INVALID_SESSION": 1002,
}

MESSAGE_TYPES = {
    "HANDSHAKE_REQUEST": "handshake_request",
    "HANDSHAKE_RESPONSE": "handshake_response",
    "DATA_MESSAGE": "data_message",
    "ERROR_MESSAGE": "error_message",
    "HEARTBEAT": "heartbeat",
}