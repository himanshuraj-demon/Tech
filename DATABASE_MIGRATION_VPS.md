# Local VPS Containerized Database Setup & Data Restore Guide

This guide details the containerized PostgreSQL database setup, network isolation architecture, environment configuration, and instructions to restore all backup data at any time without errors.

---

## 1. Network & Container Architecture

- **PostgreSQL Container (`db`)**:
  - Image: `postgres:16-alpine`
  - Container Name: `tech-db`
  - Connected strictly to **`backend-db-network`** (an `internal: true` bridge network).
  - **No published host ports**: Port `5432` is NOT mapped to the host (`ports:` is omitted), preventing any external connections from the host or internet.
  - Persistent volume: `tech-db-data` mounted at `/var/lib/postgresql/data`.
  - Health check: `pg_isready` verifies database readiness before `backend` starts.

- **Backend Container (`backend`)**:
  - Container Name: `tech-backend`
  - Connected to both **`backend-db-network`** (to reach `db:5432`) and **`public-network`** (to expose port `3605`).
  - Depends on `db` with `condition: service_healthy`.

- **Frontend Container (`frontend`)**:
  - Container Name: `tech-frontend`
  - Connected only to **`public-network`**. It has zero network access to `db`.

---

## 2. Environment Variables

Both [`.env`](file:///d:/Himanshu/reactjs/projectsreact/Tech/.env) and [`backend/.env`](file:///d:/Himanshu/reactjs/projectsreact/Tech/backend/.env) are configured for the local container database:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_secure_tech2026
POSTGRES_DB=techcouncil

# Internal Docker network connection string (used by backend container):
DATABASE_URL=postgresql://postgres:postgres_secure_tech2026@db:5432/techcouncil?sslmode=disable
```

---

## 3. Starting the Containers

On your VPS, start the stack:

```bash
docker compose up -d --build
```

Check running services:

```bash
docker compose ps
```

---

## 4. Restoring All Backup Data Anytime

The restore script ([`backend/scripts/restore.mjs`](file:///d:/Himanshu/reactjs/projectsreact/Tech/backend/scripts/restore.mjs)) automatically:
1. Connects to the database (handles SSL flags automatically).
2. Automatically executes `CREATE TABLE IF NOT EXISTS` for all 11 tables matching the schema.
3. Automatically applies column migration checks (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) so it will never fail with "table does not exist" or "column does not exist".
4. Cleans old data with `TRUNCATE TABLE ... CASCADE` to prevent primary key collisions.
5. Ingests all 11 backup files from `backend/backups` / `backend/backup` in batches of 50.
6. Verifies and displays the final row counts for all tables.

### Option A: Restore inside the running backend container (Recommended)
```bash
docker compose exec backend npm run db:restore
```
*(or `docker compose exec backend node scripts/restore.mjs`)*

### Option B: Run as a one-off temporary container
```bash
docker compose run --rm backend npm run db:restore
```

---

## 5. Backing up Data Anytime

To take fresh backups of all tables from the database:

```bash
docker compose exec backend npm run db:backup
```
The backed up JSON files will be updated in `backend/backups` and `backend/backup`.
