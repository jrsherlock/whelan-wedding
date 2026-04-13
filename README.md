# Whelan Wedding

Wedding website for the Whelan celebration, hosted on GitHub Pages.

## Features

- **RSVP Form** -- Collects guest name, email, party size, attendance, dietary restrictions, and an optional message. Submissions are sent to a Google Apps Script backend that writes to a Google Sheet.
- **Registry** -- Links to the couple's gift registries.
- **Photo Gallery** -- Static gallery with a winter luxe aesthetic.
- **Travel & Details** -- Venue info, accommodations, and FAQs for guests.

## Tech Stack

- Static HTML/CSS/JS (no build step)
- Google Apps Script backend for RSVP submissions
- Deployed via GitHub Pages

## Development

Open `index.html` in a browser. No dependencies or build tools required.

To test RSVP submissions locally, set `FORM_ENDPOINT` in `js/rsvp.js` to `null` for demo mode (simulates success without hitting the backend).
