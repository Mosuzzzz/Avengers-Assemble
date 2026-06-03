# Avengers-Assemble

A full-stack mission management web application built for the **Internet Programming** subject at RMUTI. Users ("Brawlers") can register, create missions, and assemble crews to join them.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Language | Rust |
| Web Framework | Axum |
| ORM | Diesel |
| Database | PostgreSQL |
| Frontend Framework | Angular 21 |
| UI Components | Angular Material + TailwindCSS |
| Image Storage | Cloudinary |
| Auth | JWT (Access + Refresh tokens) + Argon2 |

## Architecture

The server follows a clean layered architecture:

```
server/src/
├── domain/          # Entities, repository traits, value objects
├── application/     # Use cases (business logic)
├── infrastructure/  # HTTP routers, DB repos, JWT, Cloudinary, Argon2
└── config/          # Environment config loader
```

The Angular client uses interceptors for JWT injection, loading state, and error handling, with route guards protecting authenticated pages.

## Features

- **Brawler (User)**: Register, login, upload avatar, update display name
- **Missions**: Create, edit, soft-delete missions (chief only)
- **Mission Viewing**: Browse and filter available missions
- **Crew Operations**: Join or leave a mission (max 10 members per mission)
- **Profile**: View your own created missions and crew memberships

## API Routes

All API routes are prefixed with `/api`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/brawler/register` | No | Register a new brawler |
| POST | `/api/authentication/login` | No | Login and receive JWT |
| GET | `/api/brawler/my-missions` | Yes | Get the authenticated brawler's missions |
| POST | `/api/brawler/avatar` | Yes | Upload avatar (base64) |
| POST | `/api/brawler/display-name` | Yes | Update display name |
| GET | `/api/view/{mission_id}` | Yes | Get a single mission |
| GET | `/api/view/crew/{mission_id}` | Yes | Get crew members of a mission |
| GET | `/api/view/filter` | Yes | Filter/list available missions |
| POST | `/api/mission-management/` | Yes | Create a new mission |
| PATCH | `/api/mission-management/{mission_id}` | Yes | Edit a mission |
| DELETE | `/api/mission-management/{mission_id}` | Yes | Remove a mission |
| POST | `/api/crew/join/{mission_id}` | Yes | Join a mission |
| DELETE | `/api/crew/leave/{mission_id}` | Yes | Leave a mission |

## Database Schema

```sql
brawlers       (id, username, password, display_name, avatar_url, created_at, updated_at)
missions       (id, name, description, status, chief_id, created_at, updated_at, deleted_at)
crew_memberships (mission_id, brawler_id, joined_at)
```

## Getting Started

### Prerequisites

- Rust (edition 2024)
- PostgreSQL
- Diesel CLI (`cargo install diesel_cli --no-default-features --features postgres`)
- Node.js + npm
- A [Cloudinary](https://cloudinary.com/) account

### Backend Setup

1. Clone the repository and navigate to the server directory:
   ```bash
   cd server
   ```

2. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `SERVER_PORT` | Port to listen on (default: 8080) |
   | `SERVER_BODY_LIMIT` | Request body limit in MB |
   | `SERVER_TIMEOUT` | Request timeout in seconds |
   | `JWT_USER_SECRET` | Secret for access tokens |
   | `JWT_USER_REFRESH_SECRET` | Secret for refresh tokens |
   | `JWT_TTL` | Token lifetime in days |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |
   | `MAX_CREW_PER_MISSION` | Maximum crew per mission (default: 10) |

3. Run database migrations:
   ```bash
   diesel migration run
   ```

4. Build and run the server:
   ```bash
   cargo run
   ```

   The server will start on `http://localhost:8080`.

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd Avengers-Assemble-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The client will be available at `http://localhost:4200`.

### Production Build

Build the Angular client and place the output in `server/statics/` so the Axum server can serve it as static files:

```bash
cd Avengers-Assemble-client
npm run build
cp -r dist/client/browser/* ../server/statics/
```

Then run `cargo run` from the `server/` directory — the app will be served entirely from port 8080.

## Client Routes

| Path | Auth Required | Description |
|---|---|---|
| `/` | No | Home / landing page |
| `/login` | No | Login and register |
| `/missions` | Yes | Browse and join missions |
| `/chief` | Yes | Manage your own missions |
| `/profile` | Yes | View and edit your profile |
