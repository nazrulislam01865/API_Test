# AIUB API Server (Express.js)

This server replicates the FastAPI-based AIUB portal API using Express.js. It authenticates with the AIUB portal, retrieves student data, and provides real-time updates via Server-Sent Events (SSE) and web push notifications.

## Setup
1. Install Node.js and Redis.
2. Clone the repo and run `npm install`.
3. Configure `.env` with appropriate values.
4. Start Redis locally or use a remote instance.
5. Run `npm run dev` for development or `npm start` for production.

## Endpoints
- `GET /login?username=<username>&password=<password>`: Login and stream student data.
- `GET /notices`: Fetch latest notices.
- `POST /subscribe`: Subscribe to push notifications.
- `POST /unsubscribe`: Unsubscribe from push notifications.

## Docker
Build and run with:
```bash
docker build -t aiub-api-express .
docker run -p 5000:5000 --env-file .env aiub-api-express