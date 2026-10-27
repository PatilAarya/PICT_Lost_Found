# PICT Lost & Found

A web app for PICT students, staff and the security desk. People report lost items, post found items, get matched automatically, prove ownership, and collect the item at the desk. Everything is recorded, so there is a clear history of each item.

## Setup (Windows PowerShell)

You need Node.js 20 or newer and MongoDB running locally (or a MongoDB Atlas address).

```powershell
git clone <repo-url>
cd PICT_Lost_Found
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Open http://localhost:5173. In development, use the "Act as" dropdown to log in as a seeded
student, handler or admin, or log in by email: the code is printed in the server terminal.

Edit `.env` if your MongoDB address is different. Never commit `.env`.

## Scripts

| Command          | What it does                                    |
| ---------------- | ----------------------------------------------- |
| `npm run dev`    | Starts the server (port 4000) and client (5173) |
| `npm run seed`   | Adds demo users and data (safe to run again)    |
| `npm test`       | Runs server and client tests                    |
| `npm run lint`   | Checks code for mistakes                        |
| `npm run format` | Formats all files with Prettier                 |
| `npm run build`  | Builds the client for production                |

## Read next

- [DESIGN.md](DESIGN.md): look and feel
- [docs/explain/README.md](docs/explain/README.md): how the repo works
- [docs/CONTRACT.md](docs/CONTRACT.md) and [docs/OWNERSHIP.md](docs/OWNERSHIP.md): rules between modules
