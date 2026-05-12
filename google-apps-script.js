/**
 * Technician Rating System - Google Apps Script Backend
 *
 * IMPORTANT CORS NOTE:
 * Google Apps Script Web Apps do not behave like normal Node/Express APIs.
 * You cannot add Access-Control-Allow-Origin headers with response.addHeader().
 * This project uses:
 * - POST + no-cors from React for saving ratings
 * - JSONP for dashboard reads
 *
 * Setup options:
 * 1) Recommended: Open your Google Sheet, go to Extensions > Apps Script,
 *    paste this file, and deploy as Web App.
 * 2) Standalone script: paste your spreadsheet ID below.
 */

const SPREADSHEET_ID = ''; // Optional. Leave blank if this script is bound to the Google Sheet.
const SHEET_NAME = 'Ratings';
const HEADERS = [
  'Timestamp',
  'Technician Name',
  'Rating Value',
  'Rating Label',
  'Emoji Selected',
  'Device Type',
  'User Agent'
];

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    const callback = e && e.parameter ? e.parameter.callback : '';
    const sheet = getOrCreateRatingsSheet_();

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
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const payload = parsePayload_(e);
    validatePayload_(payload);

    const sheet = getOrCreateRatingsSheet_();
    sheet.appendRow([
      new Date(),
      String(payload.technicianName).trim(),
      Number(payload.ratingValue),
      String(payload.ratingLabel || '').trim(),
      String(payload.emojiSelected || '').trim(),
      String(payload.deviceType || '').trim(),
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
      // Lock may not have been acquired if waitLock failed. Ignore safely.
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

  const ratingValue = Number(payload.ratingValue);

  if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw new Error('ratingValue must be between 1 and 5.');
  }
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('No active spreadsheet found. Bind this script to a Google Sheet or set SPREADSHEET_ID.');
  }

  return spreadsheet;
}

function getOrCreateRatingsSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaderRow_(sheet);
  return sheet;
}

function ensureHeaderRow_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasCorrectHeaders = HEADERS.every(function (header, index) {
    return firstRow[index] === header;
  });

  if (!hasCorrectHeaders) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  sheet.setFrozenRows(1);
}

function readRatings_(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  return values
    .filter(function (row) {
      var technicianName = String(row[1] || '').trim();
      var ratingValue = Number(row[2]);
      var hasValidRating = Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5;
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
        userAgent: row[6]
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
    const safeCallback = sanitizeCallback_(callback);
    const javascript = safeCallback + '(' + JSON.stringify(data) + ');';

    return ContentService
      .createTextOutput(javascript)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCallback_(callback) {
  const value = String(callback || '').trim();

  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(value)) {
    throw new Error('Invalid JSONP callback name.');
  }

  return value;
}
