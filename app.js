const STORAGE_KEY = "distroTrackerState";

// Controls the visual order of parameter sections, independent of when fields were
// added to the array (new fields merge in at the end of the array but still sort here).
const GROUP_ORDER = ["Street Dates", "Type", "Status", "AMPED", "INTEGRAL"];

const DEFAULT_STATE = {
  fields: [
    { key: "streetDateDigital", label: "Street Date (Digital)", type: "date", group: "Street Dates" },
    { key: "streetDatePhysical", label: "Street Date (Physical)", type: "date", group: "Street Dates" },
    {
      key: "product",
      label: "Product",
      type: "multi",
      group: "Type",
      options: [
        { value: "cd", label: "CD", color: "blue" },
        { value: "vinyl", label: "Vinyl", color: "purple" },
        { value: "other", label: "Other", color: "gray", allowCustomTitle: true },
      ],
      // Renders a second status selector under each entry, plus (when set to
      // upcOnValue) a text box for a value that rides along with that entry.
      entrySubStatus: {
        key: "gs1",
        label: "GS1 Registration",
        options: [
          { value: "registered", label: "Registered", color: "green" },
          { value: "not_registered", label: "Not Registered", color: "red" },
          { value: "other", label: "Other", color: "amber" },
        ],
        upcOnValue: "registered",
        extraFieldKey: "upc",
        extraFieldLabel: "UPC",
      },
      // A single always-visible follow-up text field under each entry (once a type is
      // picked), independent of GS1 status.
      entryExtraField: { key: "poNumber", label: "PO#", placeholder: "PO #, e.g. 12345" },
      // Renders an add-as-many-as-you-want breakdown under each entry (e.g. how many
      // units go to each territory/distributor).
      entrySubList: {
        key: "territories",
        label: "Territory Breakdown",
        fields: [
          { key: "territory", label: "Territory", type: "text", placeholder: "Territory, e.g. US" },
          { key: "distributor", label: "Distributor / Location", type: "text", placeholder: "Distributor, e.g. AMPED" },
          { key: "quantity", label: "Qty", type: "number" },
        ],
      },
    },
    {
      // Auto-populated: one row per Product entry that has a UPC set, each with its
      // own Registered / Not Registered status. Nothing to add/remove here directly —
      // the list itself always mirrors whichever Product entries currently have a UPC.
      key: "titleRegistration",
      label: "Title Registration",
      type: "derivedList",
      group: "Type",
      sourceField: "product",
      options: [
        { value: "registered", label: "Registered", color: "green" },
        { value: "not_registered", label: "Not Registered", color: "red" },
      ],
    },
    {
      key: "music",
      label: "Music",
      type: "status",
      group: "Status",
      options: [
        { value: "delivered", label: "Delivered", color: "green" },
        { value: "not_delivered", label: "Not Delivered", color: "red" },
        { value: "other", label: "Other", color: "amber", requiresNote: true },
      ],
    },
    {
      key: "artwork",
      label: "Artwork",
      type: "status",
      group: "Status",
      options: [
        { value: "delivered", label: "Delivered", color: "green" },
        { value: "not_delivered", label: "Not Delivered", color: "red" },
        { value: "other", label: "Other", color: "amber", requiresNote: true },
      ],
    },
    {
      key: "artProof",
      label: "Art Proof",
      type: "checklist",
      group: "Status",
      allowNote: true,
      items: [
        { key: "mockup", label: "Mock-up created" },
        { key: "shared", label: "Shared with team" },
        { key: "approved", label: "Approved by team" },
      ],
    },
    {
      key: "manufacturing",
      label: "Manufacturing",
      type: "status",
      group: "Status",
      options: [
        {
          value: "yes",
          label: "Yes",
          color: "green",
          // Picking this option reveals a second dropdown (International / Domestic / Both);
          // whichever region(s) that resolves to get their own follow-up fields.
          revealSelect: {
            key: "region",
            options: [
              { value: "international", label: "International", items: ["international"] },
              { value: "domestic", label: "Domestic", items: ["domestic"] },
              { value: "both", label: "Both", items: ["international", "domestic"] },
            ],
            items: [
              {
                key: "international",
                label: "International",
                fields: [
                  { key: "plant", label: "Plant Name", type: "text" },
                  { key: "quantity", label: "Quantity", type: "text" },
                ],
              },
              {
                key: "domestic",
                label: "Domestic",
                fields: [
                  { key: "plant", label: "Plant Name", type: "text" },
                  { key: "quantity", label: "Quantity", type: "text" },
                ],
              },
            ],
          },
        },
        { value: "no", label: "No", color: "red" },
      ],
    },
    {
      key: "onePager",
      label: "One-Pager",
      type: "status",
      group: "AMPED",
      options: [
        { value: "submitted", label: "Submitted", color: "green" },
        { value: "not_submitted", label: "Not Submitted", color: "red" },
      ],
      // Shows a computed "Due: <date>" note and turns the box red once we're inside
      // that runway and the field still isn't at doneValue.
      dueRule: { weeksBefore: 10, referenceField: "streetDatePhysical", doneValue: "submitted" },
    },
    {
      key: "inventory",
      label: "Inventory",
      type: "status",
      group: "AMPED",
      options: [
        { value: "received", label: "Received", color: "green" },
        { value: "not_received", label: "Not Received", color: "red" },
      ],
      dueRule: { weeksBefore: 4, referenceField: "streetDatePhysical", doneValue: "received" },
    },
    {
      key: "integralOnePager",
      label: "One-Pager",
      type: "status",
      group: "INTEGRAL",
      options: [
        { value: "submitted", label: "Submitted", color: "green" },
        { value: "not_submitted", label: "Not Submitted", color: "red" },
      ],
      dueRule: { weeksBefore: 10, referenceField: "streetDatePhysical", doneValue: "submitted" },
    },
    {
      key: "integralInventory",
      label: "Inventory",
      type: "status",
      group: "INTEGRAL",
      options: [
        { value: "received", label: "Received", color: "green" },
        { value: "not_received", label: "Not Received", color: "red" },
      ],
      dueRule: { weeksBefore: 3, referenceField: "streetDatePhysical", doneValue: "received" },
    },
  ],
  artists: [
    { id: "skillet", name: "Skillet", values: {} },
  ],
};

// Fields removed from DEFAULT_STATE that may still linger in a previously-saved state
// (e.g. GS1 Registration moved from its own Status field to living under each Product entry).
const REMOVED_FIELD_KEYS = ["gs1Registration"];

