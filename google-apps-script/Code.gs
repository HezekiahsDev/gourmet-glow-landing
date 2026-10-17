// Gourmet Glow — signup → Google Sheets webhook
//
// HOW TO USE
// 1. Create a new Google Sheet for your signups.
// 2. Open Extensions > Apps Script and replace the contents of Code.gs with this file.
// 3. Edit the SHEET_NAME and column order below to match your sheet (optional).
// 4. Deploy > New deployment > type "Web app":
//      - Execute as: Me
//      - Who has access: Anyone
//    Copy the "/exec" URL it gives you.
// 5. In your project run:  vercel env add SIGNUP_WEBHOOK_URL production
//    and paste that URL. Then redeploy the site.

// Name of the tab at the bottom of your spreadsheet.
const SHEET_NAME = 'Signups';

// Column order must match the array returned by buildRow().
// The header row is written automatically the first time a signup arrives.
const HEADERS = ['Timestamp', 'Name', 'Email', 'Phone', 'Interest', 'Product', 'Source'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // one writer at a time, avoids interleaved rows
  try {
    const payload = parseBody_(e);
    if (!payload || !payload.email) {
      // Apps Script web apps always answer HTTP 200 and cannot set the
      // status code, so success/failure travels in the JSON body instead.
      return json_({ ok: false, error: 'Missing email' });
    }

    const sheet = getSheet_();
    ensureHeader_(sheet);
    sheet.appendRow(buildRow_(payload));

    return json_({ ok: true });
  } catch (err) {
    // Surface the error in the response body so the site can show its
    // retry message instead of silently losing the signup.
    console.error(err);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// TextOutput has no setResponseCode (a plain Object) and its content type
// only reliably takes effect when read back via getContent(). Apps Script
// also answers with a 302 redirect, so callers must read the JSON body —
// the body is the only channel that carries the real outcome.
function json_(obj) {
  const json = JSON.stringify(obj);
  const out = ContentService.createTextOutput(json);
  out.setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput(out.getContent());
}

// Vercel sends application/json; some webhook tools send form-encoded.
function parseBody_(e) {
  if (!e || !e.postData) return null;
  if (e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      /* fall through to form parsing */
    }
  }
  return e.postData.parameters || null;
}

function buildRow_(p) {
  return [
    new Date(),
    str_(p.name, 80),
    str_(p.email, 254),
    str_(p.phone, 24),
    str_(p.interest, 40),
    str_(p.product, 80),
    str_(p.source, 40),
  ];
}

function str_(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
}

function json_(obj) {
  // TextOutput has no setResponseCode — Apps Script web apps always answer
  // HTTP 200 — so callers must inspect the "ok" field in the body.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
