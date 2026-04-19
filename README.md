# ScanShield

## Overview
Short description (2–3 lines)

## Tech Stack
- NestJS, BullMQ, PostgreSQL, Redis
- React (Vite)

## Setup
docker compose up

## Features
- Document upload
- Async PII scanning via BullMQ
- API key authentication
- Scan status tracking

## Notes / Tradeoffs
- Regex-based detection (not exhaustive)
- Focus on pipeline over NLP accuracy
- Minimal UI

## Next steps (if more time)
- Risk scoring
- Webhooks
- Better UI