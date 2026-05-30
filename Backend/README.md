# Backend Guide

## What is this?

The **backend** is the engine that runs behind the Emergency Blood Connector app. It stores data, checks who you are, and decides what you can do. Think of it as the kitchen where the orders from the web page are prepared and sent back.

## How is it built?

- **Node.js** – The JavaScript runtime that lets us run code on the server.
- **Express** – A lightweight framework that helps us define routes like `GET /api/seeker/profile`.
- **MongoDB (Mongoose)** – A simple document database where users, blood requests and notifications are saved.
- **Socket.io** – Enables real‑time push messages (e.g., SOS alerts) to all connected browsers.
- **JSON Web Tokens (JWT)** – A secure way to remember who you are after you log in.
- **Helmet, CORS, Morgan** – Small helpers that make the app safer and easier to debug.
- **Rate Limiter** – Stops anyone from spamming the server.

## Folder layout (simplified)

```
backend/
├─ config/            # Database connection and socket.io helpers
├─ controllers/       # The "brain" – what each request does
├─ middleware/        # Pieces that run before a request (auth, role checks, error handling)
├─ models/            # Mongoose schemas for User, BloodRequest, etc.
├─ routes/            # URL definitions – which controller handles which path
├─ utils/             # Small reusable functions (token creation, email/FCM sending)
├─ server.js          # Starts Express, loads routes, and launches socket.io
└─ .env               # Configuration values (port, database URL, secret key)
```

## Key pieces you’ll see

| Piece | What it does |
|-------|--------------|
| `auth.controller.js` | Registers new users, logs them in, creates a JWT, and returns your profile when asked. |
| `seeker.controller.js` | Handles everything a blood‑seeker can do: create a request, view their own requests, edit, cancel, raise an SOS, see a dashboard, and **get their profile** (`getProfile`). |
| `socket.js` | Starts Socket.io and lets us broadcast a message to everyone in a specific city (used for SOS alerts). |
| `auth.middleware.js` | Looks at the `Authorization: Bearer <token>` header, verifies the token and attaches the user to `req.user`. |
| `role.middleware.js` | Makes sure only users with the right role (`seeker`, `admin`, etc.) can hit certain routes. |
| `rateLimiter.js` | Limits how often an endpoint can be called (e.g., SOS can only be triggered a few times per minute). |

## How to run it locally

1. **Open a terminal** and go to the `Backend` folder.
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create a `.env` file** (copy from `.env.example` if you have one) and fill in:
   ```
   PORT=5001                     # the port the server will listen on
   MONGO_URI=mongodb://127.0.0.1:27017/emergency_blood_db   # your local MongoDB
   JWT_SECRET=your_super_secret_jwt_key_here                # any random string
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000   # where the frontend lives (used for CORS)
   ```
4. **Make sure MongoDB is running** – start `mongod` or use a local GUI like Compass.
5. **Start the server**
   ```bash
   npm start   # runs `node server.js`
   ```
   The API will be reachable at `http://localhost:5001/api`.
6. **Optional – live‑reload** – if you have `nodemon` installed, you can run:
   ```bash
   npx nodemon server.js
   ```
   The server will restart automatically when you change a file.
7. **Test the endpoints** – use Postman, Insomnia, or curl. Example to check the profile after you have a JWT:
   ```bash
   curl -H "Authorization: Bearer <your‑jwt>" http://localhost:5001/api/seeker/profile
   ```

## What happens when you use it?

- **Login** – you send email + password to `POST /api/auth/login`. The server verifies you, creates a JWT and sends it back. The frontend stores that token.
- **Every other request** – the token is sent in the `Authorization` header. `auth.middleware` checks it and makes `req.user` available to the controller.
- **Seeker profile** – the new `GET /api/seeker/profile` endpoint simply reads the user document (without the password) and returns it. The frontend calls this to fill the profile page.
- **Dashboard** – `GET /api/seeker/dashboard` counts how many requests you have (total, pending, completed, SOS) and also sends back your basic user data for a quick overview.
- **SOS** – when a seeker marks a request as an SOS, the controller updates the request, marks it critical, and then calls `triggerSOSAlerts`. This function:
  1. Emits a socket event to all users in the same city.
  2. Sends a notification to every hospital and donor in that city.
  3. Shows a toast on the frontend.
- **Error handling** – any error thrown inside a controller is caught by the central `errorHandler`. It turns the error into a clean JSON response and logs the stack trace.

## Quick tips for newcomers

- **Read the routes first** – open `backend/routes/seeker.routes.js` to see which URLs exist and which controller functions they call.
- **Controllers are the business logic** – the real work happens in files like `seeker.controller.js`. If you need a new feature, add a function here and wire it up in the routes.
- **Models define the data shape** – look at `models/User.js` and `models/BloodRequest.js` to understand what fields are stored.
- **Socket.io is optional for basic features** – you can comment out the socket code if you just want a plain REST API.
- **Use the .env file** – never hard‑code URLs or secrets. The app reads everything from environment variables, which makes it easy to change ports or move to production.

---

That’s it! With these guides you should be able to start, understand, and extend both the frontend and backend of the Emergency Blood Connector project.
