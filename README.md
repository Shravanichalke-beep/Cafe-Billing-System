# ☕ Cafe Billing & Order Management System

A modern, full-stack web application designed to streamline cafe operations, order management, and billing. Built with a React (Vite) frontend and a Python (Flask) backend, this system provides a seamless experience for cafe staff to manage tables, take orders, and generate bills efficiently.

## 🌟 Features

- **Table Management**: Real-time tracking of table status (Available, Occupied).
- **Menu Management**: Full CRUD operations for menu categories and items.
- **Order Processing**: Intuitive interface to add items to a table's order and calculate totals dynamically.
- **Billing & Receipts**: Generate final bills, mark orders as paid, and export receipts as PDF files (ready for thermal POS printers).
- **Daily Reporting**: View daily sales reports and revenue summaries.
- **Authentication**: Secure JWT-based login system for staff members.
- **Modern UI**: Fully responsive, mobile-friendly design with TailwindCSS.

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS
- React Router DOM
- Axios
- jsPDF (for receipt generation)
- React Icons

**Backend:**
- Python 3
- Flask
- Flask-SQLAlchemy & PostgreSQL (Production) / SQLite (Development)
- Flask-JWT-Extended
- Flask-CORS
- Gunicorn (Production Server)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Local Development Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/cafe-billing-system.git
cd cafe-billing-system
```

**2. Start the Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
*The backend API will be running on `http://localhost:5000`*

**3. Start the Frontend**
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available on `http://localhost:5173`*

## ☁️ Deployment

This project is configured for cloud deployment:
- **Frontend** can be deployed on [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Ensure you set the `VITE_API_URL` environment variable to point to your live backend URL.
- **Backend** can be deployed on [Render](https://render.com) or Heroku using the provided `gunicorn` configuration in `requirements.txt`. Remember to set the `DATABASE_URL` and `JWT_SECRET_KEY` environment variables.

## 📄 License

This project is licensed under the MIT License.
