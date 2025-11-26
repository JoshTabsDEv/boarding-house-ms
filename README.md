## Boarding House Management System

Simple, Vercel-ready Next.js app for managing boarding house listings with:

- Admin role (username `admin`, password `admin`) that can create, update, and delete listings.
- Residents authenticated via Google who can only view data (read-only dashboard).
- MySQL persistence using the `mysql2` driver (no Prisma).
- Tailwind CSS UI with role-aware dashboards.

## 1. Environment variables

Copy `env.example` to `.env` (or configure in Vercel) and set the following:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/boarding_house"
NEXTAUTH_SECRET="generate-a-random-string"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
```

> The Google credentials are required so the OAuth button can promote users into the `user` role automatically.

## 2. MySQL schema

Create a database (e.g., `boarding_house`) and the `listings` table:

```sql
CREATE TABLE listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  price INT NOT NULL,
  rooms INT NOT NULL,
  status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — the home page includes the admin credential form plus Google login for residents. Admin users see CRUD tools, while residents see a read-only list.

## 4. Deployment (Vercel)

1. Push the repo to GitHub/GitLab.
2. Create a new Vercel project.
3. Add the environment variables from step 1 in the Vercel dashboard.
4. Ensure your MySQL instance is reachable from Vercel (Neon PlanetScale, RDS, etc.).
5. Deploy — the production build needs no extra configuration.

## Tech stack

- Next.js App Router + React Server Components where possible
- NextAuth (credentials + Google OAuth, JWT sessions)
- Tailwind CSS
- MySQL via `mysql2/promise`