// Merges in any default fields a previously-saved state doesn't have yet,
// so the schema can grow in code without wiping data already in localStorage.
// Also backfills `group` and any new `options` onto fields saved before they existed.
function mergeDefaultFields(loaded) {
  loaded.fields = loaded.fields.filter((f) => !REMOVED_FIELD_KEYS.includes(f.key));
  for (const artist of loaded.artists) {
    for (const key of REMOVED_FIELD_KEYS) {
      delete artist.values[key];
      if (artist.notes) delete artist.notes[key];
    }
    // Manufacturing's plant name used to be stored at "manufacturing::<item>";
    // it now lives at "manufacturing::<item>::plant" alongside a sibling quantity field.
    if (artist.notes) {
      for (const itemKey of ["international", "domestic"]) {
        const oldKey = `manufacturing::${itemKey}`;
        const newKey = `${oldKey}::plant`;
        if (artist.notes[oldKey] !== undefined && artist.notes[newKey] === undefined) {
          artist.notes[newKey] = artist.notes[oldKey];
          delete artist.notes[oldKey];
        }
      }
    }
    // Manufacturing's region used to be a checkbox pair at "manufacturing::checklist"
    // ({international, domestic}); it's now a single dropdown at "manufacturing::region".
    const oldChecklist = artist.values && artist.values["manufacturing::checklist"];
    if (oldChecklist && artist.values["manufacturing::region"] === undefined) {
      if (oldChecklist.international && oldChecklist.domestic) artist.values["manufacturing::region"] = "both";
      else if (oldChecklist.international) artist.values["manufacturing::region"] = "international";
      else if (oldChecklist.domestic) artist.values["manufacturing::region"] = "domestic";
      delete artist.values["manufacturing::checklist"];
    }
  }

  const existingByKey = new Map(loaded.fields.map((f) => [f.key, f]));
  for (const field of DEFAULT_STATE.fields) {
    const existing = existingByKey.get(field.key);
    if (!existing) {
      loaded.fields.push(structuredClone(field));
      continue;
    }
    if (!existing.group && field.group) {
      existing.group = field.group;
    }
    if (field.allowNote && !existing.allowNote) {
      existing.allowNote = true;
    }
    if (field.entrySubStatus && !existing.entrySubStatus) {
      existing.entrySubStatus = structuredClone(field.entrySubStatus);
    }
    if (field.entrySubList && !existing.entrySubList) {
      existing.entrySubList = structuredClone(field.entrySubList);
    }
    if (field.entryExtraField && !existing.entryExtraField) {
      existing.entryExtraField = structuredClone(field.entryExtraField);
    }
    if (field.dueRule && !existing.dueRule) {
      existing.dueRule = structuredClone(field.dueRule);
    }
    if (field.options) {
      if (!existing.options) {
        existing.options = structuredClone(field.options);
      } else {
        const existingValues = new Set(existing.options.map((o) => o.value));
        for (const opt of field.options) {
          if (!existingValues.has(opt.value)) existing.options.push(structuredClone(opt));
          else {
            const existingOpt = existing.options.find((o) => o.value === opt.value);
            // revealSelect is entirely code-defined (never user-edited), so always resync
            // from the current schema rather than trying to detect drift. Also clears out
            // a stale revealChecklist from before Manufacturing's region became a dropdown.
            if (opt.revealSelect) {
              existingOpt.revealSelect = structuredClone(opt.revealSelect);
              delete existingOpt.revealChecklist;
            }
          }
        }
      }
    }
    if (field.items) {
      if (!existing.items) {
        existing.items = structuredClone(field.items);
      } else {
        const existingKeys = new Set(existing.items.map((it) => it.key));
        for (const item of field.items) {
          if (!existingKeys.has(item.key)) existing.items.push(structuredClone(item));
        }
      }
    }
  }
  return loaded;
}

