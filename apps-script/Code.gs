/**
 * Volunteer feed for The Job Hackers carousel.
 *
 * Bound to the Google Sheet that receives the volunteer Google Form responses.
 * Deploy as: Web app -> Execute as "Me" -> Who has access "Anyone".
 *
 * Expected sheet columns (header row, any order, case-insensitive):
 *   Name | Photo | Approved
 * "Photo" is the Drive file upload question (a Drive URL).
 * "Approved" is a checkbox column you add manually (tick = show on site).
 */
var SHEET_NAME = ''; // leave blank to use the first sheet

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  var head = rows.shift().map(function (h) { return String(h).trim().toLowerCase(); });
  var iName = head.indexOf('name');
  var iPhoto = head.indexOf('photo');
  var iOk = head.indexOf('approved');

  var cache = CacheService.getScriptCache();
  var out = [];
  rows.forEach(function (r) {
    if (r[iOk] !== true || !r[iName]) return;
    out.push({ name: String(r[iName]).trim(), photo: photoUrl_(r[iPhoto], cache) });
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
