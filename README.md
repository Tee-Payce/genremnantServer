# GenRemnant Server

Backend server for GenRemnant application using SQLite database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
copy .env.template .env
```

3. Initialize database:
```bash
node setupDatabase.js
```

4. Create admin user:
```bash
node createAdminUser.js
```

5. Start server:
```bash
npm start
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Database

The application uses SQLite with the database file located at `database.db` in the server root directory.

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /api/posts` - Get published posts
- `POST /api/posts` - Create new post (contributors/admins)
- `GET /api/admin/posts/pending` - Get pending posts (admins)
- `PUT /api/admin/posts/:id/approve` - Approve post (admins)
- `PUT /api/admin/posts/:id/reject` - Reject post (admins)