function groupFields(fields) {
  const groups = [];
  const byName = new Map();
  for (const field of fields) {
    const name = field.group || "General";
    if (!byName.has(name)) {
      byName.set(name, { name, fields: [] });
      groups.push(byName.get(name));
    }
    byName.get(name).fields.push(field);
  }
  groups.sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a.name);
    const ib = GROUP_ORDER.indexOf(b.name);
    return (ia === -1 ? GROUP_ORDER.length : ia) - (ib === -1 ? GROUP_ORDER.length : ib);
  });
  return groups;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(DEFAULT_STATE);
  try {
    return mergeDefaultFields(JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function slugify(text) {
  const base = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let id = base || "artist";
  let n = 2;
  while (state.artists.some((a) => a.id === id)) {
    id = `${base}-${n}`;
    n++;
  }
  return id;
}

function fieldKeyFromLabel(label) {
  const base = label
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");
  let key = base || "field";
  let n = 2;
  while (state.fields.some((f) => f.key === key)) {
    key = `${base}${n}`;
    n++;
  }
  return key;
}

function formatDateObj(date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatValue(field, rawValue) {
  if (!rawValue) return "";
  if (field.type === "date") {
    const d = new Date(rawValue + "T00:00:00");
    if (isNaN(d)) return rawValue;
    return formatDateObj(d);
  }
  if (field.type === "status") {
    const opt = field.options.find((o) => o.value === rawValue);
    return opt ? opt.label : rawValue;
  }
  return rawValue;
}

function ensureNotes(artist) {
  if (!artist.notes) artist.notes = {};
  return artist.notes;
}

// Per-artist, per-box collapse state — purely visual, never touches the underlying data.
function ensureCollapsed(artist) {
  if (!artist.collapsed) artist.collapsed = {};
  return artist.collapsed;
}

function isBoxCollapsed(artist, boxKey) {
  return !!ensureCollapsed(artist)[boxKey];
}

function renderCollapseToggle(artist, boxKey) {
  const collapsed = ensureCollapsed(artist);
  const isCollapsed = !!collapsed[boxKey];
  return el("button", {
    class: "btn-ghost box-collapse-toggle",
    title: isCollapsed ? "Expand" : "Collapse",
    onclick: (e) => {
      e.stopPropagation();
      collapsed[boxKey] = !collapsed[boxKey];
      saveState();
      render();
    },
  }, isCollapsed ? "▸" : "▾");
}

// Reads (and lazily initializes) the {itemKey: boolean} map backing a checklist field.
function ensureChecklistValue(artist, field) {
  const current = artist.values[field.key];
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    artist.values[field.key] = {};
  }
  return artist.values[field.key];
}

function isChecklistComplete(field, values) {
  return field.items.every((item) => !!(values && values[item.key]));
}

function renderChecklistBadge(complete) {
  return el("span", { class: `badge badge-${complete ? "green" : "amber"}` }, complete ? "Complete" : "In Progress");
}

// Reads (and lazily initializes) the array of entries backing a "multi" field
// (an add-as-many-as-you-want list, e.g. Product: CD / Vinyl / Other x N).
function ensureMultiValue(artist, field) {
  const current = artist.values[field.key];
  if (!Array.isArray(current)) {
    artist.values[field.key] = [];
  }
  return artist.values[field.key];
}

// "CD" for a plain option, "Other - LP Standard – Rolling Blackout [Black]" for one
// with a custom title — used to identify a Product entry outside its own box (e.g. Title Registration).
function resolveProductEntryDisplayLabel(field, entry) {
  const opt = field.options.find((o) => o.value === entry.value);
  const typeLabel = opt ? opt.label : entry.value;
  if (opt && opt.allowCustomTitle && entry.title) return `${typeLabel} - ${entry.title}`;
  return typeLabel;
}

// Reads (and lazily initializes) the {productEntryId: statusValue} map backing a
// derivedList field.
function ensureDerivedListValue(artist, field) {
  const current = artist.values[field.key];
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    artist.values[field.key] = {};
  }
  return artist.values[field.key];
}

// A derivedList field's rows aren't stored directly — they're computed each render
// from whichever entries of its sourceField currently have a UPC set.
function derivedListEntries(artist, field) {
  const sourceField = state.fields.find((f) => f.key === field.sourceField);
  if (!sourceField || !sourceField.entrySubStatus) return { sourceField, entries: [] };
  const upcKey = sourceField.entrySubStatus.extraFieldKey;
  const all = Array.isArray(artist.values[sourceField.key]) ? artist.values[sourceField.key] : [];
  return { sourceField, entries: all.filter((e) => e.value && e[upcKey]) };
}

function renderBadge(field, rawValue) {
  const opt = field.options.find((o) => o.value === rawValue);
  if (!opt) return document.createTextNode(rawValue);
  return el("span", { class: `badge badge-${opt.color}` }, opt.label);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function slugifyOption(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "option";
}

const COLOR_RULES = [
  { re: /^(not\b|no\b|missing|blocked|delayed|late|pending|rejected)/i, color: "red" },
  { re: /^(delivered|done|complete|ready|approved|received|yes\b|live)/i, color: "green" },
];
const FALLBACK_COLORS = ["gray", "amber", "blue", "purple"];

function guessColor(label, index) {
  for (const rule of COLOR_RULES) {
    if (rule.re.test(label.trim())) return rule.color;
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function navigate(hash) {
  location.hash = hash;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const hash = location.hash.replace(/^#\/?/, "");
  const match = hash.match(/^artist\/(.+)$/);
  if (match) {
    const artist = state.artists.find((a) => a.id === decodeURIComponent(match[1]));
    if (artist) {
      app.appendChild(renderArtistPage(artist));
      syncEnterArtist(artist);
      syncSchedulePush(artist);
      return;
    }
  }
  syncExitArtist();
  app.appendChild(renderDashboard());
}

function renderDashboard() {
  const container = el("div");

  const header = el("div", { class: "header-row" }, [
    el("div", {}, [
      el("h1", {}, "Distro Tracker"),
      el("p", { class: "subtitle" }, "Physical & digital distribution status by artist"),
    ]),
    el("button", { class: "btn-primary", onclick: addArtist }, "+ Add Artist"),
  ]);
  container.appendChild(header);

  if (state.artists.length === 0) {
    container.appendChild(el("div", { class: "empty-state" }, "No artists yet. Add one to get started."));
    return container;
  }

  const grid = el("div", { class: "artist-grid" });
  for (const artist of state.artists) {
    const card = el(
      "div",
      {
        class: "artist-card",
        onclick: (e) => {
          if (e.target.closest(".remove-artist")) return;
          navigate(`#/artist/${encodeURIComponent(artist.id)}`);
        },
      },
      [
        el("button", {
          class: "btn-ghost remove-artist",
          title: "Remove artist",
          onclick: (e) => {
            e.stopPropagation();
            removeArtist(artist.id);
          },
        }, "✕"),
        el("p", { class: "name" }, artist.name),
      ]
    );
    grid.appendChild(card);
  }
  container.appendChild(grid);
  return container;
}

function renderArtistPage(artist) {
  const container = el("div");

  container.appendChild(
    el("button", { class: "back-link", onclick: () => navigate("#/") }, "← All artists")
  );

  const heading = el("div", { class: "artist-name-heading" }, [
    el("h1", {
      title: "Click to rename",
      onclick: (e) => startEditName(e.currentTarget, artist),
    }, artist.name),
  ]);
  container.appendChild(heading);
  container.appendChild(renderReleaseRow(artist));
  container.appendChild(renderSyncStatusRow(artist));
  container.appendChild(el("p", { class: "subtitle" }, "Distribution parameters"));

  for (const group of groupFields(state.fields)) {
    container.appendChild(el("p", { class: "group-heading" }, group.name));

    // Status, checklist, and multi fields each get their own box (any note/checkbox/entry
    // rows ride along); other field types share one box within the group, same as before.
    let list = null;
    let currentBoxKey = null;
    for (const field of group.fields) {
      const isOwnBox = field.type === "status" || field.type === "checklist" || field.type === "multi" || field.type === "derivedList";
      const startsNewBox = isOwnBox || !list;
      if (startsNewBox) {
        currentBoxKey = field.key;
        list = el("div", { class: "field-list" });
        if (isBoxCollapsed(artist, currentBoxKey)) list.classList.add("collapsed");
        container.appendChild(list);
      }

      if (field.type === "checklist") {
        renderChecklistField(list, artist, field, currentBoxKey);
        list = null;
        continue;
      }

      if (field.type === "multi") {
        renderMultiField(list, artist, field, currentBoxKey);
        list = null;
        continue;
      }

      if (field.type === "derivedList") {
        renderDerivedListField(list, artist, field, currentBoxKey);
        list = null;
        continue;
      }

      const rowChildren = [
        el("div", { class: "field-label" }, field.label),
        renderFieldValue(artist, field),
      ];
      if (startsNewBox) rowChildren.push(renderCollapseToggle(artist, currentBoxKey));
      rowChildren.push(el("button", {
        class: "btn-ghost remove-field",
        title: "Remove this parameter (from all artists)",
        onclick: () => removeField(field.key),
      }, "✕"));
      const row = el("div", { class: "field-row" }, rowChildren);
      list.appendChild(row);

      if (field.type === "status") {
        const current = artist.values[field.key] || "";
        const opt = field.options.find((o) => o.value === current);
        if (opt && opt.requiresNote) {
          list.appendChild(renderNoteRow(artist, field));
        }
        if (opt && opt.revealSelect) {
          renderRevealSelect(list, artist, field, opt.revealSelect);
        }
        if (field.dueRule) {
          renderDueRuleBox(list, artist, field);
        }
        list = null;
      }
    }

    // Street Dates gets a special rule: box turns green once digital and physical
    // match, orange while they're both set but differ.
    if (group.name === "Street Dates" && list) {
      colorStreetDatesBox(list, artist);
    }
  }

  container.appendChild(
    el("div", { class: "section-footer" }, [
      el("button", { class: "btn-secondary", onclick: addField }, "+ Add Parameter"),
    ])
  );

  return container;
}

function renderFieldValue(artist, field) {
  const current = artist.values[field.key] || "";
  const content = current
    ? (field.type === "status" ? renderBadge(field, current) : formatValue(field, current))
    : "Click to set…";
  const span = el(
    "div",
    {
      class: "field-value" + (current ? "" : " placeholder"),
      onclick: (e) => startEditValue(e.currentTarget, artist, field),
    },
    content
  );
  return span;
}

function startEditValue(node, artist, field) {
  if (field.type === "status") return startEditStatus(node, artist, field);

  const current = artist.values[field.key] || "";
  const input = el("input", {
    type: field.type === "date" ? "date" : "text",
    value: current,
  });
  node.replaceWith(input);
  input.focus();

  // Deferred (not immediate) so a click on another button right after editing
  // still lands on that button before this rebuilds the DOM out from under it.
  const commit = () => {
    artist.values[field.key] = input.value;
    saveState();
    setTimeout(render, 0);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.removeEventListener("blur", commit);
      render();
    }
  });
  input.addEventListener("blur", commit);
}

function startEditStatus(node, artist, field) {
  const current = artist.values[field.key] || "";
  const select = el("select", {});
  select.appendChild(el("option", { value: "" }, "— Select —"));
  for (const opt of field.options) {
    const optionEl = el("option", { value: opt.value }, opt.label);
    if (opt.value === current) optionEl.selected = true;
    select.appendChild(optionEl);
  }
  node.replaceWith(select);
  select.focus();

  select.addEventListener("change", () => {
    artist.values[field.key] = select.value;
    saveState();
    render();
  });
  select.addEventListener("blur", () => {
    if (document.body.contains(select)) setTimeout(render, 0);
  });
}

function renderChecklistField(list, artist, field, boxKey) {
  const values = ensureChecklistValue(artist, field);
  const complete = isChecklistComplete(field, values);
  list.classList.add(complete ? "status-complete" : "status-pending");

  const headerRow = el("div", { class: "field-row" }, [
    el("div", { class: "field-label" }, field.label),
    el("div", { class: "field-value" }, renderChecklistBadge(complete)),
    renderCollapseToggle(artist, boxKey),
    el("button", {
      class: "btn-ghost remove-field",
      title: "Remove this parameter (from all artists)",
      onclick: () => removeField(field.key),
    }, "✕"),
  ]);
  list.appendChild(headerRow);

  for (const item of field.items) {
    const checkboxId = `checklist-${field.key}-${item.key}`;
    const checkbox = el("input", { type: "checkbox", id: checkboxId });
    checkbox.checked = !!values[item.key];
    checkbox.addEventListener("change", () => {
      values[item.key] = checkbox.checked;
      saveState();
      render();
    });
    const label = el("label", { class: "checklist-label", for: checkboxId }, item.label);
    list.appendChild(el("div", { class: "field-row checklist-row" }, [checkbox, label]));
  }

  if (field.allowNote) {
    list.appendChild(renderNoteRow(artist, field));
  }
}

function colorStreetDatesBox(list, artist) {
  const digital = artist.values.streetDateDigital;
  const physical = artist.values.streetDatePhysical;
  if (!digital || !physical) return;
  list.classList.add(digital === physical ? "status-complete" : "status-pending");
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Generic support for any status field with a `dueRule`: shows a computed
// "Due: <date>" note (referenceField's date minus weeksBefore) and turns the box
// red once we're inside that runway and the field still isn't at doneValue.
function renderDueRuleBox(list, artist, field) {
  const rule = field.dueRule;
  const referenceValue = artist.values[rule.referenceField];
  if (!referenceValue) return;

  const windowMs = rule.weeksBefore * MS_PER_WEEK;
  const referenceDate = new Date(referenceValue + "T00:00:00");
  const dueDate = new Date(referenceDate.getTime() - windowMs);
  list.appendChild(el("div", { class: "field-row due-row" }, `Due: ${formatDateObj(dueDate)}`));

  const status = artist.values[field.key] || "";
  if (status === rule.doneValue) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (referenceDate - today < windowMs) {
    list.classList.add("status-danger");
  }
}

function renderMultiField(list, artist, field, boxKey) {
  const entries = ensureMultiValue(artist, field);

  const count = entries.filter((e) => e.value).length;
  const summary = count ? `${count} format${count > 1 ? "s" : ""}` : "No formats yet";

  const headerRow = el("div", { class: "field-row" }, [
    el("div", { class: "field-label" }, field.label),
    el("span", { class: "multi-summary" }, summary),
    el("button", {
      class: "btn-secondary btn-small",
      onclick: () => {
        entries.push({ id: uid() });
        saveState();
        render();
      },
    }, "+ Add"),
    renderCollapseToggle(artist, boxKey),
    el("button", {
      class: "btn-ghost remove-field",
      title: "Remove this parameter (from all artists)",
      onclick: () => removeField(field.key),
    }, "✕"),
  ]);
  list.appendChild(headerRow);

  entries.forEach((entry, idx) => {
    const select = el("select", {});
    select.appendChild(el("option", { value: "" }, "— Select —"));
    for (const opt of field.options) {
      const optionEl = el("option", { value: opt.value }, opt.label);
      if (opt.value === entry.value) optionEl.selected = true;
      select.appendChild(optionEl);
    }
    select.addEventListener("change", () => {
      entry.value = select.value;
      const opt = field.options.find((o) => o.value === entry.value);
      if (!opt || !opt.allowCustomTitle) delete entry.title;
      if (!entry.value) {
        delete entry.quantity;
        if (field.entrySubStatus) {
          delete entry[field.entrySubStatus.key];
          delete entry[field.entrySubStatus.extraFieldKey];
        }
        if (field.entrySubList) {
          delete entry[field.entrySubList.key];
        }
        if (field.entryExtraField) {
          delete entry[field.entryExtraField.key];
        }
      }
      saveState();
      render();
    });

    const rowChildren = [select];

    const opt = field.options.find((o) => o.value === entry.value);
    if (opt && opt.allowCustomTitle) {
      const titleInput = el("input", { type: "text", placeholder: "Title, e.g. Picture Disc Vinyl" });
      titleInput.value = entry.title || "";
      titleInput.addEventListener("blur", () => {
        entry.title = titleInput.value.trim();
        saveState();
        setTimeout(render, 0);
      });
      titleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") titleInput.blur();
      });
      rowChildren.push(titleInput);
    }

    if (entry.value) {
      rowChildren.push(el("span", { class: "qty-label" }, "Qty"));
      const qtyInput = el("input", { type: "number", min: "0", placeholder: "0" });
      qtyInput.value = entry.quantity != null ? entry.quantity : "";
      qtyInput.addEventListener("blur", () => {
        const val = qtyInput.value.trim();
        if (val === "") delete entry.quantity;
        else entry.quantity = Number(val);
        saveState();
        setTimeout(render, 0);
      });
      qtyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") qtyInput.blur();
      });
      rowChildren.push(qtyInput);
    }

    rowChildren.push(el("button", {
      class: "btn-ghost remove-field",
      title: "Remove this entry",
      onclick: () => {
        entries.splice(idx, 1);
        saveState();
        render();
      },
    }, "✕"));

    list.appendChild(el("div", { class: "field-row product-entry-row" }, rowChildren));

    if (field.entrySubStatus && entry.value) {
      renderEntrySubStatusRows(list, entry, field.entrySubStatus);
    }
    if (field.entryExtraField && entry.value) {
      renderEntryExtraField(list, entry, field.entryExtraField);
    }
    if (field.entrySubList && entry.value) {
      renderEntrySubList(list, entry, field.entrySubList);
    }
  });
}

