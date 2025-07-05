# ⚔️ Pok-League — Full Stack Multiplayer Pokémon Battle Platform

![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Go%20%2B%20WebSockets-blueviolet)
![Status](https://img.shields.io/badge/Status-Under%20Development-yellow)
![License](https://img.shields.io/github/license/Dushyant25609/Pok-League)
![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)

> Real-time Pokémon battles with Gen filters, rule customization, team draft, and intense 1v1 action — built for speed and scale.

---

## 🎮 Features

* 🧠 **Custom Battle Rooms** — Create/join battle rooms with rule configs like generation cap, type bans, legendary bans, etc.
* 🔥 **Real-time Drafting** — WebSocket-powered Pokémon selection with timeouts, auto-fill, and pagination.
* 🧪 **Dynamic Combat System** — Turn-based logic based on speed, type effectiveness, dodge chance, and miracle performance triggers.
* 🧬 **Smart Stat Tracking** — Tracks both `BaseStats` and live `PokemonStats` (wins/losses/total battles).
* 📊 **Clean Backend API** — Built with Go + Gin + GORM for blazing fast, scalable performance.
* 🕹️ **Frontend-Ready** — Designed a Next.js frontend with room codes, lobbies, and battles.

---

## 📂 Project Structure

```bash
Pok-League/
│
├── backend/                # Go (Gin) backend with GORM ORM
│   ├── cmd/                # main.go
│   ├── models/             # Pokémon, Stats, Rooms
│   ├── routes/             # Auth, Battle, Pokémon APIs
│   ├── websocket/          # Real-time multiplayer battle handling
│   ├── database/           # Connecting the database
│   ├── controller/         # API function
│   ├── battle/             # Battle simulation logic
│   ├── config.go           # Loading env
│   └── utils/              # Helper functions
│
├── frontend/               # Next (TypeScript) with Framer Motion + SSR
│   ├── public/             # sound
│   └── src/                # All the main files
│       ├── app/            # Routes and pages
│       ├── components/     # Navbar, title
│       ├── constants/      # Values
│       ├── services/       # APIs
│       ├── hooks/          # Custom hooks
│       ├── lib/            # Helper functions
│       ├── motion/         # Framer motion
│       ├── store/          # Zustand
│       ├── types/          # Interfaces
│       └── assets/         # Background Image
│
└── README.md               # You're reading it :)
```

---

## 🚀 Getting Started

<details>
<summary>1. Clone the Repo</summary>

```bash
git clone https://github.com/Dushyant25609/Pok-League.git
cd Pok-League/backend
```

</details>

<details>
<summary>2. Configure Environment</summary>

```bash
# Create a .env file inside the backend folder
touch .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=pok_league
```

</details>

<details>
<summary>3. Run Backend</summary>

```bash
# Install Go dependencies
go mod tidy

# Run the server
go run main.go
```

</details>

<details>
<summary>⚙️ Database Setup (PostgreSQL)</summary>

```sql
CREATE DATABASE pok_league;
```

</details>

<details>
<summary>🌐 Frontend Setup (Next.js)</summary>

```bash
cd ../frontend
npm install
npm run dev
```

> App will run at: [http://localhost:3000](http://localhost:3000)

</details>

---

## 💡 Battle System Highlights

* 🔁 Turn order determined by probabilistic speed comparison
* 🧮 Damage calculation considers move type, HP, opponent type, and miracle chance
* 🛡️ Dodge/recover logic recalculated each turn
* 💾 Stats auto-updated after each battle: wins, losses, total, etc.
* 💬 Real-time updates via WebSockets

---

## 📦 Tech Stack (Updated)

* **Frontend:** Next.js, TypeScript, Tailwind CSS
* **Backend:** Go + Gin + GORM + WebSockets
* **Database:** PostgreSQL

---

## 🧑‍💻 Author

**Dushyant**
B.Tech CSE (2022–2026) | Pokémon Enthusiast
📫 [dushyant25609@gmail.com](mailto:dushyant25609@gmail.com)

---

## 🤝 Contributing

```bash
# Fork the repo
git clone https://github.com/your-username/Pok-League.git

# Make changes and open a PR 🚀
```
---

⭐️ Don't forget to **star** the repo if you like the project!
