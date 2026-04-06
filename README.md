# TaxPal 💰

A full-stack tax management web application that helps users track income, expenses, budgets, generate reports, and estimate taxes.

## Tech Stack

**Frontend**
- React 19, Vite
- React Router DOM
- Recharts (charts)
- Axios
- jsPDF (PDF export)
- XLSX (Excel export)
- Lucide React (icons)

**Backend**
- Node.js, Express
- MySQL2
- JWT Authentication
- Bcrypt
- Nodemailer

## Features

- User authentication (signup, login, forgot password)
- Dashboard with income/expense overview
- Transaction management
- Budget tracking
- Category management
- Tax estimator
- Tax calendar events
- Reports with PDF/Excel export
- Email notifications
- User settings (currency, language, notification preferences)

## Project Structure

```
Tax-Estimator/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API routes
│   ├── utils/          # Email utilities
│   ├── database/       # SQL schema
│   └── server.js
└── frontend/
    └── src/
        ├── api/        # Axios API calls
        ├── components/ # React components
        └── utils/
```

## Getting Started

### Prerequisites
- Node.js
- MySQL (MySQL Workbench)

### Database Setup
1. Open MySQL Workbench
2. Run `backend/database/taxpal.sql` to create the database and all tables

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=taxpal
JWT_SECRET=your_jwt_secret_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.