// Renders a single always-visible follow-up text field under a product entry (e.g. PO#),
// independent of any other per-entry status.
function renderEntryExtraField(list, entry, config) {
  const valueDiv = el(
    "div",
    {
      class: "field-value" + (entry[config.key] ? "" : " placeholder"),
      onclick: (e) => startEditEntryExtraField(e.currentTarget, entry, config),
    },
    entry[config.key] || "Click to set…"
  );
  list.appendChild(el("div", { class: "field-row note-row entry-sub-row" }, [
    el("div", { class: "field-label" }, config.label),
    valueDiv,
  ]));
}

function startEditEntryExtraField(node, entry, config) {
  const input = el("input", { type: "text", placeholder: config.placeholder || config.label });
  input.value = entry[config.key] || "";
  node.replaceWith(input);
  input.focus();

  const commit = () => {
    const val = input.value.trim();
    if (val) entry[config.key] = val;
    else delete entry[config.key];
    saveState();
    setTimeout(render, 0);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") render();
  });
  input.addEventListener("blur", commit);
}

// Renders an add-as-many-as-you-want breakdown under a single product entry
// (e.g. Territory Breakdown: territory + distributor + qty, repeatable).
// Renders a derivedList field's box: one row per sourceField entry that has a UPC,
// showing what it is (type/title), its UPC, and a Registered/Not Registered dropdown.
// The row list itself is never edited directly — it always mirrors the source entries.
function renderDerivedListField(list, artist, field, boxKey) {
  const { sourceField, entries } = derivedListEntries(artist, field);
  const statuses = ensureDerivedListValue(artist, field);
  const upcKey = sourceField ? sourceField.entrySubStatus.extraFieldKey : "upc";
  const registeredCount = entries.filter((e) => statuses[e.id] === "registered").length;
  const summary = entries.length ? `${registeredCount}/${entries.length} registered` : "No UPCs yet";

  if (entries.length) {
    list.classList.add(registeredCount === entries.length ? "status-complete" : "status-pending");
  }

  list.appendChild(el("div", { class: "field-row" }, [
    el("div", { class: "field-label" }, field.label),
    el("span", { class: "multi-summary" }, summary),
    renderCollapseToggle(artist, boxKey),
    el("button", {
      class: "btn-ghost remove-field",
      title: "Remove this parameter (from all artists)",
      onclick: () => removeField(field.key),
    }, "✕"),
  ]));

  if (entries.length === 0) {
    list.appendChild(el("div", { class: "field-row" }, [
      el("div", { class: "field-value placeholder" }, "Set a UPC under Product to see it here."),
    ]));
    return;
  }

  for (const entry of entries) {
    const currentOpt = field.options.find((o) => o.value === statuses[entry.id]);
    const select = el("select", { class: currentOpt ? `status-select status-select-${currentOpt.color}` : "status-select" });
    select.appendChild(el("option", { value: "" }, "— Select —"));
    for (const opt of field.options) {
      const optionEl = el("option", { value: opt.value }, opt.label);
      if (opt.value === statuses[entry.id]) optionEl.selected = true;
      select.appendChild(optionEl);
    }
    select.addEventListener("change", () => {
      if (select.value) statuses[entry.id] = select.value;
      else delete statuses[entry.id];
      saveState();
      render();
    });

    list.appendChild(el("div", { class: "field-row title-reg-row" }, [
      el("div", { class: "field-label" }, resolveProductEntryDisplayLabel(sourceField, entry)),
      el("span", { class: "title-reg-upc" }, entry[upcKey]),
      select,
    ]));
  }
}

