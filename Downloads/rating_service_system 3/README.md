# Rating Service System

A complete responsive web-based rating system for customers to rate technician service quality. Ratings are saved automatically into Google Sheets using Google Apps Script, and the admin page visualizes technician performance.

## Files

```text
rating_service_system/
├── index.html              # Technician selection page
├── rating.html             # Emoji rating page
├── thank-you.html          # Thank-you page with redirect countdown
├── admin.html              # Admin dashboard
├── style.css               # Shared responsive premium UI
├── script.js               # Shared app logic, dashboard charts, Google Sheets calls
├── assets/
│   ├── technician1.jpg
│   ├── technician2.jpg
│   ├── ...
│   └── technician12.jpg
└── apps-script/
    └── Code.gs             # Google Apps Script backend
```

## Google Sheet column setup

Create a Google Sheet with a sheet tab named:

```text
Ratings
```

The Apps Script will automatically create these headers if they do not exist:

| Column | Header |
|---|---|
| A | Timestamp |
| B | Technician ID |
| C | Technician Name |
| D | Rating Value |
| E | Rating Label |
| F | Emoji Selected |
| G | Submission ID |
| H | User Agent |
| I | Source |

The first six columns are the required rating data. `Submission ID` is added for duplicate protection.

## Google Apps Script setup

1. Open your Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Delete any default code.
4. Copy everything from `apps-script/Code.gs` and paste it into the Apps Script editor.
5. Save the project.
6. Optional but recommended: set an admin token.
   - In Apps Script, go to **Project Settings → Script Properties**.
   - Add property name: `ADMIN_TOKEN`
   - Add any strong secret value, for example: `my-strong-admin-token-2026`
7. Deploy the script:
   - Click **Deploy → New deployment**.
   - Select type: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Click **Deploy**.
8. Copy the Web App URL.

## Connect the website to Google Sheets

Open `script.js` and replace this line:

```js
googleScriptUrl: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
```

with your Apps Script Web App URL:

```js
googleScriptUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
```

Save the file.

## Run on your iMac

Best local test method:

1. Unzip the project folder.
2. Open Terminal.
3. Go into the project folder:

```bash
cd /path/to/rating_service_system
```

4. Start a local server:

```bash
python3 -m http.server 8000
```

5. Open Safari or Chrome and visit:

```text
http://localhost:8000
```

You can also double-click `index.html`, but the local server method is cleaner for testing browser requests.

## Website pages

| Page | URL |
|---|---|
| Technician Selection | `http://localhost:8000/index.html` |
| Rating Page | Opens after selecting technician |
| Thank You Page | Opens after rating submission, then redirects back to the Rating Page |
| Admin Dashboard | `http://localhost:8000/admin.html` |

## Admin dashboard access

Open:

```text
http://localhost:8000/admin.html
```

If you set `ADMIN_TOKEN` in Apps Script, enter the same token in the admin token field and click **Save**. The token is stored only in your browser localStorage.

## Where to change technician names and images

Open `script.js` and edit this section:

```js
const TECHNICIANS = [
  { id: "ahmad", name: "Ahmad", image: "assets/technician1.jpg", role: "Service Technician" },
  { id: "hafiz", name: "Hafiz", image: "assets/technician2.jpg", role: "Service Technician" },
  { id: "danial", name: "Danial", image: "assets/technician3.jpg", role: "Service Technician" },
  { id: "faris", name: "Faris", image: "assets/technician4.jpg", role: "Service Technician" },
  { id: "azlan", name: "Azlan", image: "assets/technician5.jpg", role: "Service Technician" },
  { id: "irfan", name: "Irfan", image: "assets/technician6.jpg", role: "Service Technician" },
  { id: "imran", name: "Imran", image: "assets/technician7.jpg", role: "Service Technician" },
  { id: "zaid", name: "Zaid", image: "assets/technician8.jpg", role: "Service Technician" },
  { id: "nabil", name: "Nabil", image: "assets/technician9.jpg", role: "Service Technician" },
  { id: "syafiq", name: "Syafiq", image: "assets/technician10.jpg", role: "Service Technician" },
  { id: "aiman", name: "Aiman", image: "assets/technician11.jpg", role: "Service Technician" },
  { id: "hakim", name: "Hakim", image: "assets/technician12.jpg", role: "Service Technician" }
];
```

To change photos, replace the files inside the `assets` folder. Keep the same filenames, or update the `image` path in `script.js`. The included `technician5.jpg` to `technician12.jpg` files are clean placeholder avatars, not real staff photos.

## 12-technician layout note

The technician selection page now uses a fluid responsive grid. On large screens, the 12 technicians display as a clean 6-by-2 layout. On tablets, they display in 3 columns. On mobile, they become a simple one-column list for easier tapping.

The rating page no longer shows the numeric `1 / 5`, `2 / 5`, etc. under each emoji. Only the emoji and rating label are shown to keep the customer flow cleaner.

## Production-readiness notes

This project is much better than a basic demo, but do not fool yourself: a static admin page is not real enterprise-grade security. The included `ADMIN_TOKEN` protects the data endpoint from casual public viewing, but anyone with the token can access the dashboard data.

For stronger production use, add one of these:

- Host the admin dashboard behind authenticated hosting.
- Use Google Cloud / Firebase Authentication.
- Move admin analytics behind a real backend.
- Restrict the Apps Script endpoint by domain or user login if your organization allows it.

The rating submission flow already includes:

- Client-side repeated-click prevention.
- Backend duplicate submission detection using `Submission ID`.
- Loading state while saving.
- Friendly error handling and retry.
- Responsive mobile-first layout.
- Smooth emoji burst animation.
- Google Sheets dashboard fetching.

## Deployment options

Simple options:

- Netlify
- Vercel
- GitHub Pages
- Your company intranet hosting
- Local iMac kiosk browser

For kiosk use, open `index.html` or `rating.html?technician=ahmad` depending on whether customers should choose technicians or rate one fixed technician.

## Testing checklist

Before using it with customers:

1. Select each technician and confirm the rating page displays the correct person.
2. Submit each rating value from 1 to 5.
3. Confirm new rows appear in the Google Sheet.
4. Open `admin.html` and confirm metrics update.
5. Test mobile view in Safari/Chrome responsive mode.
6. Disconnect internet and confirm the error message appears.
7. Click an emoji repeatedly and confirm only one submission is sent.
