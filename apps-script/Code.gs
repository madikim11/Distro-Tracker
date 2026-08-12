// Distro Tracker backend — bind this script to the Google Sheet that will hold one
// tab per artist. Each tab is fully owned by the sync (its layout is written by
// pushArtist_ below); you can hand-edit the cell values, just don't rename or move the
// three column blocks:
//   - Columns A-B: Parameters (Parameter | Value), one row per simple field
//   - Columns D-K: Product / Territory Breakdown, one row per territory allocation
//     (ID | Type | Title | UPC | GS1 Registration | Territory | Distributor / Location | Quantity)
//   - Columns M-P: Manufacturing Plants (ID | Plant Name | Region | Quantity)
//
// Deploy: Extensions > Apps Script > paste this file's contents into Code.gs
// > Deploy > New deployment > type: Web app > Execute as: Me >
// Who has access: Anyone > Deploy. Copy the Web App URL into sync-config.js.

var LEFT_COL = 1; // A
var PT_COL = 4; // D
var PT_WIDTH = 8;
var PLANTS_COL = 13; // M
var PLANTS_WIDTH = 4;

function doGet(e) {
  var action = e.parameter.action;
  if (action === "pull") {
    var artist = (e.parameter.artist || "").toString().trim();
    if (!artist) return jsonOutput_({ error: "artist required" });
    return jsonOutput_(pullArtist_(artist));
  }
  return jsonOutput_({ error: "unknown action" });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput_({ error: "invalid json" });
  }

  if (data.action === "push") {
    var artist = (data.artist || "").toString().trim();
    if (!artist) return jsonOutput_({ error: "artist required" });
    pushArtist_(artist, data.parameters || [], data.productTerritory || [], data.plants || []);
    return jsonOutput_({ success: true });
  }
  return jsonOutput_({ error: "unknown action" });
}

// Sheets silently converts a plain "YYYY-MM-DD" string cell into a real Date value
// (e.g. Street Date). Reading it back with a bare .toString() gives a verbose
// "Fri Oct 09 2026 00:00:00 GMT..." string that corrupts the value on the site side —
// so any Date cell gets reformatted back to plain YYYY-MM-DD here instead.
function cellText_(v) {
  if (Object.prototype.toString.call(v) === "[object Date]") {
    var y = v.getFullYear();
    var m = ("0" + (v.getMonth() + 1)).slice(-2);
    var d = ("0" + v.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  return (v || "").toString();
}

function pullArtist_(artistName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(artistName);
  if (!sheet) return { exists: false, parameters: [], productTerritory: null, plants: null };

  var lastRow = sheet.getLastRow();
  var dataRows = Math.max(lastRow - 1, 0);

  // Columns A-B: Parameters. Row 1 is the "Parameter"/"Value" header.
  var parameters = [];
  if (dataRows > 0) {
    var leftValues = sheet.getRange(2, LEFT_COL, dataRows, 2).getValues();
    for (var i = 0; i < leftValues.length; i++) {
      var label = cellText_(leftValues[i][0]).trim();
      if (!label) continue;
      parameters.push([label, cellText_(leftValues[i][1])]);
    }
  }

  // Columns D-K: Product/Territory. Only trust this block if its header row is actually
  // there — an older-format tab that hasn't been repushed since this moved from column A
  // won't have it, and null (not []) signals the site to leave that data alone rather
  // than reading "nothing at the new location" as "everything was deleted."
  var productTerritory = null;
  if (cellText_(sheet.getRange(1, PT_COL).getValue()).trim() === "ID") {
    productTerritory = [];
    if (dataRows > 0) {
      var ptValues = sheet.getRange(2, PT_COL, dataRows, PT_WIDTH).getValues();
      for (var j = 0; j < ptValues.length; j++) {
        var id = cellText_(ptValues[j][0]).trim();
        if (!id) continue;
        productTerritory.push([
          id,
          cellText_(ptValues[j][1]),
          cellText_(ptValues[j][2]),
          cellText_(ptValues[j][3]),
          cellText_(ptValues[j][4]),
          cellText_(ptValues[j][5]),
          cellText_(ptValues[j][6]),
          ptValues[j][7],
        ]);
      }
    }
  }

  // Columns M-P: Manufacturing Plants. Same null-vs-empty-array signal as above.
  var plants = null;
  if (cellText_(sheet.getRange(1, PLANTS_COL).getValue()).trim() === "ID") {
    plants = [];
    if (dataRows > 0) {
      var plantValues = sheet.getRange(2, PLANTS_COL, dataRows, PLANTS_WIDTH).getValues();
      for (var k = 0; k < plantValues.length; k++) {
        var pid = cellText_(plantValues[k][0]).trim();
        if (!pid) continue;
        plants.push([pid, cellText_(plantValues[k][1]), cellText_(plantValues[k][2]), cellText_(plantValues[k][3])]);
      }
    }
  }

  return { exists: true, parameters: parameters, productTerritory: productTerritory, plants: plants };
}

function pushArtist_(artistName, parameters, productTerritory, plants) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(artistName);
  if (!sheet) sheet = ss.insertSheet(artistName);
  sheet.clear();

  // Columns A-B: Parameters
  var leftRows = [["Parameter", "Value"]];
  parameters.forEach(function (p) { leftRows.push([p[0], p[1]]); });
  sheet.getRange(1, LEFT_COL, leftRows.length, 2).setValues(leftRows);
  sheet.getRange(1, LEFT_COL, 1, 2).setFontWeight("bold");

  // Columns D-K: Product/Territory (one row per territory allocation)
  var ptHeader = ["ID", "Type", "Title", "UPC", "GS1 Registration", "Territory", "Distributor / Location", "Quantity"];
  var ptRows = [ptHeader].concat(productTerritory || []).map(function (r) {
    var padded = r.slice();
    while (padded.length < PT_WIDTH) padded.push("");
    return padded;
  });
  sheet.getRange(1, PT_COL, ptRows.length, PT_WIDTH).setValues(ptRows);
  sheet.getRange(1, PT_COL, 1, PT_WIDTH).setFontWeight("bold");

  // Columns M-P: Manufacturing Plants
  var plantsHeader = ["ID", "Plant Name", "Region", "Quantity"];
  var plantsRows = [plantsHeader].concat(plants || []).map(function (r) {
    var padded = r.slice();
    while (padded.length < PLANTS_WIDTH) padded.push("");
    return padded;
  });
  sheet.getRange(1, PLANTS_COL, plantsRows.length, PLANTS_WIDTH).setValues(plantsRows);
  sheet.getRange(1, PLANTS_COL, 1, PLANTS_WIDTH).setFontWeight("bold");

  sheet.autoResizeColumns(1, PLANTS_COL + PLANTS_WIDTH - 1);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
