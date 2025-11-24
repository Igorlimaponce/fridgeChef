# 🍳 Fridge Chef

**Fridge Chef** is your intelligent culinary companion designed to transform the way you cook and manage your kitchen. By leveraging Artificial Intelligence, it helps you turn available ingredients into delicious meals, manage your pantry, and plan your weekly nutrition effortlessly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/backend-Go-00ADD8.svg?logo=go&logoColor=white)
![React](https://img.shields.io/badge/frontend-React-61DAFB.svg?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791.svg?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/deploy-Docker-2496ED.svg?logo=docker&logoColor=white)

---

## 🚀 Features

### 🤖 AI Recipe Generator
Stop wondering "what's for dinner?". Select ingredients from your pantry, define your preferences (e.g., "low carb", "quick meal"), and let our AI Chef generate a complete, step-by-step recipe for you.

### 📦 Smart Pantry Management
Keep track of what you have at home.
- Add items with specific quantities and units (kg, g, L, ml, units).
- Easily remove items as you use them.
- See at a glance what's available for your next meal.

### 📅 Weekly Meal Planner
Organize your nutrition with an intuitive meal planner.
- Plan Breakfast, Lunch, Dinner, and Snacks for the entire week.
- Add your saved recipes directly to specific days.
- Visualize your culinary week to save time and reduce stress.

### 📚 Recipe Collection
- Save your favorite AI-generated recipes.
- View detailed instructions, ingredients, and calorie estimates.
- Share your culinary discoveries.

### 🌍 Multi-language Support
Fully localized for **English** and **Portuguese (Português)**.

---

## 🛠️ Tech Stack

### Backend
- **Language:** [Go (Golang)](https://go.dev/) 1.23+
- **Framework:** [Chi](https://github.com/go-chi/chi) (Lightweight, idiomatic router)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication:** JWT (JSON Web Tokens)
- **Migrations:** SQL-based migrations
- **Testing:** Testcontainers for integration testing

### Frontend
- **Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Icons:** Lucide React

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Makefiles for easy command execution

---

## 🏁 Getting Started

### Prerequisites
- [Go](https://go.dev/dl/) (if running locally without Docker)
- [Node.js](https://nodejs.org/) & [Bun](https://bun.sh/) (or npm/yarn)
- [Docker](https://www.docker.com/) & Docker Compose
- [Make](https://www.gnu.org/software/make/) (optional, but recommended)

### 🔧 Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/Igorlimaponce/fridgeChef.git
   cd fridgeChef
   ```

2. **Environment Setup**
   Create a `.env` file in the `backend` directory (copy from example if available) and configure your database credentials and OpenAI API key.

3. **Run with Docker (Recommended)**
   The easiest way to start the entire stack (Database, Backend, Frontend).
   ```bash
   docker-compose up --build
   ```

4. **Run Locally (Manual)**

   **Database:**
   ```bash
   make docker-run  # Starts PostgreSQL container
   make migrate-up  # Runs database migrations
   ```

   **Backend:**
   ```bash
   cd backend
   go run cmd/api/main.go
   ```

   **Frontend:**
   ```bash
   cd frontend
   bun install
   bun dev
   ```

### 📜 Make Commands
We provide a `Makefile` to simplify common tasks:

- `make all`: Build backend and run tests.
- `make build`: Build the backend binary.
- `make run`: Run the backend application.
- `make docker-run`: Start the database container.
- `make docker-down`: Stop the database container.
- `make migrate-up`: Apply database migrations.
- `make test`: Run unit tests.
- `make itest`: Run integration tests.

---

## 📂 Project Structure

```
fridge_chef/
├── backend/              # Go Backend
│   ├── cmd/api/          # Entry point
│   ├── internal/         # Application logic (Clean Architecture)
│   │   ├── chef/         # AI Recipe logic
│   │   ├── pantry/       # Pantry management
│   │   ├── recipe/       # Recipe management
│   │   ├── mealplan/     # Meal planning
│   │   └── database/     # DB connection & migrations
│   └── ...
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom React hooks (React Query)
│   │   └── services/     # API integration
│   └── ...
├── docker-compose.yml    # Docker orchestration
└── Makefile              # Task automation
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
