# nccity-assignment-6

A complete posts and comments application built with React, React Router, the native `fetch()` API, local storage, and JSON Server. Users can register, log in with an email address or phone number, edit their profile, publish posts, comment, and delete content they own.

## Requirements

- Node.js 18 or newer
- npm

## Run the project

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the React application and JSON Server together:

   ```bash
   npm run dev
   ```

3. Open [http://127.0.0.1:3100](http://127.0.0.1:3100). JSON Server runs at [http://127.0.0.1:3101](http://127.0.0.1:3101).

The included demo account is:

- Email: `demo@example.com`
- Password: `demo123`

You can also run the services in separate terminals with `npm run server` and `npm start`.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start React and JSON Server together |
| `npm start` | Start only the React development server |
| `npm run server` | Start only JSON Server on port 3101 |
| `npm test -- --watchAll=false` | Run the test suite once |
| `npm run build` | Create a production build |

## Features

- Registration with required-field, URL, email, phone, password length, password confirmation, and duplicate account validation
- Login by either email address or phone number
- Logged-in session saved in local storage (without storing the password in the session)
- Protected profile route that redirects unauthorized visitors to login
- Profile display and editing, including registration date and all posts by the user
- Post creation with optional image, title, body, author, and timestamp
- Post deletion limited to the author, including related comment cleanup
- Comment creation and deletion limited to the comment author
- Loading, empty, success, and API error states
- Responsive layout and accessible labels, landmarks, status messages, and keyboard controls
- Seeded sample users, posts, and comments in `db.json`

## How `fetch()` is used

All HTTP operations are centralized in `src/api.js`. The reusable `request()` function calls the browser's native `fetch()` function, sets JSON headers, checks `response.ok`, converts successful responses to JSON, and produces a useful message when the API is unavailable or returns an error.

The API wrapper uses:

- `GET` to load users, posts, and comments
- `POST` to register users, create posts, and add comments
- `PATCH` to update a user profile
- `DELETE` to remove posts and comments

Pages and components call the small API methods rather than duplicating request logic. The home page loads its three resources concurrently with `Promise.all()`.

## How array methods are used

The application uses array methods throughout the UI and data handling:

- `find()` locates a post author, comment author, user account, or owned record.
- `some()` checks for duplicate email addresses and phone numbers during registration/profile editing, and checks that fields are not empty.
- `filter()` selects the comments belonging to a post, selects related comments for deletion, and removes deleted data from React state.
- `map()` renders posts and comments and sends related delete requests.
- `Object.values()` converts form values to an array so required fields can be validated together.

State updates use new arrays (for example, `[created, ...current]`) instead of mutating existing React state.

## Project structure

```text
public/
  index.html
src/
  components/       Reusable layout, guard, post, comment, and feedback UI
  context/          Authentication session context
  pages/            Home, login, registration, profile, and 404 pages
  api.js            JSON Server fetch wrapper
  App.js            Route definitions
  styles.css        Responsive application styling
db.json             JSON Server data store and seed data
```

## Notes

This project follows the Create React App structure requested in the assignment and uses `react-scripts`. Its checked-in `.env` assigns React port `3100` and API port `3101` to avoid conflicts with other local development services. Change these values if needed; `.env.example` shows all supported variables. The explicit IPv4 host avoids a Windows/Node.js 22 conflict where `localhost` can resolve to IPv6. The server script omits JSON Server's unnecessary legacy `--watch` flag because it is incompatible with Node.js 22 on Windows; API changes are still saved to `db.json` normally.

JSON Server and local storage provide assignment-appropriate mock authentication. A production application should never store plaintext passwords and should enforce authorization on a secure backend with hashed passwords and server-issued sessions or tokens.
