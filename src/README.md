# Upload Instructions - Decisive Point CRM

## What You're About to Upload
A complete, production-ready React app that connects to your Supabase database.

## Files to Upload to GitHub

You'll upload these 5 files to your `decisive-point-crm` repository:

1. **package.json** - Tells Vercel what dependencies to install
2. **vite.config.js** - Build configuration
3. **index.html** - The HTML shell
4. **src/main.jsx** - React entry point
5. **src/App.jsx** - Your full CRM application

## Step-by-Step Upload Process

### Step 1: Delete the old file
1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/decisive-point-crm
2. Click on `decisive-point-crm.jsx`
3. Click the trash can icon (🗑️) to delete it
4. Click "Commit changes"

### Step 2: Upload the new files
1. Click "Add file" → "Upload files"
2. Drag ALL 5 files from the folder Claude gave you:
   - package.json
   - vite.config.js
   - index.html
   - src/main.jsx
   - src/App.jsx

**IMPORTANT**: When you drag the `src` folder, GitHub will automatically create the folder structure.

3. Click "Commit changes"

### Step 3: Wait for Vercel to rebuild
1. Go to your Vercel dashboard
2. You'll see a new deployment starting automatically
3. Wait ~2-3 minutes for the build to complete
4. Look for "Ready" status

### Step 4: Test your app
Visit your Vercel URL (the one that was showing 404 before)

**You should see:** A loading screen, then your CRM login page

## What Happens Next

Right now the app will load but you won't have any data yet because:
1. Your Supabase database tables are empty (except the 3 seed funds)
2. You need to create your first employee user account in Supabase

Once you see the app loading (even if it's just a blank screen or login), come back to Claude and say:

**"The app is deployed and loading"**

Then I'll guide you through:
- Creating your first employee login
- Migrating your sample data from the browser prototype to the real database
- Setting up the LP portal

## If Something Goes Wrong

**Build fails in Vercel:**
- Check that all 5 files uploaded correctly
- Make sure the `src/` folder was created with both files inside

**App loads but shows an error:**
- Check Vercel → Settings → Environment Variables
- Make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**Still stuck:**
Come back to Claude with the exact error message you're seeing.
