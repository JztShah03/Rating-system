/**
 * Apps Script ready backend (ES5-style) — paste this into your Apps Script project.
 */

var SPREADSHEET_ID = '';
var SHEET_NAME = 'Ratings';
var HEADERS = [
  'Timestamp',
  'Technician Name',
  'Rating Value',
  'Rating Label',
  'Emoji Selected',
  'Device Type',
  'Campus',
  'User Agent'
];

function doGet(e) {
  try {
    var action = e && e.parameter ? e.parameter.action : '';
    var callback = e && e.parameter ? e.parameter.callback : '';
    var sheet = getOrCreateRatingsSheet_();

    if (action === 'ratings') {
      return outputResponse_({
        success: true,
        ratings: readRatings_(sheet)
      }, callback);
    }

    return outputResponse_({
      success: true,
      message: 'Technician Rating System API is running.',
      expectedAction: 'Use ?action=ratings to fetch rating records.'
    }, callback);
  } catch (error) {
    return outputResponse_({
      success: false,
      message: error.message || 'Unable to process GET request.'
    }, e && e.parameter ? e.parameter.callback : '');
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    var payload = parsePayload_(e);
    validatePayload_(payload);

    var campusValue = String(payload.campus || '').trim() || 'Unknown';

    var sheet = getOrCreateRatingsSheet_();
    sheet.appendRow([
      new Date(),
      String(payload.technicianName).trim(),
      Number(payload.ratingValue),
      String(payload.ratingLabel || '').trim(),
      String(payload.emojiSelected || '').trim(),
      String(payload.deviceType || '').trim(),
      campusValue,
      String(payload.userAgent || '').trim()
    ]);

    return outputResponse_({
      success: true,
      message: 'Rating saved successfully.'
    });
  } catch (error) {
    return outputResponse_({
      success: false,
      message: error.message || 'Unable to save rating.'
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {
      // ignore
    }
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body. Do not run doPost manually in Apps Script. Test it from the React app or with a real POST request.');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Invalid JSON request body.');
  }
}

function validatePayload_(payload) {
  if (!payload.technicianName) {
    throw new Error('technicianName is required.');
  }

  if (payload.ratingValue === undefined || payload.ratingValue === null || payload.ratingValue === '') {
    throw new Error('ratingValue is required.');
  }

  var ratingValue = Number(payload.ratingValue);

  if (!isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw new Error('ratingValue must be between 1 and 5.');
  }
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('No active spreadsheet found. Bind this script to a Google Sheet or set SPREADSHEET_ID.');
  }

  return spreadsheet;
}

function getOrCreateRatingsSheet_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaderRow_(sheet);
  return sheet;
}

function ensureHeaderRow_(sheet) {
  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var hasCorrectHeaders = HEADERS.every(function (header, index) {
    return firstRow[index] === header;
  });

  if (!hasCorrectHeaders) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  sheet.setFrozenRows(1);
}

function readRatings_(sheet) {
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  return values
    .filter(function (row) {
      var technicianName = String(row[1] || '').trim();
      var ratingValue = Number(row[2]);
      var hasValidRating = isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5;
      return technicianName !== '' && hasValidRating;
    })
    .map(function (row) {
      return {
        timestamp: formatTimestamp_(row[0]),
        technicianName: row[1],
        ratingValue: Number(row[2]),
        ratingLabel: row[3],
        emojiSelected: row[4],
        deviceType: row[5],
        branchLocation: String(row[6] || '').trim(),
        userAgent: row[7]
      };
    });
}

function formatTimestamp_(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value ? String(value) : '';
}

function outputResponse_(data, callback) {
  if (callback) {
    var safeCallback = sanitizeCallback_(callback);
    var javascript = safeCallback + '(' + JSON.stringify(data) + ');';

    return ContentService
      .createTextOutput(javascript)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCallback_(callback) {
  var value = String(callback || '').trim();

  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(value)) {
    throw new Error('Invalid JSONP callback name.');
  }

  return value;
}
