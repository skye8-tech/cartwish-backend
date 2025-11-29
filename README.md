# CartWish Backend

A Node.js/Express backend application for CartWish, featuring user authentication, product management, shopping cart functionality, and social login integration.

## Prerequisites

-   Node.js (v14 or higher)
-   npm (Node Package Manager)
-   MongoDB
-   Git

## Installation

Follow these steps to set up and run the project:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cartwish-backend
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file to create your local environment configuration:

```bash
cp .env.example .env
```

Then, edit the `.env` file and fill in the required values:

```dotenv
NODE_ENV=development
PORT=3000

JWT_KEY=your_jwt_secret_key_here
JWT_EXPIRATION_DURATION="1d"

ROUTE_LIST=1

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback
```

**Important Configuration Notes:**

-   `JWT_KEY`: Generate a secure secret key for JWT token signing
-   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Obtain from [Google Cloud Console](https://console.cloud.google.com/)
-   `FACEBOOK_APP_ID` & `FACEBOOK_APP_SECRET`: Obtain from [Facebook Developers](https://developers.facebook.com/)
-   Update callback URLs if your application runs on a different host/port

### 4. Start the Project

Run the development server with automatic restart on file changes:

```bash
npm start
```

The server will start and listen on the port specified in your `.env` file (default: `3000`).

You should see output indicating the server is running.

## Available Scripts

-   `npm start` - Start the development server with nodemon (auto-restart on file changes)
-   `npm test` - Run the application (uses Node directly)

## Project Structure

```
cartwish-backend/
├── config/              # Configuration files
│   └── passport.js     # Passport.js authentication strategies
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication middleware
│   └── checkRole.js    # Role-based authorization
├── models/             # MongoDB schema models
│   ├── cart.js
│   ├── category.js
│   ├── products.js
│   └── users.js
├── routes/             # API route handlers
│   ├── auth.js
│   ├── cart.js
│   ├── category.js
│   ├── products.js
│   └── users.js
├── upload/             # File upload directories
│   ├── category/
│   └── products/
├── index.js            # Application entry point
├── helper.js           # Helper utilities
├── package.json        # Project dependencies
└── .env.example        # Example environment variables
```

## Key Features

-   User authentication with JWT
-   Social login (Google OAuth2, Facebook)
-   Role-based access control
-   Product and category management
-   Shopping cart functionality
-   File upload support
-   Request validation with Joi
-   Logging with Winston
-   MongoDB integration

## Dependencies

-   **express** - Web framework
-   **mongoose** - MongoDB object modeling
-   **jsonwebtoken** - JWT authentication
-   **bcrypt** - Password hashing
-   **passport** - Authentication middleware
-   **passport-google-oauth2** - Google OAuth strategy
-   **passport-facebook** - Facebook OAuth strategy
-   **joi** - Data validation
-   **multer** - File upload handling
-   **dotenv** - Environment variable management
-   **winston** - Logging
-   **winston-mongodb** - MongoDB transport for Winston
-   **nodemon** - Development auto-restart utility

## Development

During development, the server automatically restarts when you make changes to your code thanks to nodemon.

## Troubleshooting

-   **Port Already in Use**: Change the `PORT` in your `.env` file to an available port
-   **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
-   **Authentication Issues**: Verify your JWT_KEY and social login credentials in `.env`

## License

ISC

## Support

For issues or questions, please contact the development team or create an issue in the repository.
