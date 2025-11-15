# Deployment Guide for SocialConnect

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)
- Supabase project set up

### Step 1: Prepare Your Repository

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/yourusername/socialconnect.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### Step 3: Configure Environment Variables

In Vercel project settings, add all environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-jwt-refresh-secret
ADMIN_SECRET_KEY=your-admin-secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Deploying to Netlify

### Step 1: Prepare for Deployment

1. Add a `netlify.toml` file to your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Push changes to GitHub

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Step 3: Add Environment Variables

In Netlify site settings > Environment Variables, add all your environment variables.

### Step 4: Deploy

Click "Deploy site" and wait for the build to complete.

## Database Considerations

### Production Database Setup

1. Create a separate Supabase project for production
2. Run the migration script in the production database
3. Set up production storage buckets
4. Update environment variables to use production Supabase URLs

### Database Backups

Set up regular backups in Supabase:
1. Go to Supabase Dashboard > Settings > Database
2. Configure automated backups
3. Store backup credentials securely

## Security Checklist

Before going to production:

- [ ] Use strong, unique JWT secrets
- [ ] Secure ADMIN_SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Supabase Row Level Security (RLS) policies
- [ ] Review all environment variables
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure proper logging
- [ ] Review database access permissions

## Performance Optimization

### 1. Enable Caching

Configure caching headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=30',
          },
        ],
      },
    ];
  },
};
```

### 2. Image Optimization

- Use Next.js Image component for all images
- Compress images before uploading
- Consider using a CDN for image delivery

### 3. Database Indexing

The migration already includes indexes, but monitor query performance and add additional indexes as needed.

### 4. Connection Pooling

Supabase handles connection pooling automatically, but monitor your connection usage in the Supabase dashboard.

## Monitoring

### Set Up Error Tracking

1. Install Sentry:
```bash
npm install @sentry/nextjs
```

2. Configure Sentry in your project

### Monitor Performance

- Use Vercel Analytics for deployment insights
- Monitor Supabase dashboard for database performance
- Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

## Scaling Considerations

### Database Scaling

- Monitor Supabase metrics
- Consider upgrading Supabase plan for higher limits
- Implement database read replicas for read-heavy operations

### Application Scaling

- Vercel automatically scales based on traffic
- Consider implementing Redis for session storage
- Use CDN for static assets

### Cost Optimization

- Monitor Supabase usage to avoid unexpected costs
- Implement pagination properly to reduce database queries
- Use Vercel Edge Functions for frequently accessed, cacheable data

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Review error logs
   - Check database performance metrics
   - Monitor storage usage

2. **Monthly**:
   - Update dependencies
   - Review security vulnerabilities
   - Backup database manually

3. **Quarterly**:
   - Review and optimize database queries
   - Update documentation
   - Conduct security audit

## Rollback Procedure

If you need to rollback a deployment:

### On Vercel:
1. Go to Deployments tab
2. Find the previous working deployment
3. Click "..." menu > "Promote to Production"

### On Netlify:
1. Go to Deploys tab
2. Find the previous working deployment
3. Click "Publish deploy"

## Support and Resources

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs
- Netlify Documentation: https://docs.netlify.com

## Emergency Contacts

Create a document with emergency contacts:
- Database Administrator
- DevOps Team
- Security Team
- Support Email

Keep this document secure and accessible to authorized personnel only.


