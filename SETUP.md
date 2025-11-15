# SocialConnect Setup Guide

This guide will walk you through setting up the SocialConnect application from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Git (optional, for version control)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: SocialConnect
   - **Database Password**: (choose a strong password)
   - **Region**: (choose the closest to your location)
5. Wait for the project to be created (~2 minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the Settings icon (gear)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (starts with https://...supabase.co)
   - **anon public** key
   - **service_role** key (this is sensitive, never expose it in client code)

### 2.3 Run Database Migration

1. In your Supabase project dashboard, click on the **SQL Editor** icon
2. Click "New Query"
3. Copy the entire contents of `/database/migrations.sql` from this project
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration
6. You should see a success message

### 2.4 Set Up Storage Buckets

1. In your Supabase project dashboard, click on **Storage**
2. Click "Create a new bucket"
3. Create two buckets:
   - **Name**: `avatars`, **Public**: Yes
   - **Name**: `post-images`, **Public**: Yes

### 2.5 Enable Realtime

1. In your Supabase project dashboard, go to **Database** > **Replication**
2. Enable realtime for the `notifications` table
3. This will allow real-time notification updates

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration (generate strong random strings)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production

# Admin Configuration (for manual admin provisioning)
ADMIN_SECRET_KEY=your_admin_secret_for_provisioning

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: 
- Never commit `.env` to version control
- Use strong, random strings for JWT secrets in production
- Keep the ADMIN_SECRET_KEY secure

## Step 4: Generate JWT Secrets

You can generate secure random strings for JWT secrets using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.

## Step 5: Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your First User

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Sign up" to create a new account
3. Fill in the registration form
4. You'll be redirected to the login page
5. Log in with your credentials

## Step 7: Provision an Admin User

To make a user an admin, you need to use the admin provisioning endpoint:

1. Get the user ID from your profile page URL (e.g., /profile/[user-id])
2. Make a POST request to provision admin:

```bash
curl -X POST http://localhost:3000/api/admin/provision \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id-here",
    "secretKey": "your_admin_secret_key_from_env"
  }'
```

Or use a tool like Postman/Insomnia to make the request.

3. After successful provisioning, log out and log back in
4. You should now see the "Admin" button in the navigation

## Step 8: Explore the Application

### Features to Try:

1. **Create Posts**: Share text and images with the community
2. **Follow Users**: Build your network by following other users
3. **Like & Comment**: Engage with posts you enjoy
4. **Notifications**: See real-time updates when someone interacts with you
5. **Profile Customization**: Edit your profile, add bio, avatar, etc.
6. **Admin Dashboard**: (if admin) Manage users and content

## Troubleshooting

### Database Connection Issues

- Verify your Supabase credentials in `.env`
- Make sure the database migration ran successfully
- Check Supabase project status at supabase.com

### Real-time Notifications Not Working

- Ensure you enabled replication for the `notifications` table
- Check browser console for any errors
- Verify your Supabase anon key is correct

### Image Upload Issues

- Make sure storage buckets are created and set to public
- Check bucket names match the code (`avatars` and `post-images`)
- Verify image URLs are valid and accessible

### Authentication Issues

- Clear browser localStorage and cookies
- Verify JWT secrets are set in `.env`
- Check that the user account is active in the database

## Production Deployment

### Deploying to Vercel

1. Push your code to GitHub (excluding `.env`)
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env` in Vercel project settings
4. Deploy!

### Important Production Considerations

1. **Environment Variables**: Set all production values in Vercel
2. **JWT Secrets**: Use different, secure secrets in production
3. **Supabase**: Use production Supabase project
4. **CORS**: Configure allowed origins if needed
5. **Rate Limiting**: Consider adding rate limiting to API routes
6. **Error Monitoring**: Set up error tracking (e.g., Sentry)

## API Documentation

All API endpoints are RESTful and documented in the README.md file.

### Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer your_access_token
```

### Example: Create a Post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token" \
  -d '{
    "content": "Hello, SocialConnect!",
    "category": "general"
  }'
```

## Support

For issues and questions:
- Check the README.md for API documentation
- Review the code comments for implementation details
- Check Supabase logs for database/auth issues

## License

MIT


