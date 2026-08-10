// Distro Tracker backend — bind this script to the Google Sheet that will hold one
// tab per artist. Each tab is fully owned by the sync (its layout is written by
// pushArtist_ below); you can hand-edit the cell values, just don't rename the
// section headers (PARAMETERS / PRODUCT / TERRITORY BREAKDOWN) or column headers.
//
// Deploy: Extensions > Apps Script > paste this file's contents into Code.gs
// > Deploy > New deployment > type: Web app > Execute as: Me >
// Who has access: Anyone > Deploy. Copy the Web App URL into sync-config.js.

var SECTION_WIDTH = 8;

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
    pushArtist_(artist, data.parameters || [], data.product || [], data.territories || []);
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
  if (!sheet) return { exists: false, parameters: [], product: [], territories: [] };

  var values = sheet.getDataRange().getValues();
  var parameters = [];
  var product = [];
  var territories = [];
  var section = null;

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var a = cellText_(row[0]).trim();

    if (a === "PARAMETERS") { section = "params"; continue; }
    if (a === "PRODUCT") { section = "product"; continue; }
    if (a === "TERRITORY BREAKDOWN") { section = "territory"; continue; }
    if (a === "Parameter" || a === "ID" || a === "Product ID") continue; // column header rows
    if (a === "") continue; // blank separator rows

    if (section === "params") {
      parameters.push([a, cellText_(row[1])]);
    } else if (section === "product") {
      product.push([
        a,
        cellText_(row[1]),
        cellText_(row[2]),
        row[3],
        cellText_(row[4]),
        cellText_(row[5]),
        cellText_(row[6]),
        cellText_(row[7]),
      ]);
    } else if (section === "territory") {
      territories.push([a, cellText_(row[1]), cellText_(row[2]), row[3]]);
    }
  }

  return { exists: true, parameters: parameters, product: product, territories: territories };
}

function pushArtist_(artistName, parameters, product, territories) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(artistName);
  if (!sheet) sheet = ss.insertSheet(artistName);
  sheet.clear();

  var rows = [];
  rows.push(["PARAMETERS"]);
  rows.push(["Parameter", "Value"]);
  parameters.forEach(function (p) { rows.push([p[0], p[1]]); });
  rows.push([""]);
  rows.push(["PRODUCT"]);
  rows.push(["ID", "Type", "Title", "Quantity", "GS1 Registration", "UPC", "Title Registration", "PO#"]);
  product.forEach(function (p) { rows.push(p); });
  rows.push([""]);
  rows.push(["TERRITORY BREAKDOWN"]);
  rows.push(["Product ID", "Territory", "Distributor / Location", "Quantity"]);
  territories.forEach(function (t) { rows.push(t); });

  rows = rows.map(function (r) {
    var padded = r.slice();
    while (padded.length < SECTION_WIDTH) padded.push("");
    return padded;
  });

  sheet.getRange(1, 1, rows.length, SECTION_WIDTH).setValues(rows);
  sheet.getRange(1, 1).setFontWeight("bold");
  sheet.getRange(2, 1, 1, 2).setFontWeight("bold");
  var productHeaderRow = 4 + parameters.length + 2;
  sheet.getRange(productHeaderRow - 1, 1).setFontWeight("bold");
  sheet.getRange(productHeaderRow, 1, 1, SECTION_WIDTH).setFontWeight("bold");
  var territoryHeaderRow = productHeaderRow + product.length + 2;
  sheet.getRange(territoryHeaderRow - 1, 1).setFontWeight("bold");
  sheet.getRange(territoryHeaderRow, 1, 1, 4).setFontWeight("bold");
  sheet.autoResizeColumns(1, SECTION_WIDTH);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
