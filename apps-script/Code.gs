// Distro Tracker backend — bind this script to the Google Sheet that will hold one
// tab per artist. Each tab is fully owned by the sync (its layout is written by
// pushArtist_ below); you can hand-edit the cell values, just don't rename or move the
// three column blocks:
//   - Columns A-B: Parameters (Parameter | Value), one row per simple field
//   - Columns D-K: Product / Territory Breakdown, one row per territory allocation
//     (ID | Type | Title | UPC | GS1 Registration | Territory | Distributor / Location | Quantity)
//   - Columns M-P: Manufacturing Plants (ID | Plant Name | Region | Quantity)
// Formatting (colors, fonts, borders, column widths) is yours to set by hand — pushes
// only ever clear and rewrite cell values, never formatting.
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
  if (action === "list") {
    // Every tab is an artist by convention (see the file header) — lets the site
    // discover a tab you created directly in the Sheet instead of only ever finding
    // artists it already knows about locally. A name starting with "_" (e.g.
    // "_Scratchpad") opts a tab out, for anything you want in this spreadsheet that
    // isn't an artist.
    var names = SpreadsheetApp.getActiveSpreadsheet().getSheets()
      .map(function (s) { return s.getName(); })
      .filter(function (name) { return name.indexOf("_") !== 0; });
    return jsonOutput_({ artists: names });
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
    pushArtist_(artist, data.parameters || [], data.productTerritory || [], data.plants || [], data.parameterOptions || {});
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

function pushArtist_(artistName, parameters, productTerritory, plants, parameterOptions) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(artistName);
  if (!sheet) sheet = ss.insertSheet(artistName);
  // contentsOnly: wipe old values (so removed rows don't linger) without touching
  // formatting — colors, fonts, borders, and column widths you set by hand stick around
  // across pushes instead of getting reset every sync.
  sheet.clear({ contentsOnly: true });

  // Columns A-B: Parameters
  var leftRows = [["Parameter", "Value"]];
  parameters.forEach(function (p) { leftRows.push([p[0], p[1]]); });
  sheet.getRange(1, LEFT_COL, leftRows.length, 2).setValues(leftRows);
  sheet.getRange(1, LEFT_COL, 1, 2).setFontWeight("bold");
  applyParameterFormatting_(sheet, leftRows, parameterOptions || {});

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

  // No auto-resize — column widths are yours to set and keep.
}

var STATUS_COLORS = {
  green: { bg: "#e6f4ea", fg: "#137333" },
  red: { bg: "#fce8e6", fg: "#c5221f" },
  amber: { bg: "#fef7e0", fg: "#b06000" },
  gray: { bg: "#f1f3f4", fg: "#5f6368" },
  blue: { bg: "#e8f0fe", fg: "#1a73e8" },
  purple: { bg: "#f3e8fd", fg: "#8430ce" },
};

// Turns each Parameters value cell into a dropdown limited to its valid options,
// colored per option like the site's badges — status fields, a checklist's own
// Completed/Incomplete summary, and each of its individual items all work the same
// way. parameterOptions is keyed by the exact row label (e.g. "Music",
// "Art Proof: Mock-up created") sent alongside the parameters this push — see
// syncBuildParameterOptions in app.js.
function applyParameterFormatting_(sheet, leftRows, parameterOptions) {
  var valueCol = LEFT_COL + 1; // B
  var sheetId = sheet.getSheetId();

  // Drop our own conditional formatting from a previous push (identified by targeting
  // this sheet's Value column) before rebuilding it, so fields that were removed or
  // reordered don't leave stale coloring behind. Rules on other ranges (e.g. anything
  // added by hand elsewhere) are left untouched.
  var rules = sheet.getConditionalFormatRules().filter(function (rule) {
    return !rule.getRanges().some(function (r) {
      return r.getColumn() === valueCol && r.getSheet().getSheetId() === sheetId;
    });
  });

  for (var i = 1; i < leftRows.length; i++) { // row 0 is the header
    var label = leftRows[i][0];
    var config = parameterOptions[label];
    var cell = sheet.getRange(i + 1, valueCol);
    if (!config) {
      cell.clearDataValidations();
      continue;
    }
    if (config.kind === "dropdown" && config.options && config.options.length) {
      var labels = config.options.map(function (o) { return o.label; });
      cell.setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(labels, true).setAllowInvalid(true).build()
      );
      config.options.forEach(function (opt) {
        var colors = STATUS_COLORS[opt.color];
        if (!colors) return;
        rules.push(
          SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo(opt.label)
            .setBackground(colors.bg)
            .setFontColor(colors.fg)
            .setBold(true)
            .setRanges([cell])
            .build()
        );
      });
    }
  }

  sheet.setConditionalFormatRules(rules);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
