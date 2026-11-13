/**
 * Volunteer feed for The Job Hackers carousel.
 *
 * Bound to the Google Sheet that receives the volunteer Google Form responses.
 * Deploy as: Web app -> Execute as "Me" -> Who has access "Anyone".
 *
 * Columns are matched by the START of the header text (case-insensitive), any order:
 *   "Full name" | "Upload photo" | "LinkedIn" (optional) | "Approved"
 * "Upload photo" is the Drive file upload question (a Drive URL).
 * "Approved" is a tickbox column added manually (ticked = show on site).
 */
var SHEET_NAME = ''; // leave blank to use the first sheet

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  var head = rows.shift().map(function (h) { return String(h).trim().toLowerCase(); });
  var iName = col_(head, 'full name');
  var iPhoto = col_(head, 'upload photo');
  var iLink = col_(head, 'linkedin');
  var iOk = col_(head, 'approved');

  var cache = CacheService.getScriptCache();
  var out = [];
  rows.forEach(function (r) {
    if (r[iOk] !== true || !r[iName]) return;
    out.push({
      name: String(r[iName]).trim(),
      photo: photoUrl_(r[iPhoto], cache),
      linkedin: linkedinUrl_(iLink < 0 ? '' : r[iLink])
    });
  });

  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Makes the uploaded Drive photo publicly viewable and returns an image URL. */
function photoUrl_(value, cache) {
  var m = String(value || '').match(/[-\w]{25,}/);
  if (!m) return '';
  var id = m[0];
  if (!cache.get(id)) {
    try {
      DriveApp.getFileById(id).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      cache.put(id, '1', 21600);
    } catch (e) { return ''; }
  }
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w600';
}

function col_(head, prefix) {
  for (var i = 0; i < head.length; i++) if (head[i].indexOf(prefix) === 0) return i;
  return -1;
}

/** Returns a safe https LinkedIn URL, or '' if missing/invalid. */
function linkedinUrl_(v) {
  var u = String(v || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return /^https:\/\/([\w-]+\.)?linkedin\.com\//i.test(u) ? u : '';
}

/**
 * Emails the coordinator(s) when a new volunteer submits the form.
 * Setup: Triggers -> Add Trigger -> notifyNewVolunteer -> From spreadsheet -> On form submit.
 * Set NOTIFY_TO below (comma-separated for several recipients).
 */
var NOTIFY_TO = 'coordinator@example.org';

function notifyNewVolunteer(e) {
  var name = ((e.namedValues['Full name:'] || [''])[0]);
  MailApp.sendEmail({
    to: NOTIFY_TO,
    subject: 'New volunteer submission: ' + name,
    body: name + ' has submitted their details.\n\n' +
          'Review and tick "Approved" to publish them on the website:\n' +
          SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}
