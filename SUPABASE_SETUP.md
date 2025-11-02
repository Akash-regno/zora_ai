# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: bubbles-app (or your choice)
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait for the project to be created (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under Project URL)
   - **anon/public key** (under Project API keys)

## 3. Update Your .env File

Replace the existing Supabase values in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_existing_gemini_key
```

## 4. Run the Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/20241102000000_initial_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the migration

This will create:
- The `canvases` table to store your conversations
- Row Level Security (RLS) policies for data protection
- Indexes for better performance
- Automatic timestamp updates

## 5. Configure Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and password reset emails

## 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Open your app in the browser
3. Try signing up with a test email
4. Check your email for the confirmation link
5. After confirming, sign in and create a canvas

## Security Features Implemented

✅ **Row Level Security (RLS)**: Users can only access their own canvases
✅ **Email Verification**: Users must verify their email before full access
✅ **Password Requirements**: Minimum 8 characters enforced
✅ **Secure Authentication**: Using Supabase Auth with JWT tokens
✅ **HTTPS Only**: All API calls are encrypted
✅ **SQL Injection Protection**: Supabase client handles parameterization
✅ **XSS Protection**: React automatically escapes user input

## Troubleshooting

### "Failed to load canvases"
- Check that your Supabase URL and anon key are correct in `.env`
- Verify the migration ran successfully in SQL Editor
- Check browser console for specific error messages

### "Email not sending"
- Supabase free tier has email rate limits
- Check **Authentication** → **Logs** for delivery status
- Consider setting up a custom SMTP provider in Supabase settings

### "Cannot insert/update canvases"
- Verify RLS policies are enabled
- Check that you're signed in (user object exists)
- Look at the Supabase logs in the dashboard

## Production Deployment

Before deploying to production:

1. Set up a custom domain for your Supabase project
2. Configure production environment variables
3. Enable additional security features:
   - Rate limiting
   - CAPTCHA for signup
   - Custom email templates
4. Set up database backups
5. Monitor usage in Supabase dashboard
