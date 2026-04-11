# SmartMess Framework
### Official Technical Documentation & Architecture Reference

The **SmartMess Framework** is a complete, real-time feedback loop and scheduling ecosystem specifically tailored to manage IIT Dharwad's institutional dining halls. This document serves as a comprehensive guide evaluating the system structure, setup, architecture, and recent feature overhauls perfectly aligned with competitive constraints.

---

## 1. Codebase Structure Explanation

The project utilizes a Monolithic Monorepo strategy separating the client and server engines for deployment flexibility. 

### `Smart_Mess_Frontend/` (Client Interface)
Built on **React.js (v18)** and styled comprehensively with **Material UI (v5)** and **Ant Design**. 
- `src/pages/user/Suggestions/`: Houses the complex modular UI for the Complaint Tracking System (Cards, Forms, Discussion Thread contexts).
- `src/sections/manager/add-food/`: Houses the backend synchronized `VisualTimetableEditor` and `ManageMenuItems` modules responsible for dragging, dropping, and tracking menu items across the dynamic calendar matrix.
- `src/utils/apis.js`: The central Axios networking router mapping localized React functions safely to authenticated external fetch parameters.

### `Smart_Mess_Backend/` (Server Engine)
Built on **Node.js + Express** linked to a **MongoDB/Mongoose** Database. 
- `src/models/`: MongoDB cluster definitions (e.g., `suggestions.ts` locking `resolutionUpvotes` arrays and `officialResponse` strings).
- `src/routes/`: Express endpoints defining the application's external API boundary.
- `src/controllers/`: Core business logic executing database atomic queries and handling Firebase Push Notification executions safely.

---

## 2. System Architecture & Workflows 

### Core Workflows:
1. **Interactive Tracking Loop**: 
   When a user submits a complaint, the frontend intercepts the object, aggressively compresses attached imagery via `browser-image-compression` Web Workers, and fires it `multipart/form-data` to the Backend. The Node cluster binds the context to the database, fires a broad-spectrum real-time Socket.io ping `new-post` to refresh active screens, and pings the `UserNotification` database natively.
2. **Administrative Resolution Lock**: 
   As complaints gather `upvotes` from the student body, Managers receive elevated administrative access via robust **Role Based Access Controls (RBAC)** conditionally evaluating their JSON Web Tokens. They can officially execute a `Resolve Issue` action which permanently embeds an `officialResponse` back into the database schema dynamically switching the item to a visual `Resolved` column.
3. **Menu Ratings Interpolation**: 
   Food is rated by students universally. The Manager portal utilizes an advanced cross-reference loop fetching `getFoodItemRatings()` and visually stamping real-time average scores directly atop visual menu cards in the `VisualTimetableEditor` component. 

---

## 3. Recommended Setup & Installation

To boot the dual servers cleanly in your local testing environment:

### Prerequisites
- Node.js `v18.x` or higher native runtime.
- A functional MongoDB Atlas Cluster URI or local daemon.

### Backend Setup
1. Open terminal inside `/Smart_Mess_Backend`
2. Run `npm install` to hydrate dependencies (Express, Cors, Mongoose).
3. Populate your `.env` variables (see section below).
4. Run `npm run dev` to engage the `nodemon` active-reloading server port.

### Frontend Setup
1. Pop open a localized terminal inside `/Smart_Mess_Frontend`
2. Run `npm install` (this will install MUI, AntD, Axios, and React dependencies).
3. Populate the frontend root with the active development `.env`. 
4. Run `npm start`. React will bootstrap port `3000` via Webpack.

---

## 4. Environment Variables Blueprint

Do not commit these definitions globally. 

**Backend (`Smart_Mess_Backend/.env`):**
- `PORT`: (Default: `8001`) Base Express routing channel.
- `MONGODB_URI`: Connect string pointing to the active Mongo Database.
- `JWT_SECRET`: Secure encryption salt for generating and decrypting login Tokens.
- `FRONTEND_URL`: CORS whitelisting (usually `http://localhost:3000`).

**Frontend (`Smart_Mess_Frontend/.env`):**
- `REACT_APP_SERVER_URL`: Networking path mapping `Axios` logic dynamically (usually `http://localhost:8001`).

---

## 5. Master API Structure Documentation

Key API architectural routes specifically tracking the recent resolution overhauls:

