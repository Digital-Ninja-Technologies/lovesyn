# Fix: Google OAuth on Netlify - Configuration Guide

## Problem
✗ Google OAuth works on Lovable domain  
✗ Google OAuth fails on Netlify domain  
✓ Need to configure multiple redirect URLs in Supabase

---

## Root Cause
Supabase has a whitelist of allowed redirect URLs for security. The Netlify domain is not whitelisted.

**Current Setup**:
- ✅ Lovable domain works (whitelisted)
- ✗ Netlify domain fails (not whitelisted)

---

## Solution: Add Netlify Domain to Supabase Whitelist

### Step 1: Get Your Netlify Domain
Your Netlify site URL should look like:
```
https://your-app-name.netlify.app
```

Or if you have a custom domain:
```
https://your-custom-domain.com
```

### Step 2: Go to Supabase Dashboard
1. Visit: https://app.supabase.com/
2. Select your project: `vayjbvcapqgtvrfxuila`
3. Go to **Authentication** → **URL Configuration**

### Step 3: Add Redirect URLs
In the "Redirect URLs" section, add:

```
http://localhost:3000
http://localhost:5173
https://your-app-name.netlify.app
https://your-app-name.netlify.app/auth
https://your-app-name.netlify.app/
```

Or if using custom domain:
```
https://your-custom-domain.com
https://your-custom-domain.com/auth
https://your-custom-domain.com/
```

### Step 4: Also Check Google Cloud Console
Make sure your Netlify URL is also added in Google Cloud Console:

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to **Credentials**
4. Find your OAuth 2.0 Client ID
5. Edit it and add:
   ```
   https://your-app-name.netlify.app
   https://your-app-name.netlify.app/
   https://your-app-name.netlify.app/auth
   ```

---

## Alternative Fix: Update Code (Optional)

If you want to be more explicit about redirect URLs, you can update the Auth.tsx file:

```typescript
// Current (uses window.location.origin - dynamic)
redirect_uri: window.location.origin

// More explicit (if you want to hardcode)
redirect_uri: process.env.VITE_REDIRECT_URL || window.location.origin
```

Add to `.env`:
```env
VITE_REDIRECT_URL=https://your-app-name.netlify.app
```

---

## Testing

### Local Test (before deploying)
```bash
npm run dev
# Visit http://localhost:5173/auth
# Click "Continue with Google"
# Should redirect properly
```

### Netlify Test (after deployment)
1. Deploy to Netlify
2. Visit your Netlify domain `/auth`
3. Click "Continue with Google"
4. Should successfully sign in

---

## Common Errors & Fixes

### Error: "redirect_uri mismatch"
**Cause**: URL not whitelisted in Supabase  
**Fix**: Add the exact Netlify URL to Supabase → URL Configuration

### Error: "Invalid Client ID"
**Cause**: URL not whitelisted in Google Cloud Console  
**Fix**: Add Netlify URL to Google Cloud → Credentials → OAuth 2.0 Client ID

### Error: "Redirect loop"
**Cause**: Wrong redirect URL format  
**Fix**: Use exact format: `https://domain.netlify.app` (no trailing slash sometimes needed)

### Signs in but page is blank
**Cause**: Redirect happening but app not loading  
**Fix**: Clear browser cache, check Netlify build logs

---

## Configuration Checklist

- [ ] Netlify domain is deployed and working
- [ ] Got the exact Netlify URL (e.g., `https://lovesyn-app.netlify.app`)
- [ ] Added Netlify URL to Supabase → Authentication → URL Configuration
- [ ] Added Netlify URL to Google Cloud Console → OAuth credentials
- [ ] Tested on Netlify domain
- [ ] Google sign-in works ✓

---

## Exact Steps (Copy-Paste)

### 1. Supabase Dashboard
```
1. Go to https://app.supabase.com/
2. Click your project
3. Click "Authentication" in left sidebar
4. Click "URL Configuration"
5. In "Redirect URLs" section, add (one per line):
   https://YOUR-NETLIFY-DOMAIN.netlify.app
   https://YOUR-NETLIFY-DOMAIN.netlify.app/
6. Click "Save"
```

### 2. Google Cloud Console
```
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "Credentials"
4. Click your OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs":
   https://YOUR-NETLIFY-DOMAIN.netlify.app
6. Click "Save"
```

### 3. Test
```
1. Go to: https://YOUR-NETLIFY-DOMAIN.netlify.app/auth
2. Click "Continue with Google"
3. Sign in with Google
4. Should work! ✓
```

---

## Environment Setup (Optional - for flexibility)

If you want to support multiple domains, update `.env.local` or Netlify environment variables:

```env
VITE_SUPABASE_URL=https://vayjbvcapqgtvrfxuila.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=vayjbvcapqgtvrfxuila
```

These are already set and will work automatically with `window.location.origin`.

---

## Summary

The issue is that Supabase needs your Netlify domain whitelisted.

**Quick Fix**:
1. Get your Netlify domain URL
2. Add it to Supabase → URL Configuration
3. Add it to Google Cloud → OAuth credentials
4. Redeploy if needed
5. Test on Netlify domain

**Time to fix**: ~5 minutes

After this, Google OAuth will work on Netlify! 🎉

---

## Need Help?

Check these logs:
- **Browser Console**: Press F12, look for errors
- **Supabase Dashboard**: Authentication → Users (check if user was created)
- **Netlify Dashboard**: Deploys → Logs (check for build errors)
- **Google Cloud**: Check OAuth consent screen is set up
