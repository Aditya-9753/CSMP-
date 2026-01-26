CSMP – Custom Secure Messaging Protocol

CSMP (Custom Secure Messaging Protocol) is a secure, session-based, real-time communication platform designed to handle authenticated messaging, live chat, call signaling, and protocol-level history tracking.

This project demonstrates how a custom messaging protocol can be implemented on top of modern web technologies while maintaining security, scalability, and clean architecture. 

📌 What is CSMP?

Custom Secure Messaging Protocol (CSMP) is a protocol layer that defines:

How a client initiates communication

How a secure session is created and validated

How messages and calls are exchanged in real time

How events are tracked and audited

CSMP is not just an application — it is a protocol-driven system.

🎯 Project Objectives

Implement a custom secure handshake mechanism

Enforce session-based access control

Enable real-time chat and call signaling

Maintain protocol-level history

Design a scalable backend architecture

Separate business logic, protocol logic, and transport layer

🏗️ Technology Stack
🔹 Backend

FastAPI – High-performance Python backend framework

WebSockets – Real-time bidirectional communication

SQLAlchemy – ORM architecture (database layer ready)

Pydantic – Request/response data validation

Session Guard Middleware – Security enforcement

SQLite / PostgreSQL – Database support

🔹 Frontend

React (Vite) – Modern frontend framework

Axios – Secure HTTP communication

WebSocket Client – Live chat & call updates


🔐 Core Features
✅ Secure Handshake

Client initiates handshake request

Server generates a unique CSMP session ID

Session ID is mandatory for all protected APIs

💬 Real-Time Messaging

WebSocket-based chat system

Messages are session-bound

Low-latency, real-time communication

📞 Call Signaling

WebSocket signaling for calls

Call lifecycle controlled by state machine

Ready for WebRTC integration

🧾 History Tracking

Chat & call events stored centrally

Session-wise history retrieval

Useful for auditing & debugging 

⚙️ Setup Instructions
🔹 Backend 
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

🔹 Frontend
cd frontend
npm install
npm run dev

🎯 Use Cases

Secure messaging platforms

Real-time chat applications

Call signaling backends

Academic & interview projects

Backend system design demonstrations 

👨‍💻 Author

Aditya Tiwari 

GitHub: https://github.com/Aditya-9753
