# Task Manager

[![CI](https://github.com/BlackestDawn/task-manager/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/BlackestDawn/task-manager/actions/workflows/pr-checks.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](./LICENSE)

A full-stack task management application — Next.js frontend, Hono API backend, Postgres via Drizzle ORM — with fine-grained CASL-based permissions, a multi-layer automated test suite, and a Terraform-provisioned CI/CD pipeline deploying to Google Cloud Run.

Built solo as a self-directed learning project (frontend-first, backend and infrastructure picked up along the way), it's grown into a full production-shaped stack: real authentication and authorization, a real deployment pipeline, and a real testing discipline — including a genuine privilege-escalation vulnerability that automated testing caught and a fix verified, not just a coverage number chased for its own sake.

**Live demo:** [tasks.alexstauch.app](https://tasks.alexstauch.app) — seeded with an admin account (`admin` / `admin123`) so you can explore the permission model directly.

## 📑 Table of Contents

- [Highlights](#-highlights)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Testing & Quality](#-testing--quality)
- [CI/CD & Deployment](#-cicd--deployment)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Testing](#testing)
  - [Running with Docker](#running-with-docker)
  - [Adding Sample Data](#adding-sample-data)
- [License](#-license)

## ✨ Highlights

- **Multi-layer automated testing** — unit and component tests (Vitest + Testing Library), integration tests against a real disposable Postgres instance, and end-to-end tests (Playwright) that build and run production artifacts of both services. All run in CI on every PR.
- **Testing that finds real bugs, not just coverage** — this process caught and fixed a genuine privilege-escalation vulnerability (a non-admin user could promote themselves via a direct API call, bypassing UI-only restrictions), a runaway network-request loop in the auth provider, and several silent data-correctness bugs — each found via a real test failure, confirmed, and fixed with a regression test locked in.
- **CI/CD as a first-class concern** — five independent GitHub Actions jobs (build/lint/unit tests, integration tests, E2E tests, a Docker image smoke test, and coverage tracking), gating every pull request.
- **Coverage tracked as a ratchet, not a fixed threshold** — each PR's coverage is diffed against a rolling baseline captured from `main`, so it can only go up, without needing to hand-pick an arbitrary percentage.
- **Infrastructure as code** — GCP Cloud Run + Neon serverless Postgres provisioned via Terraform, with GitHub Actions authenticating via Workload Identity Federation (no long-lived cloud credentials).
- **Single source of truth for types, validation, and permissions** — Zod schemas define both compile-time types and runtime validation once, shared across frontend and backend; CASL abilities built from that same schema layer drive both API authorization and conditional UI rendering.

## 🛠️ Tech Stack

**Core**
- [Bun](https://bun.sh/) — runtime, bundler, and workspace package manager
- [TypeScript](https://www.typescriptlang.org/) — end-to-end, in strict mode
- [Next.js](https://nextjs.org/) — frontend, App Router, Server Actions
- [Hono](https://hono.dev/) — backend API framework
- [Drizzle ORM](https://orm.drizzle.team/) + Postgres — type-safe database access

**Validation & Authorization**
- [Zod](https://zod.dev/) — schema validation and type inference
- [CASL](https://casl.js.org/) — isomorphic permission/ability definitions

**Testing**
- [Vitest](https://vitest.dev/) — unit, component, and integration tests
- [Testing Library](https://testing-library.com/) — component/hook testing
- [Playwright](https://playwright.dev/) — end-to-end tests

**Infrastructure**
- [Terraform](https://www.terraform.io/) — GCP + Neon provisioning
- [Google Cloud Run](https://cloud.google.com/run) — container hosting
- [Neon](https://neon.tech/) — serverless Postgres
- [GitHub Actions](https://github.com/features/actions) — CI/CD
- [Docker](https://www.docker.com/) — containerized deployment and local dev

## 🏗️ Architecture

A Bun-workspaces monorepo with three packages:

```
task-manager/
├── packages/
│   ├── frontend/          # Next.js app (@task-manager/frontend)
│   │   └── src/{app,components,hooks,lib}
│   ├── backend/           # Hono API server (@task-manager/backend)
│   │   └── src/{api,db,lib}
│   └── common/            # Shared types, validation, permissions (@task-manager/common)
│       └── src/{types,permissions,classes,functions}
│
├── e2e/                    # Playwright end-to-end specs
├── deploy/                 # Terraform (GCP + Neon) and deployment docs
├── scripts/                # CI/local tooling (integration & E2E test runners, coverage)
└── .github/workflows/      # CI/CD pipelines
```

**Dependency flow:** `frontend → common ← backend`. All three packages depend on `common` for types, Zod schemas, and CASL permission definitions — nothing is duplicated or redefined between frontend and backend, so there's no drift between what's validated, what TypeScript thinks the shape is, and what a given role is allowed to do with it.

## 🧪 Testing & Quality

Tests live next to the code they cover (`*.test.ts`/`*.test.tsx`) and run via a single root Vitest config, with three additional tiers layered on top:

| Layer | Tool | What it covers |
| --- | --- | --- |
| Unit & component | Vitest + Testing Library | Business logic, permission checks, React components/hooks — mocked at the network boundary |
| Integration | Vitest against real Postgres | Drizzle query builders, run per-test inside a rolled-back transaction on an ephemeral Docker Postgres |
| End-to-end | Playwright | Full user flows (auth, tasks, groups, permission gating) against production builds of both services |
| Coverage | `@vitest/coverage-v8` | Diffed against a `main`-branch baseline on every PR (`scripts/compare-coverage.ts`) — regressions fail the build |

Run everything locally:

```bash
bun run test              # unit + component (fast, no DB)
bun run test:integration  # real Postgres, ephemeral Docker container
bun run test:e2e          # Playwright, builds and runs both services
bun run test:coverage     # unit + component with a coverage report
```

## 🚀 CI/CD & Deployment

Every pull request runs five independent GitHub Actions jobs (`.github/workflows/pr-checks.yml`): build/lint/unit tests, integration tests, end-to-end tests, a Docker image smoke test (builds and boots the actual images that ship), and coverage tracking.

```
merge to main ──▶ build & push images ──▶ deploy Cloud Run staging (backend + frontend)
                                                          │
                                              (manual trigger, approval gate)
                                                          ▼
                                    reuse backend image, rebuild frontend ──▶ deploy Cloud Run prod
```

Infrastructure — Cloud Run services, Neon Postgres branches, Workload Identity Federation — is provisioned via Terraform, not clicked together by hand. Full setup instructions: **[deploy/README.md](./deploy/README.md)**.

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) v1.3+
- [Docker](https://www.docker.com/) (for integration/E2E tests, and optionally for local dev)

### Installation

```bash
git clone git@github.com:BlackestDawn/task-manager.git
cd task-manager
bun install
cp env.example .env   # fill in DB_URL, PLATFORM, JWT_SECRET, etc.
```

**Note:** database migrations run automatically when the backend starts — no manual migration step needed. It also seeds an initial admin account (`admin` / `admin123`) if the database is empty.

### Development

```bash
bun run dev              # everything, via concurrently

# or individually — common needs building first so frontend/backend can import from it
bun run build:common
bun run dev:frontend
bun run dev:backend
```

### Testing

See [Testing & Quality](#-testing--quality) above for the full breakdown of `bun run test`, `test:integration`, `test:e2e`, and `test:coverage`.

### Running with Docker

```bash
./docker-manager.sh start     # start all services (frontend, backend, database)
./docker-manager.sh stop
./docker-manager.sh restart
./docker-manager.sh logs [service]
./docker-manager.sh health
./docker-manager.sh clean     # remove all containers and volumes
./docker-manager.sh help      # full command list, incl. db:backup/restore/shell
```

Or with Compose directly: `docker-compose up -d` / `docker-compose down` / `docker-compose logs -f`.

### Adding Sample Data

```bash
bun run dev:backend      # make sure the backend is running first
./sample-data.sh         # in another terminal
# or, if running via Docker:
./docker-manager.sh db:sample
```

Populates users at each access level, groups with mixed member roles, and tasks in various states — useful for exercising the permission model manually.

## 📝 License

[Creative Commons Attribution 4.0 International](./LICENSE) — see `LICENSE` for the full text.