function renderEntrySubList(list, entry, config) {
  const items = Array.isArray(entry[config.key]) ? entry[config.key] : (entry[config.key] = []);
  const totalQty = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const summary = items.length
    ? `${items.length} ${items.length > 1 ? "entries" : "entry"}${totalQty ? ` · ${totalQty} total` : ""}`
    : "None yet";

  list.appendChild(el("div", { class: "field-row note-row entry-sub-row" }, [
    el("div", { class: "field-label" }, config.label),
    el("span", { class: "multi-summary" }, summary),
    el("button", {
      class: "btn-secondary btn-small",
      onclick: () => {
        items.push({ id: uid() });
        saveState();
        render();
      },
    }, "+ Add"),
  ]));

  items.forEach((item, idx) => {
    const rowChildren = [];
    for (const subfield of config.fields) {
      const input = el("input", {
        type: subfield.type === "number" ? "number" : "text",
        placeholder: subfield.placeholder || subfield.label,
      });
      if (subfield.type === "number") input.min = "0";
      input.value = item[subfield.key] != null ? item[subfield.key] : "";
      input.addEventListener("blur", () => {
        const val = input.value.trim();
        if (val === "") delete item[subfield.key];
        else item[subfield.key] = subfield.type === "number" ? Number(val) : val;
        saveState();
        setTimeout(render, 0);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
      });
      rowChildren.push(input);
    }

    rowChildren.push(el("button", {
      class: "btn-ghost remove-field",
      title: "Remove this entry",
      onclick: () => {
        items.splice(idx, 1);
        saveState();
        render();
      },
    }, "✕"));

    list.appendChild(el("div", { class: "field-row territory-row" }, rowChildren));
  });
}

// Renders the secondary status row (e.g. GS1 Registration) under a single product entry,
// plus its conditional extra text field (e.g. UPC) when the matching value is selected.
function renderEntrySubStatusRows(list, entry, config) {
  const currentOpt = config.options.find((o) => o.value === entry[config.key]);
  const select = el("select", { class: currentOpt ? `status-select status-select-${currentOpt.color}` : "status-select" });
  select.appendChild(el("option", { value: "" }, "— Select —"));
  for (const opt of config.options) {
    const optionEl = el("option", { value: opt.value }, opt.label);
    if (opt.value === entry[config.key]) optionEl.selected = true;
    select.appendChild(optionEl);
  }
  select.addEventListener("change", () => {
    entry[config.key] = select.value;
    if (entry[config.key] !== config.upcOnValue) delete entry[config.extraFieldKey];
    saveState();
    render();
  });

  list.appendChild(el("div", { class: "field-row note-row entry-sub-row" }, [
    el("div", { class: "field-label" }, config.label),
    select,
  ]));

  if (entry[config.key] === config.upcOnValue) {
    const extraInput = el("input", { type: "text", placeholder: `Paste ${config.extraFieldLabel}…` });
    extraInput.value = entry[config.extraFieldKey] || "";
    extraInput.addEventListener("blur", () => {
      entry[config.extraFieldKey] = extraInput.value.trim();
      saveState();
      setTimeout(render, 0);
    });
    extraInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") extraInput.blur();
    });
    list.appendChild(el("div", { class: "field-row note-row entry-sub-row" }, [
      el("div", { class: "field-label" }, config.extraFieldLabel),
      extraInput,
    ]));
  }
}

function renderNoteRow(artist, field) {
  const notes = ensureNotes(artist);
  const valueDiv = el(
    "div",
    {
      class: "field-value" + (notes[field.key] ? "" : " placeholder"),
      onclick: (e) => startEditKeyedNote(e.currentTarget, notes, field.key),
    },
    notes[field.key] || "Click to add details…"
  );
  return el("div", { class: "field-row note-row" }, [
    el("div", { class: "field-label" }, "Details"),
    valueDiv,
  ]);
}

// Generic click-to-edit textarea backing any {notesObj, key} pair — used both for a
// field's own "Details" note and for per-item notes inside a revealed checklist.
function startEditKeyedNote(node, notesObj, key) {
  const current = notesObj[key] || "";
  const textarea = el("textarea", { rows: "2" });
  textarea.value = current;
  node.replaceWith(textarea);
  textarea.focus();

  const commit = () => {
    const val = textarea.value.trim();
    if (val) notesObj[key] = val;
    else delete notesObj[key];
    saveState();
    setTimeout(render, 0);
  };
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Escape") render();
  });
  textarea.addEventListener("blur", commit);
}

