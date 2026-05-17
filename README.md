# E-Commerce Shopping Portal

**Student:** Prabin Raj Dhungana (078BEI026)  
**Course:** DevOps Capstone – IOE Pulchowk Campus

## Project Overview
This is a production-ready E-commerce Shopping Portal with a full DevOps pipeline integrated with Jenkins and the ELK Stack (Elasticsearch, Logstash, Kibana).

### Tech Stack
- **Backend:** Node.js, Express.js, SQLite (better-sqlite3)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **DevOps:** Docker, Docker Compose, Jenkins, ELK Stack

## Features
- **User Management:** Register, Login, Logout with JWT.
- **Product Catalog:** Category filtering (Electronics, Clothing, Books, Home & Kitchen).
- **Shopping Cart:** Add/Remove items, dynamic total calculation.
- **Order Management:** Place orders, view order history.
- **Observability:** Structured JSON logging exported to ELK stack.
- **Health Checks:** Dedicated endpoint for system monitoring.

## Directory Structure
```text
ecommerce-portal/
├── backend/            # Express API + Database
├── frontend/           # Vanilla JS Frontend
├── logstash/           # Logstash pipeline configuration
├── scripts/            # Deployment scripts (Bash & PowerShell)
├── Dockerfile          # App containerization
├── docker-compose.yml  # Multi-container orchestration
├── Jenkinsfile         # CI/CD Pipeline
└── README.md           # Project Documentation
```

## Setup and Running

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
- [Node.js v20+](https://nodejs.org/) (for local development)
- [Git](https://git-scm.com/)

### 1. Local Development
```bash
cd ecommerce-portal/backend
npm install
npm start
```
Access the app at `http://localhost:5000`.

### 2. Run with Docker Compose (App + ELK)
```bash
cd ecommerce-portal
docker compose up -d --build
```
- **Web App:** `http://localhost:5000`
- **Kibana Dashboard:** `http://localhost:5601`
- **Elasticsearch:** `http://localhost:9200`

### 3. CI/CD with Jenkins
1. Install Jenkins and the Docker Pipeline plugin.
2. Create a new "Pipeline" job.
3. Point the SCM to this repository.
4. Jenkins will automatically run Lint, Build, and Deploy stages as defined in the `Jenkinsfile`.

### 4. Deployment via Scripts
- **Windows (PowerShell):** `.\scripts\deploy.ps1`
- **Linux/Mac (Bash):** `chmod +x ./scripts/deploy.sh && ./scripts/deploy.sh`

## Logging & Monitoring
All backend logs are emitted as structured JSON. Logstash collects these logs and indexes them in Elasticsearch.
- Search for logs in Kibana using the index pattern `ecommerce-logs-*`.
- Fields include `method`, `route`, `statusCode`, `responseTime`, and `message`.

## Author
Prabin Raj Dhungana (078BEI026)  
IOE Pulchowk Campus
