# Quick Start Guide

Get SocialConnect up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- Supabase account

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd SocialConnect-app
npm install
```

## 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `/database/migrations.sql`
3. Go to Storage and create two public buckets: `avatars` and `post-images`
4. Go to Database > Replication and enable realtime for `notifications` table

## 3. Configure Environment

Create a `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=random_32_char_string
JWT_REFRESH_SECRET=another_random_32_char_string
ADMIN_SECRET_KEY=your_admin_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Create Your Account

1. Click "Sign up"
2. Fill in your details
3. Log in with your credentials

## 6. Make Yourself Admin (Optional)

```bash
curl -X POST http://localhost:3000/api/admin/provision \
  -H "Content-Type: application/json" \
  -d '{"userId":"your-user-id","secretKey":"your_admin_secret"}'
```

Get your user ID from your profile URL.

## What's Next?

- Create posts
- Follow other users
- Explore notifications
- Check the admin dashboard (if admin)

## Need Help?

- See [SETUP.md](./SETUP.md) for detailed setup instructions
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT with bcrypt
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

Enjoy using SocialConnect! 🎉


