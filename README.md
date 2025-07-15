# Task manager

Simple task manager with support for multiple users written in Typescript. Done as capstone project för a frontend development course, also added in backend development to show my potential for fullstack development.

## Installation

* Install Bun: [Instructions](https://bun.sh/install) For multiple platforms.
* Clone repo and enter it: `https://github.com/BlackestDawn/task-manager`
* Add `PLATFORM="DEV"` to a .env file.
* Install or gain access to a Postgres database, and add its connection string to the .env file under DB_URL.
* Install dependencies. `bun install`
* Finally run: `bun run dev`

## Usage

Go to <http://localhost:5173/> for its web interface.

## Technologies and packages used

* [Bun](https://bun.sh/) For basics and webserver.
* [PostgreSQL](https://www.postgresql.org) As database
* [Drizzle-ORM](https://orm.drizzle.team/) For database connection and management
* [Vite](https://vite.dev/) For frontend testing and bundling
