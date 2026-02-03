# Storage Unit Inventory Tracker - Netlify Deployment Guide

## Prerequisites
- Your C# backend API must be hosted and accessible via HTTPS
- You need a Netlify account (free tier works fine)

## Deployment Steps

### 1. Prepare Your Repository
Make sure all files are committed to Git:
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Via Netlify UI
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 or higher

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
```

### 3. Set Environment Variables in Netlify

In your Netlify site dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add the following variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-api-url.com/api`

   Example: `https://api.yourdomain.com/api`

3. Click "Save"

### 4. Trigger a Redeploy
After adding environment variables, redeploy:
- Go to **Deploys** tab
- Click **Trigger deploy** → **Clear cache and deploy site**

## Important: Backend Requirements

Your C# backend must:

1. **Be hosted on HTTPS** (not HTTP)
2. **Have CORS configured** to allow your Netlify domain:

```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNetlify", policy =>
    {
        policy.WithOrigins(
            "https://your-site-name.netlify.app",
            "http://localhost:5173" // Keep for local development
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

app.UseCors("AllowNetlify");
```

3. **Backend hosting options:**
   - Azure App Service (recommended for C#)
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform
   - Heroku
   - Railway

## Testing After Deployment

1. Visit your Netlify URL
2. Open browser DevTools (F12) → Network tab
3. Try logging in and adding a package
4. Verify API calls are going to your production backend
5. Check for CORS errors in console

## Environment Variables Explained

- **Local Development:** Uses `.env.local` (not committed to Git)
- **Production:** Uses Netlify environment variables
- **Fallback:** Defaults to `http://localhost:5234/api` if not set

## Troubleshooting

### API calls failing
- ✅ Check environment variable is set correctly in Netlify
- ✅ Verify backend CORS includes your Netlify URL
- ✅ Ensure backend URL uses HTTPS (not HTTP)
- ✅ Check Network tab in DevTools for exact error

### 404 errors on refresh
- ✅ Verify `netlify.toml` is in the repository
- ✅ Check the redirect rule is active

### Build fails
- ✅ Check Node version (should be 18+)
- ✅ Verify `package.json` has all dependencies
- ✅ Review build logs in Netlify dashboard

## Local Development Setup

Create a `.env.local` file (not committed):
```bash
VITE_API_BASE_URL=http://localhost:5234/api
```

Run locally:
```bash
npm run dev
```

## Custom Domain (Optional)

1. Go to **Domain settings** in Netlify
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Update CORS in your backend to include custom domain

## Continuous Deployment

Once connected, Netlify automatically deploys when you push to your Git repository:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify automatically builds and deploys! 🚀
```
