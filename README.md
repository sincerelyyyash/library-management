# Library Management System

## Project Overview

This project is a backend system for managing a library's books, users, and borrowing activities. It's built using Node.js, TypeScript, Express, and PostgreSQL with Prisma ORM.

## Features

- User Authentication (JWT-based)
- Role-based Access Control (Admin vs Member)
- Book Management
- Borrowing System
- Fine Management
- User Management
- Analytics and Reporting

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JSON Web Tokens (JWT)
- Zod (for input validation)

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/sincerelyyyash/library-management.git
   cd library-management
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   DATABASE_URL="postgres-db-url-here"
   JWT_TOKEN="secret-token-here"
   PORT=8000
   ```

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register`: Register a new user
- POST `/api/v1/auth/login`: Login user

### Book Management
- POST `/api/v1/book/add`: Add a new book (Admin only)
- GET `/api/v1/book/get-books`: Get all books
- GET `/api/v1/book/:isbn`: Get book by ISBN
- PUT `/api/v1/book/:isbn`: Update a book (Admin only)
- DELETE `/api/v1/book/:isbn`: Delete a book (Admin only)

### User Management
- GET `/api/v1/user/:userId`: Get user details
- GET `/api/v1/user/:userId/borrowed-books`: Get user's borrowed books
- PUT `/api/v1/user/:userId/status`: Enable/disable user account (Admin only)

### Borrowing
- POST `/api/v1/book/borrow`: Borrow a book
- POST `/api/v1/book/return`: Return a book

### Payments
- POST `/api/v1/payment/pay-fine`: Pay a fine
- GET `/api/v1/payment/generate-invoice`: Generate invoice for a user

### Analytics
- GET `/api/v1/analytics/monthly-report`: Generate monthly usage report (Admin only)

## Database Schema

The database includes tables for Users, Books, BorrowedBooks, Transactions, Categories, and Authors. Refer to the `prisma/schema.prisma` file for detailed schema information.

## Error Handling

Custom error handling is implemented using a centralized `ApiError` class.

## Input Validation

Input validation is performed using Zod schemas.

## Rate Limiting

Request rate limiting is implemented to prevent abuse.


## License

This project is licensed under the MIT License.
