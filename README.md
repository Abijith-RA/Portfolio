# ⚡ Abijith R A — Portfolio

[![Live Portfolio](https://img.shields.io/badge/Live_Site-abijithra.in-38bdf8?style=for-the-badge&logo=google-chrome&logoColor=white)](https://abijithra.in)
[![Build & Deploy](https://img.shields.io/github/actions/workflow/status/Abijith-RA/Portfolio/deploy.yml?style=for-the-badge&label=Deployment)](https://github.com/Abijith-RA/Portfolio/actions)
[![Supabase Active](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

A high-performance, data-driven personal portfolio website built with **React**, **Vite**, and **Supabase**. Features interactive 3D physics cards, a high-density neural network background, real-time database normalization, and optimized mobile performance.

---

## ✨ Features

- ⚡ **Instant Load (<50ms)**: Implements Stale-While-Revalidate caching via `localStorage` for zero-delay instant page rendering.
- 🎯 **100% Data-Driven Architecture**: Dynamically fetches profile info, projects, skills, education, and work experience from Supabase.
- 🌌 **Neural Network Physics Canvas**: High-density interactive particle node web rendered using 2D canvas with spatial grid bucketing and mobile 60fps optimizations.
- 🎮 **Interactive Skill Arena**: Physics-based floating skill bubbles with kinetic shockwave effects and collision mechanics (capped to 3 concurrent active shockwaves for phone performance).
- 📱 **Mobile & GPU Optimized**: Automatically disables touch-drag 3D tilt stuttering and simplifies heavy backdrop-filter blur on mobile viewports.
- ⏰ **Automated Database Keep-Alive**: Includes an automated daily GitHub Actions workflow (`keepalive.yml`) to prevent Supabase free-tier database deactivation.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite |
| **Styling & FX** | Vanilla CSS3, Glassmorphism, GPU-Accelerated 3D Perspective |
| **Database & API** | Supabase (PostgreSQL), Realtime API |
| **Icons & Visuals** | Lucide React, Custom Neural Favicon & Branding |
| **CI/CD & Hosting** | GitHub Pages, GitHub Actions, Custom Domain (`abijithra.in`) |

---

## 📂 Project Structure

```text
portfolio/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml          # GitHub Pages automated CI/CD deployment
│   │   └── keepalive.yml       # Daily Supabase heartbeat ping workflow
├── scripts/
│   └── keep-alive.js           # Database keep-alive heartbeat script
├── src/
│   ├── components/
│   │   ├── Hero.jsx            # Dynamic Hero section with reactive 3D parallax
│   │   ├── Navbar.jsx          # Glassmorphism header with view routing
│   │   ├── ProjectCard.jsx     # Homepage project card component
│   │   ├── ProjectsPage.jsx    # Standalone interactive Projects page
│   │   ├── SkillBubblesArena.jsx # Interactive skill physics canvas
│   │   ├── SkillsPage.jsx      # Standalone Skills page
│   │   └── NeuralBackground.jsx# GPU-optimized neural network canvas
│   ├── hooks/
│   │   ├── useSupabaseData.js  # Supabase fetching & data normalization layer
│   │   └── use3DTiltCard.js    # Cursor 3D tilt perspective hook
│   ├── App.jsx                 # View state management & routing entry point
│   ├── App.css                 # Master design system & responsive styling
│   └── main.jsx                # Application DOM mounting
├── public/
│   ├── favicon.png             # Custom neural logo tab icon
│   └── CNAME                   # Custom domain configuration (abijithra.in)
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Abijith-RA/Portfolio.git
cd Portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 📄 License

Created by **Abijith R A**. All rights reserved.
