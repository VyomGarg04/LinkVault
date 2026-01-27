# 🔗 Link Vault

> **One Link to Rule Them All** - A smart, intelligent link hub generator for the modern web.

![Link Vault](https://img.shields.io/badge/Link%20Vault-Smart%20Links-10b981?style=for-the-badge&logo=link&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql)

## ✨ Features

### 🎨 Premium Themes
- Fully customizable aesthetics with glassmorphism support
- Custom background colors, fonts, and button styles
- Avatar upload with image cropping
- Live preview while editing

### 🧠 Smart Rules
- Show/hide links based on **time of day**
- Target specific **devices** (mobile/desktop)
- **Location-based** link visibility
- Priority-based rule ordering

### 📊 Instant Analytics
- Real-time click tracking
- Visitor statistics with device breakdown
- Geographic location insights
- Time-series visualization (7/30/90 day views)
- Top performing links dashboard

### 🔒 Secure Authentication
- JWT-based authentication with HTTP-only cookies
- Bcrypt password hashing
- Session management
- Secure API endpoints

### 🎭 Link Customization
- Individual link styling (colors, animations)
- Drag-and-drop link reordering
- Global style presets
- Animation effects (pulse, bounce, glow, shake)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Analytics visualization
- **DnD Kit** - Drag and drop functionality
- **React Hook Form** - Form management

### Backend
- **Node.js + Express** - REST API server
- **Prisma ORM** - Database management
- **PostgreSQL** - Production database
- **JWT** - Authentication tokens
- **Bcrypt** - Password encryption

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Neon** - PostgreSQL database

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VyomGarg04/LinkVault.git
   cd LinkVault
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables**

   Create `.env` in `/backend`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   PORT=3001
   JWT_SECRET="your-secret-key"
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

   Create `.env.local` in `/frontend`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
LinkVault/
├── frontend/                 # Next.js frontend
│   ├── app/                  # App router pages
│   │   ├── components/       # Reusable components
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── hubs/[id]/edit/   # Hub editor
│   │   ├── analytics/[id]/   # Analytics dashboard
│   │   └── [username]/[slug] # Public hub pages
│   ├── context/              # React contexts
│   ├── lib/                  # Utilities
│   └── types/                # TypeScript types
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation
│   │   ├── routes/           # API routes
│   │   └── config/           # Database config
│   └── prisma/               # Database schema
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Hubs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hubs` | List user's hubs |
| POST | `/api/hubs` | Create new hub |
| GET | `/api/hubs/:id` | Get hub details |
| PUT | `/api/hubs/:id` | Update hub |
| DELETE | `/api/hubs/:id` | Delete hub |

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hubs/:id/links` | Get hub's links |
| POST | `/api/hubs/:id/links` | Add link to hub |
| PUT | `/api/links/:id` | Update link |
| DELETE | `/api/links/:id` | Delete link |
| PUT | `/api/links/reorder` | Reorder links |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/:id` | Get hub analytics |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/:username/:slug` | View public hub |
| POST | `/api/public/links/:id/click` | Track link click |

## 🎯 Use Cases

- **Influencers** - Single bio link for all social platforms
- **Businesses** - Central hub for all company links
- **Developers** - Portfolio and project showcase
- **Content Creators** - Monetized link pages
- **Event Organizers** - Dynamic event links with time-based rules

## 📸 Screenshots

### Landing Page
Premium animated background with data flow visualization
![Landing Page](docs/screenshots/landing_page.png)

### Dashboard
Clean, modern interface for managing multiple hubs
![Dashboard](docs/screenshots/dashboard.png)

### Hub Editor
Drag-and-drop link management with live preview
![Hub Editor](docs/screenshots/hub_editor.png)

### Analytics
Comprehensive insights with beautiful charts
![Analytics](docs/screenshots/analytics.png)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Vyom Garg**
- GitHub: [@VyomGarg04](https://github.com/VyomGarg04)

---

<p align="center">
  <strong>Built with ❤️ for the modern web</strong>
</p>
