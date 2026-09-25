# Electricity Calculator ⚡

A eb application for tracking electricity meter readings and simulating/comparing tariff proposals from energy suppliers in the liberalized Portuguese market.

---

## 🚀 Features

- **Secure Authentication**: Protected access with user credentials powered by PocketBase.
- **Meter Readings Management**:
  - Historical reading records supporting time-of-use tariffs: **Off-peak (Vazio)**, **Peak (Ponta)**, and **Half-peak (Cheia)** (plus Total).
  - Automatic consumption delta calculation between successive readings.
  - Add, edit, and delete readings with notes.
- **Multiple Consumption Calculation Methods**:
  - **All-Time**: Weighted average across the full recorded history.
  - **Last 12 Months**: Annualized consumption analysis based on the most recent year.
  - **Last 6 Months**: Half-year seasonal trend.
  - **Year to Date (YTD)**: Calendar year-to-date average.
  - **Manual**: Simulate custom monthly consumption (kWh) while preserving historical consumption ratios across tariff slots.
  - Fixed 30-day billing cycle.
- **Supplier Proposal Comparator**:
  - Register proposals with:
    - Contracted power level (`power_kva`).
    - Power charges: Network Access Tariffs (TAR) + Supplier component (with respective VAT rates).
    - Energy charges: Network Access Tariffs (TAR) + Supplier component (with respective VAT rates).
    - Indexed vs. fixed tariff toggle.
  - Filter proposals by contracted power (e.g., 3.45 kVA, 6.9 kVA, etc.).
  - Side-by-side estimated monthly bill simulation with itemized costs and VAT breakdown (6% and 23%).
  - Automatic highlight of the most cost-effective option (**Best Choice**).
  - Status management (active and archived proposals).

---

## 🛠️ Tech Stack

- **Frontend & SSR**: [SvelteKit](https://kit.svelte.dev/) with [Svelte 5](https://svelte.dev/) (Runes).
- **UI Components**: [WebAwesome](https://awesome.me/webawesome) and custom `Grid.svelte` component for layout structuring.
- **Backend & Database**: [PocketBase](https://pocketbase.io/) (Embedded SQLite, authentication, and REST API).
- **Language**: TypeScript.
- **Package Manager**: PNPM.
- **Containerization & Deployment**: Docker, Docker Compose (optimized for [Coolify](https://coolify.io/)).

---

## 📁 Project Structure

```text
├── pocketbase/             # PocketBase binary, migrations, and database
│   ├── pb_migrations/      # Collection schemas and default seed user
│   ├── pb_data/            # Local SQLite database files
│   └── Dockerfile          # PocketBase container definition
├── src/
│   ├── components/         # Shared components (Grid, Header, etc.)
│   ├── css/                # Modular stylesheets
│   ├── lib/
│   │   ├── calculator.ts   # Consumption and bill calculation formulas
│   │   ├── pocketbase.ts   # PocketBase client and auth session helpers
│   │   └── types.ts        # TypeScript definitions
│   └── routes/             # SvelteKit routes (login, readings, dashboard)
├── docker-compose.yml      # Orchestration for PocketBase and Web app
├── Dockerfile              # SvelteKit production image (Node.js)
└── package.json
```

---

## ⚙️ Setup and Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Copy the sample environment file `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default settings:
```env
POCKETBASE_URL=http://127.0.0.1:8090
PORT=3000
```

### 3. Start PocketBase

In a terminal, start the local PocketBase instance (migrations will apply automatically):

```bash
pnpm dev:pb
```

PocketBase will be running at `http://127.0.0.1:8090` (Admin UI at `http://127.0.0.1:8090/_/`).

> **Pre-configured test user:**
> - **Email**: `admin@local.host`
> - **Password**: `password123456`

### 4. Start the Web Development Server

In a separate terminal:

```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🐳 Running with Docker

Run the complete stack (SvelteKit + PocketBase) using Docker Compose:

```bash
docker compose up -d --build
```

- Web App: `http://localhost:3000`
- PocketBase: `http://localhost:8090`

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts the SvelteKit development server with HMR |
| `pnpm dev:pb` | Launches the local PocketBase server with migrations |
| `pnpm build` | Builds the production bundle |
| `pnpm preview` | Previews the production build locally |
| `pnpm check` | Runs SvelteKit sync and TypeScript diagnostics |

---

## 📄 License

This project is licensed under the [MIT License](file:///home/emanuelsaramago/www/electricity-calculator/LICENSE).
