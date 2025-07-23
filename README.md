# Task manager

Work in progress.
Simple task manager with support for multiple users written in Typescript. Done as capstone project för a frontend development course, also added in backend development to show my potential for fullstack development and working with multiple packages in a monorepo.

## Installation

* Install Bun: [Instructions](https://bun.sh/install) For multiple platforms.
* Clone repo and enter it: `https://github.com/BlackestDawn/task-manager`
* Install dependencies. `bun install`
* Install or gain access to a Postgres server.

## Configuration

* Add `PLATFORM="DEV"` to a .env file.
* Add the database connection string to the .env file under `DB_URL`.
* Generate a random string and add it as `JWT_SECRET` to the .env file. On Linux you can use `openssl rand -base64 64`

## Usage

* Run: `bun run dev`
* Go to <http://localhost:5173/> for its web interface.

## Technologies and packages used

* [Bun](https://bun.sh/) For runtime and backend.
* [PostgreSQL](https://www.postgresql.org) As database
* [Drizzle-ORM](https://orm.drizzle.team/) For database connection and management
* [Vite](https://vite.dev/) For frontend testing and bundling
* [Zod](https://zod.dev) For type validation and type enforcement
