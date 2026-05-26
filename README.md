# Technician Rating System

A polished, mobile-first customer feedback system for rating technician service quality. Customers select a technician, submit an emoji rating, and the record is saved into Google Sheets using a Google Apps Script Web App. Admin users can view analytics, charts, filters, and recent rating records.

## Tech Stack

- React + Vite
- React Router
- Framer Motion
- Recharts
- Google Sheets as the database
- Google Apps Script Web App backend
- GitHub for version control
- Vercel for deployment

## Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Technician Selection | Customer selects one of 12 technicians. |
| `/rating` | Rating Page | Customer rates the selected technician using emoji buttons. |
| `/thank-you` | Thank You Page | Shows confirmation and redirects back to `/` after countdown. |
| `/admin` | Admin Login + Dashboard | Password-protected demo dashboard for analytics. |

## Project Structure

```text
rating-service-system/
├── public/
│   ├── technician1.png
│   ├── technician2.jpg
│   ├── technician3.jpg
│   ├── technician4.jpg
│   ├── technician5.jpg
│   ├── technician6.jpg
│   ├── technician7.jpg
│   ├── technician8.jpg
│   ├── technician9.jpg
│   ├── technician10.jpg
│   ├── technician11.jpg
│   └── technician12.jpg
├── src/
│   ├── components/
│   │   ├── TechnicianCard.jsx
│   │   ├── RatingButton.jsx
│   │   ├── EmojiBurst.jsx
│   │   ├── BackButton.jsx
│   │   ├── LoadingButton.jsx
│   │   ├── StatCard.jsx
│   │   └── AdminChart.jsx
│   ├── pages/
│   │   ├── TechnicianSelection.jsx
│   │   ├── RatingPage.jsx
│   │   ├── ThankYouPage.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── data/
│   │   └── technicians.js
│   ├── services/
│   │   └── googleSheetService.js
│   ├── utils/
│   │   ├── ratingHelpers.js
│   │   └── deviceHelpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── google-apps-script.js
├── package.json
├── README.md
├── vercel.json
└── vite.config.js
```

## 1. Local Setup

### Requirements

Install these first:

- Node.js 18.18 or newer
- npm
- Git

### Run locally

```bash
cd rating-service-system
npm install
cp .env.example .env
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

At this stage, the UI will load, but saving ratings and loading admin data require the Google Apps Script Web App URL.

## 2. Google Sheet Setup

1. Create a new Google Sheet.
2. Rename the sheet tab to:

```text
Ratings
```

3. The backend script will automatically create this header row if it is missing:

| Timestamp | Technician ID | Technician Name | Rating Value | Rating Label | Emoji Selected | Device Type | User Agent |
|---|---|---|---|---|---|---|---|

## 3. Google Apps Script Backend Setup

1. In the Google Sheet, go to **Extensions > Apps Script**.
2. Delete any starter code.
3. Open `google-apps-script.js` from this project.
4. Copy the full file content and paste it into Apps Script.
5. Click **Save**.
6. Click **Deploy > New deployment**.
7. Select **Web app**.
8. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
9. Click **Deploy**.
10. Authorize the script when Google asks.
11. Copy the Web App URL ending with `/exec`.

### Important

Use the deployed Web App URL, not the Apps Script editor URL. It should look similar to:

```text
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxx/exec
```

## 4. Add Environment Variables Locally

Open `.env` and paste your values:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxx/exec
VITE_ADMIN_PASSWORD=your-demo-admin-password
```

Restart the dev server after changing `.env`:

```bash
npm run dev
```

## 5. Data Flow Explanation

1. Customer opens `/` and selects a technician.
2. React stores the selected technician in React state and `localStorage`.
3. Customer is redirected to `/rating`.
4. Customer taps one emoji rating.
5. React sends a POST request to the Google Apps Script Web App.
6. Apps Script validates the rating and appends a new row into the `Ratings` sheet.
7. On success, React redirects to `/thank-you`.
8. The Thank You page clears the selected technician from `localStorage`.
9. After the countdown ends, the user is redirected back to `/`.
10. Admin opens `/admin`, logs in, and the dashboard sends a GET request to Apps Script to read all rating rows.

## 6. Change Technician Names and Images

Edit this file:

```text
src/data/technicians.js
```

Example:

```js
{ id: 'T001', name: 'Ahmad', image: '/technician1.png' }
```

To replace images:

1. Put new image files inside `public/`.
2. Use the same file names, for example `technician1.jpg`, or update the image path in `src/data/technicians.js`.
3. Recommended image shape: square, at least 500px × 500px.

## 7. Admin Dashboard Access

Go to:

```text
/admin
```

Enter the password from:

```env
VITE_ADMIN_PASSWORD
```

The dashboard includes:

- Total number of ratings
- Overall average rating
- Average rating per technician
- Rating distribution per technician through charts and table data
- Best performing technician
- Lowest performing technician
- Recent rating records
- Technician filter
- Date range filter
- Refresh data button
- Loading state
- Empty state
- Error state

## 8. GitHub Setup

From inside the project folder:

```bash
git init
git add .
git commit -m "Initial technician rating system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rating-service-system.git
git push -u origin main
```

