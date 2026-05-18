# BudgetWise – AI Personal Finance Tracker

BudgetWise is a full-stack AI-powered personal finance management application that helps users track income and expenses, visualize spending patterns, and receive intelligent budgeting suggestions.

## Features

- User registration and login with JWT authentication
- Add income and expense transactions
- Categorize and manage financial records
- Dashboard with total income, expenses, and balance
- Expense charts using Chart.js
- AI-powered budget suggestions using Google Gemini API
- Offline rule-based fallback when API quota is unavailable
- MongoDB Atlas cloud database

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- React Router DOM
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Google Gemini API

## Project Structure

```
budgetwise/
├── frontend/        # React + Vite frontend
├── server.js        # Express server
├── ai.js            # AI suggestions route
├── transactions.js  # Transaction routes
├── auth.js          # Authentication routes
├── db.js            # MongoDB connection
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gauravkumar42/budgetwise-ai-finance-tracker.git
cd budgetwise-ai-finance-tracker
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Create `.env`

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Backend

```bash
npm run dev
```

### 6. Run the Frontend

```bash
cd frontend
npm run dev
```

### 7. Open the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## AI Suggestions

BudgetWise uses Google Gemini API to generate personalized budgeting recommendations based on the user's financial data. If the API is unavailable or quota is exceeded, the application automatically switches to an offline rule-based suggestion engine.

## Future Improvements

- Monthly budget goals
- Export transactions to CSV/PDF
- Dark mode
- Recurring transactions
- Mobile responsive enhancements

## Author

**Gaurav Kumar**

- GitHub: https://github.com/gauravkumar42
- Email: gauravkumar95692@gmail.com

## License

This project is for educational and portfolio purposes.
