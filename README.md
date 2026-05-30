# 🩸 Emergency Blood Connector
**Every Second Counts. Every Drop Saves a Life.**

A real-time emergency blood donation and healthcare coordination platform — connecting blood seekers, verified donors, hospitals, and blood banks instantly.

## What is Emergency Blood Connector?

Imagine a family member is rushed into surgery and needs three units of B-negative blood — right now. The hospital doesn't have it. Nobody knows who to call. Every minute matters and there is no system in place to find help fast.

That is exactly the gap Emergency Blood Connector was built to close.

EBC is a live healthcare coordination platform where a single blood request instantly reaches every matching donor and partner hospital in the same city — no phone calls, no manual searching, no delays. The moment a request goes up, it travels through the platform in real time and lands in the hands of people who can actually help. Donors see it on their phone. Hospitals see it on their dashboard. Everyone responds from where they already are.

The problem was never a shortage of donors. It was always a shortage of connection.

---

## How It Works

- Anyone can visit the landing page and see live emergency requests, verified donors, and hospital blood stock — no login needed.
- Sign up and pick your role — Seeker, Donor, Hospital, or Admin. That one choice shapes your entire experience on the platform.
- Every logged-in user is silently connected to their city's live channel via Socket.IO.
- A seeker posts a blood request — it instantly broadcasts to every eligible, available donor in that city.
- Donors receive the alert in real time, review it, and accept or reject from their dashboard.
- The seeker's request status updates live — Pending → Accepted → Processing → Completed — with a notification at every step.
- Hospitals manage their blood stock live. Every update they make is pushed to the city network instantly.
- If a situation is life-threatening, one tap on the SOS button escalates the request to critical priority and broadcasts it to the entire city at once.
- The admin sits above all of it — verifying users, monitoring requests, and keeping the platform trustworthy.

---

## The Four Roles

### 🩸 Blood Seeker
- Signs up and posts an emergency blood request with patient name, blood group, units needed, hospital, urgency level, deadline, and contact number.
- Chooses urgency — Normal, Moderate, Urgent, or Critical — so donors know exactly how fast to move.
- Hits the SOS button when it cannot wait — broadcasts a critical alert to every donor and hospital in the city at once.
- Tracks the request live through every stage — Pending → Accepted → Processing → Completed.
- Gets a real-time notification the moment a donor accepts, rejects, or completes the donation.
- Can cancel or update the request anytime from the dashboard.
- Sees full history of all past requests in one place.

---

### ❤️ Blood Donor
- Registers with blood group, age, city, and last donation date.
- Flips the availability toggle — Available Now means they are in the network and receiving alerts. Not Available means they are out of the pool quietly.
- Gets a real-time alert the moment a matching emergency request is posted in their city.
- Reviews the request — blood group, urgency, hospital, units needed, seeker contact — and accepts or rejects.
- After donating in person, marks the donation complete from the dashboard.
- The platform automatically recalculates eligibility — if it has been less than 56 days since the last donation, alerts stop and a countdown appears.
- Builds a full donation history over time — total donations, units given, lives helped.
- Earns a Verified Donor badge once the admin approves their profile.

---

### 🏥 Hospital / Blood Bank
- Registers as an institution with name, type, registration number, address, and contact details.
- Submits a verification request to the admin — once approved, carries a Verified Institution badge visible across the platform.
- Manages a live blood stock dashboard for all eight blood groups with color-coded status — Critical, Low, or Good.
- Every stock update is broadcast to the city network in real time so seekers and donors always see accurate numbers.
- Receives incoming emergency requests from seekers in the same city.
- Approves requests they can coordinate, rejects ones they cannot fulfill — the seeker is notified instantly either way.
- Gets real-time alerts when a critical SOS request is posted nearby.

---

### ⚙️ Admin
- Accesses a master dashboard with live stats across the entire platform — total users, active requests, SOS alerts, completed donations.
- Reviews a verification queue for pending donors and hospitals — approves or rejects with one action.
- Monitors every active blood request on a live feed updated in real time via socket.
- Cancels fake or suspicious requests before they waste donors' time.
- Removes or bans bad actors from the user base.
- Views full analytics — which blood groups are most in demand, top cities by request volume, monthly donation trends, and request status breakdowns.
- Has complete control over who is trusted on the platform and who is not.

---

## Tech Stack

**Backend** — Node.js, Express.js, MongoDB Atlas, Socket.IO, JWT, bcrypt

**Frontend** — React 18, Tailwind CSS, Zustand, Socket.IO Client, Framer Motion, Recharts

---


*Built with urgency for those who need it most.*

**🩸 Connecting Lives, One Drop at a Time.**