| HTTP Method | Route Endpoint | Payload Body | Action Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/profile/suggestion/resolveAdmin` | `FormData` (`suggestionId`, `response`, `image?`) | Allows a Manager account to permanently stamp an Official response to a ticket closing it, uploading photo proof securely to Cloudinary. |
| `PATCH` | `/profile/suggestion/reopen` | `{ suggestionId, suggestion }` | Grants ticket-authors permission to shift the status back to `"open"`, modifying the original text body to inform administration why their fix failed. |
| `PATCH` | `/profile/suggestion/resolutionVote` | `{ suggestionId, upvote: boolean }` | Atomic Mongoose increment targeting standard arrays mapping `resolutionUpvotes` distinctly from the primary ticket polling data. |
| `GET` | `/manager/dashboard/getItemRating` | `null` | Harvests global 5-Star system feedback per component allowing the Visual Timetable to inject badges over food items dynamically. |

---

## 6. Official Exhaustive Changelog (Since Last Git Pull)

The following exhaustive iterations have been massively implemented into the framework during this contribution sprint to guarantee UI consistency, institutional security, and workflow integrity:

### Access, Security, & Architecture
- **Complete RBAC Middleware Integration**: Structured a native `checkRoles.ts` Express middleware verifying JSON Web Tokens dynamically to block unauthorized users from executing destructive state changes across backend routes (`managerRoutes.ts`, `userRoutes.ts`).
- **Environment Driven Authorization**: Whitelisted administrator access natively verifying IIT domains parsing `.env` logic during Google OAuth `auth.controller.ts` payload resolution.
- **Phantom Backend Fail-Safes**: System-killing `404 Notification Token` errors that accidentally signaled API crashes during Manager actions when interacting with user accounts devoid of FireBase Push installations were entirely suppressed via graceful `if (token) {}` validation bypass hooks!

### Aesthetic & UI Foundation Overhaul
- **Premium Institution Theme Core**: Ripped out boilerplate MUI theme configurations (`palette.js`, `typography.js`, `Card.js`, `Input.js`) and natively injected the official `"Plum & Gold"` color palette combined with `DM Serif Display` and `Inter` geometries to mirror standard institutional wellness tools.
- **High-Fidelity Login Redesign**: The legacy `LoginPage.js` landing screen was completely destroyed and redesigned using split gradient levitation graphics establishing a highly premium initial UX.

### The Dynamic Menu Engine
- **Visual Timetable Editor Scaffold**: The `ManagerAddFood.js` infrastructure was aggressively extended via new native components (`src/sections/manager/`). This introduces the `VisualTimetableEditor` and `ManageMenuItems` tables, converting a painful manual calendar entry interface into a rich visual array scheduling system.
- **Python PDF Menu Seed Execution**: Designed and executed `readPdf.py` / `seedMenu.js` background scripting logic parsing the raw complex PDF institutional menus and injecting JSON objects securely back to the MongoDB instance. 

### Dashboards & Navigation
- **Unified Portal Access Systems**: The `App.js` and `NavSection.js` routers were cleanly gated depending on login roles, efficiently routing different user groups either to `ManagerDashboard.js`, `MyMenuPage.js`, or the global analytics trackers dynamically based on backend schema assertions.
- **Institutional Menu Logic**: Cleaned up branding across the menu calendar by removing all non-essential descriptive sub-labels ("Fresh", "Menu Item"), resulting in a high-fidelity, minimalist UI focused strictly on item visualization.
- **Student Rating Revision Engine**: Implemented a comprehensive rating edit workflow. Students can now revise previously submitted food ratings. The backend handles "Rating Deltas" to ensure institutional averages shift accurately without duplicating reviewer counts, while the frontend provides a smooth toggleable edit state.
- **Native Contextual App Analytics**: Implemented cross-referenced backend calls natively dragging the global 5-Star item rating metrics directly over the floating dynamic cards visible in both the Manager `VisualTimetable Editor` and the mobile frontend application (`RatingsMobile.js`).

### Community Complaint Infrastructure
- **Role-Based Voting Defenses**: The Community Issue tracker structurally maps Active User context (`user.Role`). Buttons visually lock themselves off preventing `Admin/Manager/Secy` roles from participating blindly in Student-Sentiment upvote polling.
- **Official Resolution Capabilities**: The Complaint system was extended drastically enabling Managers to attach text blocks explicitly detailing solutions applied to tickets.
- **Targeted Sub-Voting Loops**: Resolved Tickets now feature embedded mini Upvote/Downvote counters evaluating specifically the validity of the *Manager's Action Taken*, not simply the original issue!
- **Student "Reopen Ticket" Modal Flow**: Ticket Authors now have absolute control to override "Closed" resolutions using a beautiful dynamic popover Modal. The previous resolution remains visible as a persistent historical record, providing critical context for management as they address the reopened ticket. This triggers an immediate shift back into the Admin Dashboard for prioritized review.
- **Theme Aggregation Execution**: The legacy plain-white `<form>` handling the "Add Complaint" mechanic was completely destroyed and entirely refactored natively against the IIT-Dharwad theme utilizing `DM Serif Display` typography, Levitation-on-Hover nested geometries, and deep Plum/Gold (`#2E0845` / `#ffad4a`) outlines.

### Bug Fixes & Stability
- **Notification Persistence Patches**: 
    - Resolved a critical syntax error in the `makeRead` controller that prevented notifications from reliably updating their state in the database.
    - Implemented robust `ObjectId` comparison in `getAllNotifications` to fix intermittent synchronization issues between the frontend and backend.
    - Expanded `makeAllRead` logic to include user-specific resolution notifications, ensuring the "Mark all as read" action is truly comprehensive.
