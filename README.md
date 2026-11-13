# TJH Volunteer Carousel

Self-updating "Our Volunteers" carousel for thejobhackers.org (WordPress).

Flow: **Google Form → Google Sheet → Apps Script JSON feed → carousel widget**.

## Setup
1. **Form**: create a Google Form with questions `Full name:`, `Upload photo:` (file upload) and optional `LinkedIn profile:`. Link responses to a Google Sheet.
2. **Sheet**: add a column headed `Approved` and format it as checkboxes. Only ticked rows appear on the site. Untick to remove someone.
3. **Feed**: in the Sheet, Extensions → Apps Script, paste [apps-script/Code.gs](apps-script/Code.gs). Deploy → New deployment → Web app, execute as *Me*, access *Anyone*. Authorize Drive access when prompted. Copy the web app URL.
4. **Widget**: open [carousel.html](carousel.html), set `FEED_URL` to that URL, and paste the whole file into a WordPress **Custom HTML** block in place of the current carousel.

## Notes
- Headers are matched by their start: `Full name`, `Upload photo`, `LinkedIn`, `Approved`; rename in the Sheet or `Code.gs` if your form differs.
- The widget has no dependencies, shows 4 / 2 / 1 slides by screen width, auto-advances, and pauses on hover.
- If the feed fails or is empty, the carousel hides itself.
- After editing `Code.gs`, redeploy a new version for changes to go live.
