# 🔗 URL Shortening Service

A fast and lightweight URL shortening service built with **Node.js**, **Express**, **MongoDB**, and **Redis**. Shorten long URLs into compact links and resolve them with low-latency redirects powered by Redis caching.

---

## 🚀 Features

- Shorten any long URL into a compact, shareable link
- Fast redirects using **Redis** as a caching layer
- Persistent storage with **MongoDB**
- Unique short codes generated with **nanoid**
- Fully containerized with **Docker** and **Docker Compose**
- Environment-variable-based configuration via **dotenv**

---

## 🛠️ Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Runtime     | Node.js (v24, Alpine)   |
| Framework   | Express v5              |
| Database    | MongoDB 7.0 (Mongoose)  |
| Cache       | Redis (Alpine)          |
| ID Generator| nanoid                  |
| Dev Tool    | nodemon                 |
| Container   | Docker + Docker Compose |

---

## 📁 Project Structure

```
URL-Shortening-Service/
├── src/               # Application source code
│   └── app.js         # Entry point
├── Dockerfile         # Docker image definition
├── docker-compose.yaml# Multi-service orchestration
├── package.json       # Dependencies and scripts
├── .env               # Environment variables (not committed)
├── .dockerignore
└── .gitignore
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/urlshortener
REDIS_URL=redis://redis:6379
BASE_URL=http://localhost:3000
```

| Variable    | Description                                   |
|-------------|-----------------------------------------------|
| `PORT`      | Port the app will listen on                   |
| `MONGO_URI` | MongoDB connection string                     |
| `REDIS_URL` | Redis connection string                       |
| `BASE_URL`  | Base URL prepended to generated short codes   |

---

## 🐳 Running with Docker (Recommended)

Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

```bash
# 1. Clone the repository
git clone https://github.com/Octar123/URL-Shortening-Service.git
cd URL-Shortening-Service

# 2. Create your .env file
cp .env.example .env   # or manually create it

# 3. Start all services (app, MongoDB, Redis)
docker compose up --build
```

The app will be available at `http://localhost:3000` (or the `PORT` you configured).

To stop the services:

```bash
docker compose down
```

---

## 💻 Running Locally (Without Docker)

Make sure you have **Node.js v18+**, a running **MongoDB** instance, and a running **Redis** instance.

```bash
# 1. Clone the repository
git clone https://github.com/Octar123/URL-Shortening-Service.git
cd URL-Shortening-Service

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file as described above, pointing to your local MongoDB and Redis

# 4. Start the development server
npm run dev

# Or start in production mode
npm start
```

---

## 📡 API Endpoints

### Shorten a URL

```
POST /shorten
Content-Type: application/json

{
  "url": "https://www.example.com/some/very/long/url"
}
```

**Response:**

```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```

### Redirect to Original URL

```
GET /:shortCode
```

Redirects the client to the original long URL. Short codes are first looked up in Redis; on a cache miss, they are fetched from MongoDB and cached for subsequent requests.

---

## 📦 NPM Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm start`   | Start the server (`node src/app.js`) |
| `npm run dev` | Start with hot-reload via nodemon    |

---

## 🏗️ Architecture Overview

```
Client
  │
  ▼
Express App (Node.js)
  │
  ├──► Redis Cache ──► (cache hit) ──► Redirect
  │
  └──► MongoDB ──────► (cache miss) ──► Store in Redis ──► Redirect
```

1. A `POST /shorten` request generates a unique short code with `nanoid` and saves the mapping to MongoDB.
2. A `GET /:shortCode` request first checks Redis for the original URL.
3. On a cache miss, MongoDB is queried and the result is stored back in Redis.
4. The client is redirected to the original URL.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.