# Security Notes

This project is intentionally simple for presentation and pilot use. The current admin login is not real security because Vite client environment variables are exposed in the browser bundle.

Do not use this exact authentication model for sensitive production data.

Recommended production upgrades:

- Move admin authentication to a server-side backend.
- Add real user sessions and role-based access control.
- Protect read/write endpoints with server-side secrets.
- Add rate limiting and spam protection.
- Replace Google Sheets with a proper database if traffic grows.
- Add data privacy notice, retention rules, and admin audit logs.
