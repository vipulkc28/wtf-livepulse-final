# WTF LivePulse — Real-Time Multi-Gym Intelligence Engine

WTF LivePulse — Real-Time Multi-Gym Intelligence Engine
A full-stack, real-time operations platform for monitoring gym activity across multiple locations.
Built with:
Frontend: React 18 + Vite + Zustand
Backend: Node.js 20 + Express + WebSockets (ws)
Database: PostgreSQL 15
Infra: Docker Compose (single-command startup)


## Quick Start

Prerequisites:
- Docker Desktop

Run:
docker compose up --build

Access:
Frontend: http://localhost:3000
Backend: http://localhost:3001

First boot seeds full dataset automatically.

## Features
- Real-time dashboard (WebSockets)
- Analytics (heatmap, churn, revenue)
- Anomaly detection
- Simulator engine

## Reset
docker compose down -v
docker compose up --build

## Run Tests
docker exec -it wtf-livepulse-backend node --test