// Renders the secondary dropdown revealed by a status option (e.g. Manufacturing: Yes ->
// International / Domestic / Both), then the follow-up fields for whichever item(s) that
// selection resolves to (a "Both" option can activate more than one item at once).
function renderRevealSelect(list, artist, field, config) {
  const storageKey = `${field.key}::${config.key}`;
  const current = artist.values[storageKey] || "";

  const select = el("select", {});
  select.appendChild(el("option", { value: "" }, "— Select —"));
  for (const opt of config.options) {
    const optionEl = el("option", { value: opt.value }, opt.label);
    if (opt.value === current) optionEl.selected = true;
    select.appendChild(optionEl);
  }
  select.addEventListener("change", () => {
    artist.values[storageKey] = select.value;
    saveState();
    render();
  });
  list.appendChild(el("div", { class: "field-row note-row entry-sub-row" }, [
    el("div", { class: "field-label" }, "Region"),
    select,
  ]));

  const selectedOpt = config.options.find((o) => o.value === current);
  const activeItemKeys = selectedOpt ? selectedOpt.items : [];
  const notes = ensureNotes(artist);
  for (const itemKey of activeItemKeys) {
    const item = config.items.find((it) => it.key === itemKey);
    if (!item) continue;
    if (activeItemKeys.length > 1) {
      list.appendChild(el("div", { class: "field-row note-row entry-sub-row" }, [
        el("div", { class: "field-label" }, item.label),
      ]));
    }
    for (const subfield of item.fields || []) {
      const noteKey = `${field.key}::${item.key}::${subfield.key}`;
      list.appendChild(renderRevealSubfieldRow(notes, noteKey, subfield));
    }
  }
}

function renderRevealSubfieldRow(notes, noteKey, subfield) {
  if (subfield.type === "number") {
    const input = el("input", { type: "number", min: "0", placeholder: "0" });
    input.value = notes[noteKey] || "";
    input.addEventListener("blur", () => {
      const val = input.value.trim();
      if (val === "") delete notes[noteKey];
      else notes[noteKey] = val;
      saveState();
      setTimeout(render, 0);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
    return el("div", { class: "field-row note-row entry-sub-row" }, [
      el("div", { class: "field-label" }, subfield.label),
      input,
    ]);
  }

  const valueDiv = el(
    "div",
    {
      class: "field-value" + (notes[noteKey] ? "" : " placeholder"),
      onclick: (e) => startEditKeyedNote(e.currentTarget, notes, noteKey),
    },
    notes[noteKey] || "Click to set…"
  );
  return el("div", { class: "field-row note-row entry-sub-row" }, [
    el("div", { class: "field-label" }, subfield.label),
    valueDiv,
  ]);
}

function startEditName(node, artist) {
  const input = el("input", { type: "text", value: artist.name });
  input.style.font = "inherit";
  input.style.fontSize = "22px";
  input.style.fontWeight = "650";
  input.style.padding = "2px 6px";
  input.style.border = "1px solid var(--accent)";
  input.style.borderRadius = "6px";
  node.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const val = input.value.trim();
    if (val) artist.name = val;
    saveState();
    setTimeout(render, 0);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") render();
  });
  input.addEventListener("blur", commit);
}

function renderReleaseRow(artist) {
  const current = artist.release || "";
  const valueSpan = el(
    "span",
    {
      class: "release-value" + (current ? "" : " placeholder"),
      onclick: (e) => startEditRelease(e.currentTarget, artist),
    },
    current || "Click to set…"
  );
  return el("p", { class: "release-line" }, ["Release: ", valueSpan]);
}

function startEditRelease(node, artist) {
  const input = el("input", { type: "text", placeholder: "Album name" });
  input.value = artist.release || "";
  node.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const val = input.value.trim();
    if (val) artist.release = val;
    else delete artist.release;
    saveState();
    setTimeout(render, 0);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") render();
  });
  input.addEventListener("blur", commit);
}

// ============================================================================
// Google Sheet sync (optional — no-ops entirely when sync-config.js's
// SHEET_SYNC_URL is blank). See apps-script/SETUP.md for how to connect one.
//
// Website edits push to the artist's Sheet tab ~1.5s after the last change.
// The artist's page pulls from the Sheet on load and every 30s while open, so
// edits made directly in the Sheet show up without a hard refresh. Whichever
// side changed most recently within that window wins — there's no merge of
// simultaneous conflicting edits on both sides.
// ============================================================================

const SYNC_URL = typeof SHEET_SYNC_URL === "string" ? SHEET_SYNC_URL.trim() : "";
const SYNC_POLL_MS = 30000;
const SYNC_PUSH_DEBOUNCE_MS = 1500;

let syncActiveArtistId = null;
let syncIntervalId = null;
let syncPushTimer = null;
let syncSuppressNextPush = false;
let syncBusy = false;

function syncEnabled() {
  return !!SYNC_URL;
}

function renderSyncStatusRow(artist) {
  if (!syncEnabled()) return el("div", {});
  return el("p", { class: "sync-status-line" }, [
    el("span", { id: "sync-status-text" }, "Not yet synced"),
    el("button", { class: "btn-ghost sync-now-btn", onclick: () => syncPullNow(artist, { force: true }) }, "Sync now"),
  ]);
}

function setSyncStatusText(text, isError) {
  const node = document.getElementById("sync-status-text");
  if (!node) return;
  node.textContent = text;
  node.classList.toggle("sync-error", !!isError);
}

function syncEnterArtist(artist) {
  if (!syncEnabled()) return;
  if (syncActiveArtistId === artist.id) return;
  syncExitArtist();
  syncActiveArtistId = artist.id;
  syncSuppressNextPush = true; // this render just entered the page; nothing to push yet
  syncPullNow(artist);
  syncIntervalId = setInterval(() => {
    const current = state.artists.find((a) => a.id === syncActiveArtistId);
    if (current) syncPullNow(current);
  }, SYNC_POLL_MS);
}

function syncExitArtist() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  if (syncPushTimer) {
    clearTimeout(syncPushTimer);
    syncPushTimer = null;
  }
  syncActiveArtistId = null;
}

