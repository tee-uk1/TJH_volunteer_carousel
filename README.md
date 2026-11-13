# TJH Volunteer Carousel

A self-updating "Our Volunteers" carousel for [thejobhackers.org](https://www.thejobhackers.org/about-us/) (WordPress + Elementor). It replaces the manually maintained Elementor image carousel.

**Flow:** Google Form → Google Sheet → Apps Script JSON feed → carousel widget

Volunteers submit their details through a form. A coordinator ticks **Approved** in the Sheet, and the volunteer appears on the website on the next page load. No code changes or redeploys are needed.

## Files
| File | Purpose |
|---|---|
| [carousel.html](carousel.html) | Self-contained widget (HTML + CSS + JS, no dependencies). Pasted into a WordPress Custom HTML block. |
| [apps-script/Code.gs](apps-script/Code.gs) | Runs in the Sheet. Serves the JSON feed (`doGet`) and emails a notification on new submissions (`notifyNewVolunteer`). |

## What the carousel does
- Shows each approved volunteer's **round photo** (150×150px) and **name** (Lato Bold 700, 25px, `#333333`).
- If the volunteer gave a LinkedIn URL, clicking the photo/name opens it in a new tab. Without one, it is not clickable.
- Shows 4 slides on desktop, 2 on tablet (≤900px), 1 on phone (≤480px).
- Auto-advances every 2 seconds, loops, and pauses on hover. Prev/next arrows are grey (`#54595F`).
- Hides arrows and autoplay if there are no more volunteers than visible slides.
- Falls back to a grey circle if a photo is missing or fails to load.
- Hides itself entirely if the feed fails or is empty.

## Setup

### 1. Google Form
Create a form with these questions (the code matches on the **start** of each header, case-insensitive):

| Question | Type | Required |
|---|---|---|
| `Full name:` | Short answer | Yes |
| `Upload photo:` | File upload (images) | Yes |
| `LinkedIn profile: (Exact URL) (Optional)` | Short answer | No |

Link responses to a Google Sheet (Responses → Link to Sheets).

### 2. Approval column
In the response Sheet, add a column headed `Approved` and insert **tickboxes** (Insert → Tickbox) for the rows below. Only ticked rows are published. Untick to remove someone.

### 3. Feed (Apps Script)
1. In the Sheet: Extensions → Apps Script. Paste [apps-script/Code.gs](apps-script/Code.gs).
2. Deploy → New deployment → **Web app**. Execute as **Me**, access **Anyone**. Authorize Drive access when prompted.
3. Copy the web app URL.

The feed returns JSON: `[{ "name", "photo", "linkedin" }]`. It also sets each approved photo to "anyone with the link can view" so it displays on the website, and only accepts `linkedin.com` links (https).

**After any edit to `Code.gs`:** Deploy → Manage deployments → Edit → Version: **New version** → Deploy. The URL does not change.

### 4. New-submission email (optional)
1. In `Code.gs`, set `NOTIFY_TO` (comma-separated for several recipients).
2. Triggers (clock icon) → Add Trigger → function `notifyNewVolunteer`, event source **From spreadsheet**, event type **On form submit**. Authorize when prompted.
3. Redeploy the web app (see above).

The email links to the Sheet so the coordinator can tick **Approved**. The repo contains a placeholder address (`coordinator@example.org`); your live script holds the real one(s).

### 5. Widget on WordPress
1. Open [carousel.html](carousel.html) and set `FEED_URL` to your web app URL.
2. Paste the whole file into a **Custom HTML** block on the About Us page, replacing the old carousel.

## Configuration (in `carousel.html`)
| Setting | Where | Default |
|---|---|---|
| Feed URL | `FEED_URL` (script) | the TJH web app URL |
| Autoplay interval | `AUTOPLAY_MS` (script) | `2000` ms |
| Photo size | `--tjh-photo-size` (CSS) | `150px` |
| Name font | `.tjh-vc-name` (CSS) | Lato 700, 25px, `#333333` |
| Slides per view | `perView()` (script) and `.tjh-vc-slide` flex-basis (CSS) | 4 / 2 / 1 |

Lato 700 is loaded from Google Fonts by the widget, so it also works outside WordPress.

## Previewing without WordPress
Download `carousel.html` and open it in a browser. It fetches live data from the feed. Lato loads from Google Fonts.

## Testing a new submission
Submit the form with a photo, tick `Approved` on the new row, and reload the page. If a notification trigger is set up, check the recipient inbox (and spam).

## Notes and limitations
- Header names are matched by prefix. If the form questions are renamed, update `col_(...)` calls in `Code.gs`.
- Photos are cropped to a circle (`object-fit: cover`); square uploads look best.
- Drive photo links use `drive.google.com/thumbnail`, which is subject to Google's availability and rate limits.
- Changes appear on the next page load; there is no manual cache to clear on the carousel side. Photo sharing permissions are cached by the script for 6 hours.
- Delete or untick any test rows before going live.
