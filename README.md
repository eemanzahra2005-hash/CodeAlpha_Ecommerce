# 🛍️ CodeAlpha Store - Full Stack E-Commerce Website

A modern, responsive e-commerce web application built as part of the **CodeAlpha Web Development Internship**.

## 🌟 Features

- 🛍️ **Product Catalog** - Browse products with images and prices from Supabase database
- 🛒 **Shopping Cart** - Add, remove, and update quantities with live total calculation
- 💰 **Tax Calculation** - Automatic 10% tax on subtotal
- 🔐 **User Authentication** - Secure signup and login using Supabase Auth
- 👤 **Persistent Login** - User state maintained across sessions
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🎨 **Professional UI** - Modern design with smooth animations

## 🛠️ Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript, Google Fonts (Poppins)

**Backend:** Node.js, Express.js, CORS middleware

**Database & Auth:** Supabase (PostgreSQL + Authentication)

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Fetch all products |
| POST | `/signup` | Create new user account |
| POST | `/login` | Authenticate user |
| POST | `/logout` | Log out current user |
| GET | `/me` | Get current user info |

## ⚙️ Setup Instructions

1. Clone the repository
2. Install dependencies: `cd backend && npm install`
3. Create `.env` file with Supabase credentials
4. Start server: `npm start`
5. Open `frontend/index.html` with Live Server

## 👨‍💻 Developer

**Eeman Zahra** - CodeAlpha Web Development Internship