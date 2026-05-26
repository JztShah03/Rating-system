const SHEET_NAME = 'Ratings';
const REQUIRED_HEADERS = [
  'Timestamp',
  'Technician ID',
  'Technician Name',
  'Rating Value',
  'Rating Label',
  'Emoji Selected',
  'Submission ID',
  'User Agent',
  'Source'
];

function doPost(e) {
  try {
    const payload = parseRequestBody_(e);

    if (payload.action !== 'addRating') {
      return jsonResponse_({ ok: false, message: 'Invalid action.' }, 400);
    }

    validateRatingPayload_(payload);

    const sheet = getRatingsSheet_();
    ensureHeaders_(sheet);

    if (payload.submissionId && isDuplicateSubmission_(sheet, payload.submissionId)) {
      return jsonResponse_({ ok: true, duplicate: true, message: 'Duplicate submission ignored.' });
    }

    const timestamp = new Date();
    sheet.appendRow([
      timestamp,
      payload.technicianId,
      payload.technicianName,
      Number(payload.ratingValue),
      payload.ratingLabel,
      payload.emojiSelected,
      payload.submissionId || Utilities.getUuid(),
      payload.userAgent || '',
      payload.source || ''
    ]);

    return jsonResponse_({ ok: true, message: 'Rating saved successfully.', timestamp: timestamp.toISOString() });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, message: error.message || 'Unable to save rating.' }, 500);
  }
}

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';

    if (action !== 'getRatings') {
      return jsonResponse_({ ok: true, message: 'Rating Service API is running.' });
    }

    validateAdminToken_(e);

    const sheet = getRatingsSheet_();
    ensureHeaders_(sheet);
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift() || REQUIRED_HEADERS;

    const ratings = rows
      .filter(row => row.some(cell => cell !== ''))
      .map(row => rowToObject_(headers, row));

    return jsonResponse_({ ok: true, ratings: ratings, count: ratings.length });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, message: error.message || 'Unable to load ratings.' }, 500);
  }
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body.');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Request body must be valid JSON.');
  }
}

function validateRatingPayload_(payload) {
  const requiredFields = ['technicianId', 'technicianName', 'ratingValue', 'ratingLabel', 'emojiSelected'];
  requiredFields.forEach(field => {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  });

  const rating = Number(payload.ratingValue);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating value must be an integer from 1 to 5.');
  }
}

function validateAdminToken_(e) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!expectedToken) return;

  const receivedToken = e && e.parameter ? e.parameter.adminToken : '';
  if (receivedToken !== expectedToken) {
    throw new Error('Unauthorized admin token.');
  }
}

function getRatingsSheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('Spreadsheet not found. Bind this script to a Google Sheet or set SPREADSHEET_ID in Script Properties.');
  }

  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).getValues()[0];
  const hasHeaders = REQUIRED_HEADERS.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function isDuplicateSubmission_(sheet, submissionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const submissionIdColumn = REQUIRED_HEADERS.indexOf('Submission ID') + 1;
  const values = sheet.getRange(2, submissionIdColumn, lastRow - 1, 1).getValues().flat();
  return values.includes(submissionId);
}

function rowToObject_(headers, row) {
  const record = {};
  headers.forEach((header, index) => {
    const value = row[index];
    record[header] = value instanceof Date ? value.toISOString() : value;
  });
  return record;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
