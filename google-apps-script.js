/**
 * BugPulse — Google Apps Script for Two-Way Google Sheets Sync
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Click: Extensions -> Apps Script
 * 3. Replace all contents with this script
 * 4. Click "Deploy" (top right) -> "New deployment"
 * 5. Select type: "Web app"
 *    - Description: BugPulse Sync API
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize permissions, and copy the Web App URL (ends with /exec)
 * 7. Paste that Web App URL into BugPulse -> "Sync / CSV" -> Two-Way Webhook
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // wait up to 10 seconds for lock
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Headers: Name, Details, Files, Action, Fixed Version, Created by, Last edited by, Created time, Priority, How many user experienced
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    
    var nameCol = headers.indexOf('Name');
    var detailsCol = headers.indexOf('Details');
    var filesCol = headers.indexOf('Files');
    var actionCol = headers.indexOf('Action');
    var fixedVerCol = headers.indexOf('Fixed Version');
    var createdByCol = headers.indexOf('Created by');
    var lastEditedByCol = headers.indexOf('Last edited by');
    var createdTimeCol = headers.indexOf('Created time');
    var priorityCol = headers.indexOf('Priority');
    var userImpactCol = headers.indexOf('How many user experienced');
    
    // Fallback if headers not found exactly
    if (nameCol === -1) nameCol = 0;
    if (detailsCol === -1) detailsCol = 1;
    if (filesCol === -1) filesCol = 2;
    if (actionCol === -1) actionCol = 3;
    if (fixedVerCol === -1) fixedVerCol = 4;
    if (createdByCol === -1) createdByCol = 5;
    if (lastEditedByCol === -1) lastEditedByCol = 6;
    if (createdTimeCol === -1) createdTimeCol = 7;
    if (priorityCol === -1) priorityCol = 8;
    if (userImpactCol === -1) userImpactCol = 9;
    
    var targetName = (data.name || '').trim();
    var rowIndex = -1;
    
    // Search for existing row matching Name
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][nameCol]).trim().toLowerCase() === targetName.toLowerCase()) {
        rowIndex = i + 1; // 1-indexed for SpreadsheetApp
        break;
      }
    }
    
    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yy, h:mm a");
    
    if (rowIndex > 0) {
      // Update existing row
      if (data.details !== undefined && detailsCol !== -1) sheet.getRange(rowIndex, detailsCol + 1).setValue(data.details);
      if (data.files !== undefined && filesCol !== -1) sheet.getRange(rowIndex, filesCol + 1).setValue(data.files);
      if (data.action !== undefined && actionCol !== -1) sheet.getRange(rowIndex, actionCol + 1).setValue(data.action);
      if (data.fixedVersion !== undefined && fixedVerCol !== -1) sheet.getRange(rowIndex, fixedVerCol + 1).setValue(data.fixedVersion);
      if (data.priority !== undefined && priorityCol !== -1) sheet.getRange(rowIndex, priorityCol + 1).setValue(data.priority);
      if (data.userImpactCount !== undefined && userImpactCol !== -1) sheet.getRange(rowIndex, userImpactCol + 1).setValue(data.userImpactCount);
      if (lastEditedByCol !== -1) sheet.getRange(rowIndex, lastEditedByCol + 1).setValue(data.lastEditedBy || 'BugPulse Web App');
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: 'updated',
        row: rowIndex,
        message: 'Issue updated in Google Sheet'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      // Append new row
      var newRow = [];
      var maxCols = Math.max(headers.length, 10);
      for (var c = 0; c < maxCols; c++) {
        newRow.push('');
      }
      
      newRow[nameCol] = targetName;
      if (detailsCol !== -1) newRow[detailsCol] = data.details || '';
      if (filesCol !== -1) newRow[filesCol] = data.files || '';
      if (actionCol !== -1) newRow[actionCol] = data.action || 'New';
      if (fixedVerCol !== -1) newRow[fixedVerCol] = data.fixedVersion || '';
      if (createdByCol !== -1) newRow[createdByCol] = data.createdBy || 'BugPulse User';
      if (lastEditedByCol !== -1) newRow[lastEditedByCol] = data.lastEditedBy || 'BugPulse Web App';
      if (createdTimeCol !== -1) newRow[createdTimeCol] = data.createdTime || nowStr;
      if (priorityCol !== -1) newRow[priorityCol] = data.priority || 'Unassigned';
      if (userImpactCol !== -1) newRow[userImpactCol] = data.userImpactCount || 0;
      
      sheet.appendRow(newRow);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: 'created',
        row: sheet.getLastRow(),
        message: 'New issue appended to Google Sheet'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // Returns instant, non-cached JSON of all issues from Google Sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var rows = [];
  
  for (var i = 1; i < values.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[i][j];
    }
    rows.push(rowObj);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    count: rows.length,
    data: rows
  })).setMimeType(ContentService.MimeType.JSON);
}