Do not commit `.env`. It is already ignored by `.gitignore`.

## 9. Vercel Deployment

1. Push the project to GitHub.
2. Go to Vercel.
3. Click **Add New > Project**.
4. Import your GitHub repository.
5. Framework should be detected as **Vite**.
6. Add environment variables:

| Variable | Value |
|---|---|
| `VITE_GOOGLE_SCRIPT_URL` | Your Apps Script `/exec` Web App URL |
| `VITE_ADMIN_PASSWORD` | Demo admin password |

7. Click **Deploy**.
8. After deployment, test:
   - `/`
   - `/rating`
   - `/thank-you`
   - `/admin`

## 10. Vercel Configuration

The included `vercel.json` makes React Router work on direct page refreshes:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

## 11. Troubleshooting

### Data is not saving

Check these first:

1. `VITE_GOOGLE_SCRIPT_URL` is set correctly.
2. The URL ends with `/exec`.
3. You redeployed Apps Script after editing the backend.
4. Apps Script deployment access is **Anyone**.
5. Google authorization was completed.
6. The sheet tab is named `Ratings`, or the script has permission to create it.
7. Browser console does not show a CORS or network error.

Hard truth: if the Apps Script deployment is not public to “Anyone,” customer submissions will fail. This is the most common setup mistake.

### Admin dashboard is not loading

Check:

1. The Apps Script URL is correct.
2. Open the Apps Script URL directly in the browser. It should return JSON saying the API is running.
3. Open this version in the browser:

```text
YOUR_SCRIPT_URL?action=ratings
```

It should return JSON with a `ratings` array.

4. Make sure Apps Script was deployed as a Web App, not just saved.
5. Make sure Vercel environment variables were added before deployment. Redeploy after adding them.

### Images are not showing

Check:

1. Images are inside the `public/` folder.
2. File names match exactly, including capitalization.
3. `src/data/technicians.js` points to `/technician1.jpg`, not `public/technician1.jpg`.
4. The image file is not corrupted.

### Vercel environment variable issue

If the app works locally but not on Vercel:

1. Go to Vercel project settings.
2. Open **Environment Variables**.
3. Confirm `VITE_GOOGLE_SCRIPT_URL` and `VITE_ADMIN_PASSWORD` exist.
4. Redeploy the project. Vercel does not automatically rebuild old deployments after env changes unless you redeploy.

### Direct page refresh shows 404 on Vercel

The included `vercel.json` should prevent this. Make sure it is committed and pushed to GitHub.

## 12. Security and Production Weaknesses

This project is suitable for demo, internal pilot, and company presentation. It is not yet production-grade security.

Weaknesses you must not ignore:

1. **Admin password is not secure.** `VITE_ADMIN_PASSWORD` is bundled into frontend JavaScript and can be discovered by technical users.
2. **Apps Script Web App is public.** “Anyone” access means anyone with the URL can submit or fetch data.
3. **No real user authentication.** The admin gate is a client-side demo barrier, not server-side access control.
4. **No anti-spam protection.** A malicious user could repeatedly submit fake ratings if they know the endpoint.
5. **No rate limiting.** Apps Script and Google Sheets have quota limits.
6. **Google Sheets is not a high-scale database.** It is fine for demos and small operations, but weak for high traffic.
7. **User Agent is personal technical data.** Add a privacy notice if this is used with real customers.
8. **No audit trail for admin access.** Admin login is not logged.
9. **No technician identity verification.** A customer can choose any technician manually.

Production hardening recommendations:

- Replace the client-side admin password with server-side authentication.
- Use Vercel Serverless Functions, Firebase Auth, Supabase Auth, or a proper backend.
- Add CAPTCHA or device/session throttling to prevent spam.
- Add a secret write token verified on the server side.
- Use a real database such as Firestore, Supabase, PostgreSQL, or MySQL for larger deployments.
- Add role-based access control for admin users.
- Add privacy notice and data retention policy.
- Add backup/export procedures for rating data.

## 13. Presentation Notes

For a company presentation, demonstrate this flow:

1. Open `/` on mobile screen size.
2. Select one technician.
3. Submit an emoji rating.
4. Show the thank-you countdown returning to technician selection.
5. Open the Google Sheet and show the new row.
6. Open `/admin`.
7. Login and show dashboard analytics.
8. Use technician and date filters.
9. Explain that this is ready for pilot testing, but needs proper authentication before public production use.

## Important Google Apps Script CORS Fix

Google Apps Script Web Apps do not work like a normal Express/Node API. Do **not** use `response.addHeader()` in Apps Script. `TextOutput` supports methods like `setContent()` and `setMimeType()`, but not custom browser CORS headers.

This project uses a practical Apps Script-compatible workaround:

- Rating submission uses `fetch(..., { mode: 'no-cors' })`. The request is sent to Apps Script, but the browser cannot read the JSON response.
- Admin dashboard reading uses JSONP. Apps Script returns JavaScript that calls a temporary callback in the React app.

This is suitable for prototype/demo/company presentation. For serious production use, build a real backend or Vercel Serverless API proxy with authentication and proper CORS/security controls.