function syncSchedulePush(artist) {
  if (!syncEnabled()) return;
  if (syncSuppressNextPush) {
    syncSuppressNextPush = false;
    return;
  }
  if (syncPushTimer) clearTimeout(syncPushTimer);
  syncPushTimer = setTimeout(() => syncPushNow(artist), SYNC_PUSH_DEBOUNCE_MS);
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ---- Flattening an artist's simple parameters to/from [label, value] rows ----

function syncBuildParameters(artist) {
  const rows = [["Release", artist.release || ""]];
  const notes = artist.notes || {};
  for (const field of state.fields) {
    if (field.type === "multi") continue; // Product/Territory get their own tables
    if (field.type === "date" || field.type === "text") {
      rows.push([field.label, artist.values[field.key] || ""]);
    } else if (field.type === "checklist") {
      const values = artist.values[field.key] || {};
      for (const item of field.items) {
        rows.push([`${field.label}: ${item.label}`, values[item.key] ? "TRUE" : "FALSE"]);
      }
      if (field.allowNote) rows.push([`${field.label}: Details`, notes[field.key] || ""]);
    } else if (field.type === "status") {
      const raw = artist.values[field.key] || "";
      const opt = field.options.find((o) => o.value === raw);
      rows.push([field.label, opt ? opt.label : ""]);
      if (opt && opt.requiresNote) {
        rows.push([`${field.label}: Details`, notes[field.key] || ""]);
      }
      if (opt && opt.revealSelect) {
        const rc = opt.revealSelect;
        const regionLabel = rc.key.charAt(0).toUpperCase() + rc.key.slice(1);
        const regionVal = artist.values[`${field.key}::${rc.key}`] || "";
        const regionOpt = rc.options.find((o) => o.value === regionVal);
        rows.push([`${field.label}: ${regionLabel}`, regionOpt ? regionOpt.label : ""]);
        for (const item of rc.items) {
          for (const sub of item.fields || []) {
            rows.push([`${field.label}: ${item.label} ${sub.label}`, notes[`${field.key}::${item.key}::${sub.key}`] || ""]);
          }
        }
      }
    }
  }
  return rows;
}

function syncApplyParameters(artist, rows) {
  const byLabel = new Map(rows.map((r) => [r[0], r[1]]));
  const val = (label) => (byLabel.get(label) || "").toString().trim();
  const matchOption = (options, label) => options.find(
    (o) => o.label.toLowerCase() === label.toLowerCase() || o.value.toLowerCase() === label.toLowerCase()
  );

  artist.notes = artist.notes || {};
  const release = val("Release");
  if (release) artist.release = release;
  else delete artist.release;

  for (const field of state.fields) {
    if (field.type === "multi") continue;
    if (field.type === "date" || field.type === "text") {
      const v = val(field.label);
      if (v) artist.values[field.key] = v;
      else delete artist.values[field.key];
    } else if (field.type === "checklist") {
      const values = {};
      for (const item of field.items) {
        const v = val(`${field.label}: ${item.label}`).toUpperCase();
        values[item.key] = v === "TRUE" || v === "YES" || v === "1";
      }
      artist.values[field.key] = values;
      if (field.allowNote) {
        const detail = val(`${field.label}: Details`);
        if (detail) artist.notes[field.key] = detail;
        else delete artist.notes[field.key];
      }
    } else if (field.type === "status") {
      const opt = matchOption(field.options, val(field.label));
      if (opt) artist.values[field.key] = opt.value;
      else delete artist.values[field.key];

      if (opt && opt.requiresNote) {
        const detail = val(`${field.label}: Details`);
        if (detail) artist.notes[field.key] = detail;
        else delete artist.notes[field.key];
      }
      if (opt && opt.revealSelect) {
        const rc = opt.revealSelect;
        const regionLabel = rc.key.charAt(0).toUpperCase() + rc.key.slice(1);
        const regionOpt = matchOption(rc.options, val(`${field.label}: ${regionLabel}`));
        const regionKey = `${field.key}::${rc.key}`;
        if (regionOpt) artist.values[regionKey] = regionOpt.value;
        else delete artist.values[regionKey];
        for (const item of rc.items) {
          for (const sub of item.fields || []) {
            const noteKey = `${field.key}::${item.key}::${sub.key}`;
            const v = val(`${field.label}: ${item.label} ${sub.label}`);
            if (v) artist.notes[noteKey] = v;
            else delete artist.notes[noteKey];
          }
        }
      }
    }
  }
}

// ---- Product + Territory Breakdown tables ----

function findProductField() {
  return state.fields.find((f) => f.type === "multi");
}

function syncBuildProductAndTerritories(artist) {
  const productField = findProductField();
  const product = [];
  const territories = [];
  if (!productField) return { product, territories };

  const derivedField = state.fields.find((f) => f.type === "derivedList" && f.sourceField === productField.key);
  const titleRegStatuses = derivedField ? ensureDerivedListValue(artist, derivedField) : {};

  const entries = Array.isArray(artist.values[productField.key]) ? artist.values[productField.key] : [];
  for (const entry of entries) {
    if (!entry.value) continue;
    if (!entry.id) entry.id = uid();
    const opt = productField.options.find((o) => o.value === entry.value);
    const title = opt && opt.allowCustomTitle ? entry.title || "" : "";
    let gs1Label = "";
    let upc = "";
    if (productField.entrySubStatus) {
      const cfg = productField.entrySubStatus;
      const gs1Opt = cfg.options.find((o) => o.value === entry[cfg.key]);
      gs1Label = gs1Opt ? gs1Opt.label : "";
      upc = entry[cfg.extraFieldKey] || "";
    }
    let titleRegLabel = "";
    if (derivedField && upc) {
      const statusOpt = derivedField.options.find((o) => o.value === titleRegStatuses[entry.id]);
      titleRegLabel = statusOpt ? statusOpt.label : "";
    }
    const poNumber = productField.entryExtraField ? entry[productField.entryExtraField.key] || "" : "";
    product.push([entry.id, opt ? opt.label : entry.value, title, entry.quantity != null ? entry.quantity : "", gs1Label, upc, titleRegLabel, poNumber]);

    if (productField.entrySubList) {
      const items = Array.isArray(entry[productField.entrySubList.key]) ? entry[productField.entrySubList.key] : [];
      for (const item of items) {
        territories.push([entry.id, item.territory || "", item.distributor || "", item.quantity != null ? item.quantity : ""]);
      }
    }
  }
  return { product, territories };
}

function syncApplyProductAndTerritories(artist, productRows, territoryRows) {
  const productField = findProductField();
  if (!productField) return;
  const derivedField = state.fields.find((f) => f.type === "derivedList" && f.sourceField === productField.key);

  const toNumberOrUndefined = (v) => (v !== "" && v != null && !isNaN(Number(v)) ? Number(v) : undefined);

  const newEntries = productRows.map((row) => {
    const [rawId, typeLabel, title, quantity, gs1Label, upc, , poNumber] = row;
    const entry = { id: (rawId || "").toString().trim() || uid() };

    const opt = productField.options.find(
      (o) => o.label.toLowerCase() === (typeLabel || "").toString().trim().toLowerCase()
        || o.value.toLowerCase() === (typeLabel || "").toString().trim().toLowerCase()
    );
    if (opt) entry.value = opt.value;
    if (opt && opt.allowCustomTitle && title) entry.title = title.toString().trim();
    const qty = toNumberOrUndefined(quantity);
    if (qty !== undefined) entry.quantity = qty;

    if (productField.entrySubStatus) {
      const cfg = productField.entrySubStatus;
      const gs1Opt = cfg.options.find(
        (o) => o.label.toLowerCase() === (gs1Label || "").toString().trim().toLowerCase()
          || o.value.toLowerCase() === (gs1Label || "").toString().trim().toLowerCase()
      );
      if (gs1Opt) entry[cfg.key] = gs1Opt.value;
      if (entry[cfg.key] === cfg.upcOnValue && upc) entry[cfg.extraFieldKey] = upc.toString().trim();
    }
    if (productField.entryExtraField && poNumber) {
      entry[productField.entryExtraField.key] = poNumber.toString().trim();
    }
    return entry;
  });

  if (productField.entrySubList) {
    const byProductId = new Map();
    for (const row of territoryRows) {
      const [productId, territory, distributor, quantity] = row;
      const pid = (productId || "").toString().trim();
      if (!pid) continue;
      if (!byProductId.has(pid)) byProductId.set(pid, []);
      const territoryEntry = {
        id: uid(),
        territory: (territory || "").toString().trim(),
        distributor: (distributor || "").toString().trim(),
      };
      const qty = toNumberOrUndefined(quantity);
      if (qty !== undefined) territoryEntry.quantity = qty;
      byProductId.get(pid).push(territoryEntry);
    }
    for (const entry of newEntries) {
      entry[productField.entrySubList.key] = byProductId.get(entry.id) || [];
    }
  }

  if (derivedField) {
    const statuses = {};
    productRows.forEach((row, i) => {
      const titleRegLabel = (row[6] || "").toString().trim();
      if (!titleRegLabel) return;
      const opt = derivedField.options.find(
        (o) => o.label.toLowerCase() === titleRegLabel.toLowerCase() || o.value.toLowerCase() === titleRegLabel.toLowerCase()
      );
      if (opt) statuses[newEntries[i].id] = opt.value;
    });
    artist.values[derivedField.key] = statuses;
  }

  artist.values[productField.key] = newEntries;
}

// ---- Network calls ----

async function syncPushNow(artist) {
  if (!syncEnabled() || syncBusy) return;
  syncBusy = true;
  setSyncStatusText("Syncing…");
  try {
    const parameters = syncBuildParameters(artist);
    const { product, territories } = syncBuildProductAndTerritories(artist);
    saveState(); // persists any entry IDs syncBuildProductAndTerritories just backfilled
    await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "push", artist: artist.name, parameters, product, territories }),
    });
    artist.syncHash = simpleHash(JSON.stringify({ parameters, product, territories }));
    saveState();
    setSyncStatusText(`Synced ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    setSyncStatusText("Sync error — will retry", true);
  } finally {
    syncBusy = false;
  }
}

async function syncPullNow(artist, opts = {}) {
  if (!syncEnabled() || syncBusy) return;
  syncBusy = true;
  setSyncStatusText("Syncing…");
  try {
    const res = await fetch(`${SYNC_URL}?action=pull&artist=${encodeURIComponent(artist.name)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    if (!data.exists) {
      syncBusy = false;
      await syncPushNow(artist); // nothing in the Sheet yet for this artist — seed it
      return;
    }

    const hash = simpleHash(JSON.stringify({ parameters: data.parameters, product: data.product, territories: data.territories }));
    if (hash === artist.syncHash && !opts.force) {
      setSyncStatusText(`Synced ${new Date().toLocaleTimeString()}`);
      return;
    }

    // Don't yank the DOM out from under an in-progress edit.
    const active = document.activeElement;
    const appEl = document.getElementById("app");
    const isEditing = active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName) && appEl && appEl.contains(active);
    if (isEditing && !opts.force) {
      setSyncStatusText("Sheet changed — will refresh when you're done editing");
      return;
    }

    syncApplyParameters(artist, data.parameters);
    syncApplyProductAndTerritories(artist, data.product, data.territories);
    artist.syncHash = hash;
    saveState();
    syncSuppressNextPush = true;
    render();
    setSyncStatusText(`Synced ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    setSyncStatusText("Sync error — will retry", true);
  } finally {
    syncBusy = false;
  }
}

function addArtist() {
  const name = prompt("Artist name:");
  if (!name || !name.trim()) return;
  const id = slugify(name.trim());
  state.artists.push({ id, name: name.trim(), values: {} });
  saveState();
  render();
}

function removeArtist(id) {
  const artist = state.artists.find((a) => a.id === id);
  if (!artist) return;
  if (!confirm(`Remove "${artist.name}" from the tracker?`)) return;
  state.artists = state.artists.filter((a) => a.id !== id);
  saveState();
  render();
}

function addField() {
  const label = prompt('Parameter name (e.g. "Mastering" or "Street Date (Physical)"):');
  if (!label || !label.trim()) return;
  const typeInput = (prompt(
    'Type: "date", "status" (single choice), "checklist" (a set of checkboxes), "multi" (an add-as-many-as-you-want list, e.g. product formats), or "text"?',
    "status"
  ) || "text")
    .trim()
    .toLowerCase();

  const key = fieldKeyFromLabel(label.trim());
  const field = { key, label: label.trim(), type: "text" };

  if (typeInput === "date") {
    field.type = "date";
  } else if (typeInput === "multi") {
    const optionsRaw = prompt('Options, comma-separated (e.g. "CD, Vinyl, Other"):', "CD, Vinyl, Other");
    if (!optionsRaw || !optionsRaw.trim()) return;
    const labels = optionsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (labels.length === 0) return;

    const titleOptionsRaw = prompt(
      'Which option(s) should let you type a custom title each time (e.g. for "Other")? Comma-separated, or blank for none:',
      labels.includes("Other") ? "Other" : ""
    );
    const titleLabels = new Set((titleOptionsRaw || "").split(",").map((s) => s.trim()).filter(Boolean));

    field.type = "multi";
    field.options = labels.map((optLabel, i) => ({
      value: slugifyOption(optLabel),
      label: optLabel,
      color: guessColor(optLabel, i),
      ...(titleLabels.has(optLabel) ? { allowCustomTitle: true } : {}),
    }));
  } else if (typeInput === "checklist") {
    const itemsRaw = prompt('Checklist items, comma-separated (e.g. "Mock-up created, Shared with team, Approved by team"):');
    if (!itemsRaw || !itemsRaw.trim()) return;
    const itemLabels = itemsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (itemLabels.length === 0) return;
    field.type = "checklist";
    field.items = itemLabels.map((itemLabel) => ({ key: slugifyOption(itemLabel), label: itemLabel }));
    field.allowNote = confirm('Also add an optional free-text "details" box below the checklist?');
  } else if (typeInput === "status") {
    const optionsRaw = prompt('Options, comma-separated (e.g. "Delivered, Not Delivered"):', "Delivered, Not Delivered");
    if (!optionsRaw || !optionsRaw.trim()) return;
    const labels = optionsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (labels.length === 0) return;

    const noteOptionsRaw = prompt(
      'Should picking any option show a free-text "details" box (e.g. for "Other")? Comma-separated option name(s), or leave blank for none:',
      labels.includes("Other") ? "Other" : ""
    );
    const noteLabels = new Set((noteOptionsRaw || "").split(",").map((s) => s.trim()).filter(Boolean));

    field.type = "status";
    field.options = labels.map((optLabel, i) => ({
      value: slugifyOption(optLabel),
      label: optLabel,
      color: guessColor(optLabel, i),
      ...(noteLabels.has(optLabel) ? { requiresNote: true } : {}),
    }));
  }

  const existingGroups = [...new Set(state.fields.map((f) => f.group || "General"))];
  const groupPrompt = existingGroups.length
    ? `Group this belongs to (existing: ${existingGroups.join(", ")}) — fields in the same group are shown together:`
    : "Group this belongs to (fields in the same group are shown together):";
  field.group = (prompt(groupPrompt, existingGroups[0] || "General") || "General").trim() || "General";

  state.fields.push(field);
  saveState();
  render();
}

function removeField(key) {
  const field = state.fields.find((f) => f.key === key);
  if (!field) return;
  if (!confirm(`Remove "${field.label}" as a tracked parameter for all artists?`)) return;
  state.fields = state.fields.filter((f) => f.key !== key);
  for (const artist of state.artists) {
    delete artist.values[key];
  }
  saveState();
  render();
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
render();
