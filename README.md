# Petfolio

A private Adopt Me pet price tracker with a React/Vite admin client, Express API, Supabase Postgres, and Supabase Storage. It is intentionally admin-only: there is no storefront, checkout, public account system, or payment flow.

## Requirements

- Node.js 18+
- A Supabase project
- An admin password and JWT secret

## Setup

1. Create the database and storage bucket by opening Supabase SQL Editor and running [`supabase/schema.sql`](supabase/schema.sql).
2. Copy [`server/.env.example`](server/.env.example) to `server/.env` and fill in the Supabase URL, service role key, admin password, and a long random JWT secret.
3. Install all dependencies:

```bash
npm run install:all
```

4. Start the API and client together:

```bash
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:4000`.

## API and image security

The browser only talks to the Express API. The Supabase service role key stays in `server/.env`; it is never bundled into the client. Pet routes require a seven-day JWT. Images are uploaded by the API to the public `pet-images` bucket, while create/update/delete operations remain protected by the API middleware.

## Production deployment on Vercel

Deploy the client and API as two Vercel projects. This keeps the frontend build and Express API independently deployable while preserving the same `/api` routes.

### 1. Deploy the API

1. In Vercel, click **Add New... → Project** and import this repository/folder.
2. Set the project **Root Directory** to `server`.
3. Keep the framework as **Other** and leave the build command empty.
4. Add these Production environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-key
ADMIN_PASSWORD=your-private-admin-password
JWT_SECRET=your-long-random-secret
CLIENT_ORIGIN=https://your-client.vercel.app
```

5. Deploy and copy the API URL, for example `https://petfolio-api.vercel.app`.
6. Test `https://petfolio-api.vercel.app/api/health`; it should return `{ "ok": true }`.

The `server/api` files expose the Express app as Vercel serverless functions. Do not add `server/.env` to Vercel or commit it to Git.

### 2. Deploy the client

1. Create another Vercel project from the same repository.
2. Set its **Root Directory** to `client`.
3. Vercel should detect Vite automatically. The build command is `npm run build` and the output directory is `dist`.
4. Add this Production environment variable, using the API URL from the previous step:

```env
VITE_API_URL=https://petfolio-api.vercel.app/api
```

5. Deploy and open the generated client URL.
6. Update the API project's `CLIENT_ORIGIN` to the exact client URL and redeploy the API.

Before deploying, run:

```bash
npm run build
```

## Notes

- `price` is stored as a positive numeric value and supports PHP or USD.
- Replacing a pet image deletes the previous storage object.
- Deleting a pet also removes its associated storage object.
- The SQL trigger maintains `updated_at` automatically.
