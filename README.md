# DriveSure

A full-stack MERN management system for a car insurance company. It includes JWT authentication, customer and vehicle records, policy management, claim tracking, payment collection, dashboard statistics, PDF policy certificates, and a Postman collection.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Axios, React Router, Lucide icons
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, PDFKit
- Database: MongoDB with Mongoose models

## Project Structure

```text
car-insurance-management-system/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    uploads/
    .env
    package.json
    seed.js
    server.js
  frontend/
    src/
      api/
      components/
      pages/
      App.jsx
      main.jsx
      index.css
    tailwind.config.js
    package.json
    vite.config.js
  database/
    insurance.sql
  README.md
  postman_collection.json
```

## Setup

1. Configure MongoDB. The backend can use MongoDB Atlas through `MONGO_URI` in `backend/.env`.

2. Install and run the backend:

```bash
cd backend
npm install
npm run seed
npm run dev
```

3. Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Open the frontend at:

```text
[http://localhost:5173](https://car-insurance-frontend-4x9z.onrender.com)
```

Default seeded login:

```text
Email: admin@autosure.com
Password: password123
```

## Environment

Backend `.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/car_insurance_management
DNS_SERVERS=8.8.8.8,1.1.1.1
JWT_SECRET=change_this_secret_for_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-gmail-address@gmail.com
SMTP_FROM_NAME=DriveSure
```

Optional frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Render deployment variables:

```env
CLIENT_URL=https://car-insurance-frontend-4x9z.onrender.com
VITE_API_URL=https://car-insurance-backend-bxnz.onrender.com/api
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
FIELD_ENCRYPTION_KEY=<long random encryption key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your Gmail address>
SMTP_PASS=<your Gmail app password>
SMTP_FROM=<your Gmail address>
SMTP_FROM_NAME=DriveSure
```

For Gmail SMTP, use a Google App Password, not the normal Gmail login password.

## API Modules

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET|POST /api/customers`
- `GET|PUT|DELETE /api/customers/:id`
- `GET|POST /api/vehicles`
- `GET|PUT|DELETE /api/vehicles/:id`
- `GET|POST /api/policies`
- `GET|PUT|DELETE /api/policies/:id`
- `GET /api/policies/:id/pdf`
- `GET|POST /api/claims`
- `GET|PUT|DELETE /api/claims/:id`
- `GET|POST /api/payments`
- `GET|PUT|DELETE /api/payments/:id`

## Notes

The app uses MongoDB as requested. The `database/insurance.sql` file is a relational reference schema included to match the provided folder structure.
If the Atlas connection fails, open MongoDB Atlas Network Access and allow your current IP address.

# car-insurance-company
