# SocialConnect - Social Media Web Application

A comprehensive social media platform built with Next.js, TypeScript, and Supabase.

## Features

- 🔐 JWT-based authentication (register, login, logout, password reset)
- 👤 User profiles with avatars, bio, and social stats
- 📝 Post creation with text and images
- ❤️ Like and comment on posts
- 👥 Follow/unfollow users
- 📰 Personalized chronological feed
- 🔔 Real-time notifications using Supabase
- 👨‍💼 Admin dashboard for user and content management

## Tech Stack

- **Frontend & Backend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT with bcrypt
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SocialConnect-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials and JWT secrets.

4. Set up the database:

Run the SQL migrations in your Supabase SQL Editor (found in `/database/migrations.sql`).

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a new Supabase project
2. Copy the SQL from `/database/migrations.sql`
3. Run it in the Supabase SQL Editor
4. Set up Storage buckets:
   - Create a bucket named `avatars` (public)
   - Create a bucket named `post-images` (public)

## Admin Setup

To create an admin user, use the admin provisioning endpoint:

```bash
POST /api/admin/provision
{
  "userId": "user-uuid-here",
  "secretKey": "your_admin_secret_key_from_env"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/token/refresh` - Refresh access token
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/password-reset-confirm` - Confirm password reset
- `POST /api/auth/change-password` - Change password (authenticated)

### Users
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get user profile
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user profile
- `POST /api/users/[id]/follow` - Follow user
- `DELETE /api/users/[id]/follow` - Unfollow user
- `GET /api/users/[id]/followers` - Get user followers
- `GET /api/users/[id]/following` - Get user following

### Posts
- `GET /api/posts` - List all posts (feed)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post details
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/like` - Like post
- `DELETE /api/posts/[id]/like` - Unlike post
- `POST /api/posts/[id]/comments` - Add comment
- `GET /api/posts/[id]/comments` - Get post comments

### Admin
- `POST /api/admin/provision` - Provision admin user
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - Get user details
- `POST /api/admin/users/[id]/deactivate` - Deactivate user
- `GET /api/admin/posts` - List all posts
- `DELETE /api/admin/posts/[id]` - Delete any post
- `GET /api/admin/stats` - Get system statistics

## Project Structure

```
SocialConnect-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main app pages
│   └── admin/             # Admin pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client
│   ├── auth/             # Auth utilities
│   └── ...               # Other utilities
├── database/              # Database migrations
└── types/                 # TypeScript types
```

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.


