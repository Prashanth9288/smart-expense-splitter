# Splitwise Clone (Rudo Wealth)

A full-stack expense sharing application built with Node.js, Express, React, and Firebase.

## Features

- **Group Management:** Create groups and add members.
- **Expense Tracking:** Add expenses with Equal, Percent, or Exact split methods.
- **Debt Simplification:** Algorithm to minimize total transactions within a group.
- **Real-time Updates:** Powered by Firebase Firestore.
- **Modern UI:** Glassmorphism design with Dark Mode support (system default).
- **Authentication:** Google Sign-In via Firebase Auth.

## Tech Stack

- **Frontend:** Vite + React, CSS Variables (HSL), Firebase SDK.
- **Backend:** Node.js, Express, Firebase Admin SDK.
- **Database:** Firestore (NoSQL).
- **DevOps:** Docker, Github Actions.

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Firebase Project (with Auth & Firestore enabled)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd rudo-wealth
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   # Place your serviceAccountKey.json in /backend
   # Create .env file with:
   # PORT=5001
   # FIREBASE_PROJECT_ID=your-project-id
   # GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   # Create .env file with VITE_FIREBASE_... keys
   npm run dev
   ```

4. **Access the App**
   Open `http://localhost:5173`.

## API Documentation

### Groups

- `GET /api/groups` - List user's groups.
- `POST /api/groups` - Create a group.

### Expenses

- `POST /api/expenses` - Add a new expense.
- `GET /api/groups/:id/expenses` - List expenses.

### Settlement

- `GET /api/simplify?scope=group&groupId=:id` - Get suggested payments.
- `POST /api/settlements` - Record a payment.

## Testing

Run unit tests for business logic:

```bash
cd backend
npm test
```
