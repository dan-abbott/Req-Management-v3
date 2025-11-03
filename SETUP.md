# Sprint 0 Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Git installed
- Vercel CLI installed: `npm install -g vercel`

## Setup Steps

### 1. Initialize Project
```bash
# Extract the sprint0 files to your project directory
cd requirements-manager-sprint0

# Install dependencies
npm install
```

### 2. Add Fresh Logo
- Replace `public/fresh-logo.svg` with the actual Fresh Consulting logo
- Recommended format: SVG (for best quality) or PNG
- Recommended size: Height of 40-80px

### 3. Configure Supabase Google OAuth
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project or select existing: "Fresh Requirements Manager"
3. Enable Google OAuth API
4. Create OAuth 2.0 Client ID credentials:
   - Application type: Web application
   - Name: "Fresh Requirements Manager"
   - Authorized redirect URIs:
     - `https://oukvdrbrekdungpasdel.supabase.co/auth/v1/callback`
     - `http://localhost:5173` (for local development)
5. Copy Client ID and Client Secret

6. Go to your Supabase project: https://oukvdrbrekdungpasdel.supabase.co
7. Navigate to: Authentication → Providers → Google
8. Enable Google provider
9. Enter your Client ID and Client Secret
10. Save

### 4. Run Database Setup
1. Go to Supabase SQL Editor
2. Run the SQL from requirements document Appendix B:
   - Create projects table
   - Create items table  
   - Create relationships table
   - Create comments table
   - Create audit_logs table
   - Enable RLS and create policies

### 5. Test Locally
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Click "Sign in with Google"
# Verify you can authenticate
```

### 6. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# When prompted:
# - Link to existing project or create new
# - Set up project settings
# - Deploy

# For production deployment:
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from Git repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: https://oukvdrbrekdungpasdel.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: [your anon key]
6. Deploy

### 7. Update OAuth Redirect URLs
After deploying to Vercel, add your Vercel URL to:
1. Google Cloud Console → Credentials → Your OAuth Client
   - Add: `https://your-app.vercel.app`
2. Supabase → Authentication → URL Configuration
   - Add to Site URL and Redirect URLs

## Testing Sprint 0

### ✅ Checklist
- [ ] Can access the app locally (http://localhost:5173)
- [ ] Login page displays Fresh logo
- [ ] "Sign in with Google" button works
- [ ] Can authenticate with Google account
- [ ] After login, see welcome page with user info
- [ ] Header shows Fresh logo and user profile
- [ ] Sign out button works
- [ ] App deployed to Vercel
- [ ] Can authenticate on Vercel deployment

## Troubleshooting

### "Missing Supabase environment variables"
- Verify `.env.local` exists with correct values
- Restart dev server after adding environment variables

### OAuth redirect error
- Verify redirect URLs match exactly in Google Console
- Check that Supabase Google provider is enabled
- Ensure Client ID and Secret are correct

### Can't sign in
- Check browser console for errors
- Verify Supabase project is active
- Check that Google OAuth is enabled in Supabase

### Logo not showing
- Replace `public/fresh-logo.svg` with actual logo file
- Ensure file name matches exactly
- Clear browser cache

## Next Steps
Once Sprint 0 is tested and approved:
- Sprint 1 will add Project management
- Sprint 1 will add basic Item creation
- Sprint 1 will add audit logging

## Support
If you encounter issues, check:
1. Browser console for JavaScript errors
2. Network tab for failed requests
3. Supabase logs for database/auth errors
