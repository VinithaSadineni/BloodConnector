# Frontend Guide

## What is this?

This is the **user‑facing part** of the Emergency Blood Connector app. It is a web page you open in a browser, where people can look at their profiles, create blood‑request posts, and see updates instantly.

## How is it built?

- **React** – Think of it as LEGO blocks that let us build interactive pages.
- **Vite** – A tool that makes the development experience super fast (you get instant feedback when you change code).
- **Tailwind CSS** – A set of ready‑made style pieces so the app looks clean and modern without writing a lot of CSS.
- **Framer Motion** – Tiny animations that make the UI feel smooth.
- **React‑Hook‑Form + Zod** – Simple ways to create forms and make sure the data entered is correct.
- **Axios** – The messenger that talks to the backend server.
- **Zustand** – A small place to keep global data like "who is logged in?".

## Folder layout (simplified)

```
frontend/
├─ src/
│  ├─ components/   # Buttons, cards, avatars, etc.
│  ├─ pages/        # Whole pages (Dashboard, Profile …)
│  ├─ services/     # Functions that call the backend API
│  ├─ store/        # Global state (who is logged in)
│  ├─ lib/          # Axios setup – adds the JWT token automatically
│  └─ main.jsx      # Starts the app
└─ .env              # Tells the app where the backend lives
```

## How to get it running on your computer

1. **Open a terminal** and go to the `Frontend` folder.
2. **Install everything** – run:
   ```bash
   npm install
   ```
3. **Tell the app where the backend is** – create a file called `.env` (if it isn’t there) with these two lines:
   ```
   VITE_API_URL=http://localhost:5001/api   # backend address
   VITE_SOCKET_URL=http://localhost:5001    # for live notifications
   ```
4. **Start the development server** – run:
   ```bash
   npm run dev
   ```
   Your browser will automatically open `http://localhost:3000`. Any change you make to the code will appear instantly.
5. **Play around** – edit a component in `src/pages/SeekerProfile.jsx` and watch the page update without reloading.

## What does the code actually do?

- **Authentication** – When you log in, `authService.login` sends your email and password to the server. The server replies with a token, which the app stores in `localStorage`. Every request later automatically includes that token.
- **Profile page** – `SeekerProfile.jsx` loads your information by calling `seekerService.getProfile()`. The data fills the form, and you can click *Edit* to change it.
- **Creating a request** – A form on the dashboard calls `seekerService.createRequest()` which posts a new blood request to the server.
- **Notifications** – If a SOS request is made, the server pushes a message through Socket.io. The frontend listens and shows a toast (a little popup) with the news.

## Tips for newcomers

- Look at the **components** folder first – most visual pieces are built there.
- The **services** folder is where the HTTP calls live. If you need a new API endpoint, add a function here.
- Use the browser’s developer tools (Network tab) to see the actual requests being sent.
- Tailwind classes are short, e.g., `bg-blood` gives a red background, `text-text-primary` sets the main text colour.

---

Enjoy building! If something looks confusing, just read the comments in the code – they are written to be friendly and explain why things are done a certain way.
