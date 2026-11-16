# Number Master Game (Medium Level)

## Files
- `index.html` - page structure
- `style.css` - game design
- `script.js` - game rules and login actions
- `supabase-config.js` - connection details for Supabase
- `database.sql` - database tables and security rules

## Run the game
1. Put all five files in one folder.
2. Open `index.html` in a browser to see the login screen.
3. To use online accounts and save scores, create a project at https://supabase.com.
4. In Supabase, open SQL Editor, paste `database.sql`, and run it.
5. Open Project Settings -> API. Copy the Project URL and publishable/anon key.
6. Paste those two values into `supabase-config.js`.
7. In Supabase Authentication settings, configure the allowed site URL and redirect URL for your GitHub Pages address.
8. Upload the files to a GitHub repository and enable GitHub Pages in repository Settings -> Pages.

## Important
- GitHub Pages hosts the HTML, CSS and JavaScript. Supabase provides online authentication and database storage.
- Use only the Supabase Project URL and publishable/anon key in `supabase-config.js`.
- Never put the Supabase `service_role` or secret key in website code.
- Keep Row Level Security enabled. The SQL file creates policies so signed-in users can access only their own records.
- For the first test, create an account with your name, email and a password of at least 6 characters. If email confirmation is enabled, confirm the email before logging in.
- The game still runs locally without Supabase, but online login and saving scores need the Supabase setup.
