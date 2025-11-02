# Extend Supabase Session Duration

To stay signed in longer, update your Supabase JWT settings:

## Steps:

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Scroll down to **JWT Settings**
4. Update these values:

   - **JWT expiry limit**: Change from `3600` (1 hour) to `604800` (7 days)
   - This makes your session last 7 days instead of 1 hour

5. Click **Save**

## What This Does:

- ✅ Keeps you signed in for 7 days
- ✅ Auto-refreshes your session before it expires
- ✅ Persists session across browser restarts
- ✅ No need to sign in repeatedly

## Already Configured in Code:

The app is now configured to:
- Store session in localStorage
- Auto-refresh tokens before expiry
- Persist session across page reloads
- Use custom storage key for better isolation

You should now stay signed in much longer!
