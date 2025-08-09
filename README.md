# Task manager

Work in progress.
Task manager with support for multiple users and and groups. This project is done to showcase my skills in frontend and backend development.

It's written in Typescript and is structured as separate packages.

## Installation

* Install Bun: [Instructions](https://bun.sh/install) for multiple platforms.
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

* [Bun](https://bun.sh/) For backend handling and general runtime.
* [PostgreSQL](https://www.postgresql.org) As database
* [Drizzle-ORM](https://orm.drizzle.team/) For database connection and management
* [Vite](https://vite.dev/) For frontend handling
* [Zod](https://zod.dev) For type validation and type enforcement
* [CASL](https://casl.js.org) For authorization and permission handling
