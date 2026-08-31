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
        { value: "vinyl", label: "Vinyl", color: "purple", allowCustomTitle: true },
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
      // Renders an add-as-many-as-you-want breakdown under each entry (e.g. how many
      // units go to each territory/distributor).
      entrySubList: {
        key: "territories",
        label: "Territory Breakdown",
        fields: [
          { key: "territory", label: "Territory", type: "text", placeholder: "e.g. US" },
          { key: "distributor", label: "Distributor / Location", type: "text", placeholder: "e.g. AMPED" },
          { key: "quantity", label: "Qty", type: "number" },
        ],
      },
    },
    {
      key: "luminateRegistration",
      label: "Luminate Registration",
      type: "status",
      group: "Type",
      options: [
        { value: "registered", label: "Registered", color: "green" },
        { value: "not_registered", label: "Not Registered", color: "red" },
      ],
    },
    {
      key: "mergeRequest",
      label: "Merge Request",
      type: "status",
      group: "Status",
      options: [
        { value: "submitted", label: "Submitted", color: "green" },
        { value: "not_submitted", label: "Not Submitted", color: "red" },
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
      key: "artProof",
      label: "Art Proof",
      type: "checklist",
      group: "Status",
      allowNote: true,
      // Always-visible extra note boxes, independent of checklist completion.
      extraNotes: [{ key: "link", label: "Link" }],
      items: [
        { key: "mockup", label: "Mock-up created" },
        { key: "shared", label: "Shared with team" },
        { key: "approved", label: "Approved by team" },
      ],
    },
    {
      key: "d2c",
      label: "D2C",
      type: "status",
      group: "Status",
      options: [
        { value: "yes", label: "Yes", color: "green", requiresNote: true, noteLabel: "Link" },
        { value: "no", label: "No", color: "red" },
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
          // Picking this option reveals an add-as-many-as-you-want list of plants, each
          // tagged with its own region — rather than picking a region first.
          revealList: {
            key: "manufacturing::plants",
            label: "Plants",
            fields: [
              { key: "plant", label: "Plant Name", type: "text", placeholder: "e.g. Memphis Record Pressing" },
              {
                key: "region",
                label: "Region",
                type: "select",
                options: [
                  { value: "international", label: "International" },
                  { value: "domestic", label: "Domestic" },
                ],
              },
              { key: "quantity", label: "Quantity", type: "text", placeholder: "e.g. 500 units" },
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
        { value: "submitted", label: "Submitted", color: "green", requiresNote: true, noteLabel: "Link" },
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
        { value: "submitted", label: "Submitted", color: "green", requiresNote: true, noteLabel: "Link" },
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
// (e.g. GS1 Registration moved from its own Status field to living under each Product entry;
// Title Registration was replaced by the simple Luminate Registration status field).
const REMOVED_FIELD_KEYS = ["gs1Registration", "titleRegistration", "artwork"];

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
    // it later lived at "manufacturing::<item>::plant" alongside a sibling quantity field.
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
    // ({international, domestic}); it later became a single dropdown at
    // "manufacturing::region" gating one fixed Plant Name + Quantity per region.
    const oldChecklist = artist.values && artist.values["manufacturing::checklist"];
    if (oldChecklist && artist.values["manufacturing::region"] === undefined) {
      if (oldChecklist.international && oldChecklist.domestic) artist.values["manufacturing::region"] = "both";
      else if (oldChecklist.international) artist.values["manufacturing::region"] = "international";
      else if (oldChecklist.domestic) artist.values["manufacturing::region"] = "domestic";
      delete artist.values["manufacturing::checklist"];
    }
    // Manufacturing now supports any number of plants, each tagged with its own region,
    // stored as a list at "manufacturing::plants". Fold the old single-plant-per-region
    // shape (one Plant Name + Quantity note per region, gated by "manufacturing::region")
    // into that list.
    if (artist.values && artist.values["manufacturing::plants"] === undefined) {
      const regionVal = artist.values["manufacturing::region"];
      const activeRegions = regionVal === "both" ? ["international", "domestic"] : regionVal ? [regionVal] : [];
      const plants = [];
      for (const region of activeRegions) {
        const plant = (artist.notes && artist.notes[`manufacturing::${region}::plant`]) || "";
        const quantity = (artist.notes && artist.notes[`manufacturing::${region}::quantity`]) || "";
        if (!plant && !quantity) continue;
        const entry = { id: uid(), region };
        if (plant) entry.plant = plant;
        if (quantity) entry.quantity = quantity;
        plants.push(entry);
      }
      if (plants.length) artist.values["manufacturing::plants"] = plants;
    }
    delete artist.values["manufacturing::region"];
    if (artist.notes) {
      for (const region of ["international", "domestic"]) {
        delete artist.notes[`manufacturing::${region}::plant`];
        delete artist.notes[`manufacturing::${region}::quantity`];
      }
    }
    // PO# tracking (tried both as a per-entry field and a per-territory-row field) has
    // been dropped entirely; strip any leftover values so they don't linger unused.
    for (const field of loaded.fields) {
      if (field.type !== "multi" || !field.entrySubList) continue;
      const entries = Array.isArray(artist.values[field.key]) ? artist.values[field.key] : [];
      for (const entry of entries) {
        delete entry.poNumber;
        const territories = Array.isArray(entry[field.entrySubList.key]) ? entry[field.entrySubList.key] : [];
        for (const t of territories) delete t.poNumber;
      }
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
    if (field.extraNotes && !existing.extraNotes) {
      existing.extraNotes = structuredClone(field.extraNotes);
    }
    if (field.entrySubStatus && !existing.entrySubStatus) {
      existing.entrySubStatus = structuredClone(field.entrySubStatus);
    }
    if (field.entrySubList && !existing.entrySubList) {
      existing.entrySubList = structuredClone(field.entrySubList);
    } else if (field.entrySubList && existing.entrySubList) {
      // Backfill any subfields added to entrySubList after this field was saved, and drop
      // any that have since been removed (e.g. PO#).
      const currentSubKeys = new Set(field.entrySubList.fields.map((f) => f.key));
      existing.entrySubList.fields = existing.entrySubList.fields.filter((f) => currentSubKeys.has(f.key));
      const existingSubKeys = new Set(existing.entrySubList.fields.map((f) => f.key));
      for (const sub of field.entrySubList.fields) {
        if (!existingSubKeys.has(sub.key)) existing.entrySubList.fields.push(structuredClone(sub));
      }
    }
    // PO# used to live in its own entryExtraField (an even older layout); drop any
    // leftover config from that.
    if (!field.entryExtraField && existing.entryExtraField) {
      delete existing.entryExtraField;
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
            // revealList (like the older revealSelect/revealChecklist it replaced) is
            // entirely code-defined (never user-edited), so always resync from the
            // current schema rather than trying to detect drift.
            if (opt.revealList) {
              existingOpt.revealList = structuredClone(opt.revealList);
            }
            delete existingOpt.revealSelect;
            delete existingOpt.revealChecklist;
            if (opt.allowCustomTitle && !existingOpt.allowCustomTitle) {
              existingOpt.allowCustomTitle = true;
            }
            if (opt.requiresNote && !existingOpt.requiresNote) {
              existingOpt.requiresNote = true;
            }
            if (opt.noteLabel && existingOpt.noteLabel !== opt.noteLabel) {
              existingOpt.noteLabel = opt.noteLabel;
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

// ---- Edit lock ----
// A soft deterrent, not real security: the password lives right here in this file's
// source, and the Sheet's sync endpoint has no auth of its own — anyone who opens dev
// tools, views source, or calls the endpoint directly can bypass this entirely. It only
// stops casual viewers from clicking into edit controls; it's not a boundary for
// sensitive data. Real access control would mean restricting the site and the Apps
// Script backend to specific signed-in Google accounts, which is a much bigger change.
const EDIT_UNLOCK_KEY = "distroTrackerEditUnlocked";
const EDIT_PASSWORD_HASH = simpleHash("mikeisawesome");

function isEditUnlocked() {
  return localStorage.getItem(EDIT_UNLOCK_KEY) === "1";
}

function promptUnlockEditing() {
  const attempt = prompt("Enter the editing password:");
  if (attempt === null) return;
  if (simpleHash(attempt) === EDIT_PASSWORD_HASH) {
    localStorage.setItem(EDIT_UNLOCK_KEY, "1");
    render();
  } else {
    alert("That's not it.");
  }
}

function lockEditing() {
  localStorage.removeItem(EDIT_UNLOCK_KEY);
  render();
}

function renderEditLockRow() {
  const unlocked = isEditUnlocked();
  return el("div", { class: "edit-lock-row" }, [
    el("span", { class: "edit-lock-status" }, unlocked ? "Editing unlocked" : "View only"),
    el("button", {
      class: "btn-ghost btn-small edit-lock-toggle",
      onclick: unlocked ? lockEditing : promptUnlockEditing,
    }, unlocked ? "Lock" : "Unlock editing"),
  ]);
}

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

// A field counts as "filled" differently per type: a multi field (e.g. Product) needs
// at least one entry with a type picked, a checklist needs every item checked, anything
// else (status/date/text) just needs a truthy value.
function isFieldFilled(field, artist) {
  const raw = artist.values[field.key];
  if (field.type === "multi") {
    return Array.isArray(raw) && raw.some((entry) => !!entry.value);
  }
  if (field.type === "checklist") {
    return isChecklistComplete(field, raw);
  }
  return !!raw;
}

// Fraction (0..1) of the current field schema that this artist has filled in — drives
// the red/yellow/green gradient on the dashboard cards.
function artistCompletion(artist) {
  if (!state.fields.length) return 0;
  const filled = state.fields.filter((field) => isFieldFilled(field, artist)).length;
  return filled / state.fields.length;
}

// Maps a 0..1 completion fraction to a red -> yellow -> green hue (0 -> 60 -> 120).
function completionHue(fraction) {
  return Math.round(fraction * 120);
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
  app.classList.toggle("read-only", !isEditUnlocked());
  app.appendChild(renderEditLockRow());
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
  syncDiscoverArtists();
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
  container.appendChild(renderDashboardSyncRow());

  if (state.artists.length === 0) {
    container.appendChild(el("div", { class: "empty-state" }, "No artists yet. Add one to get started."));
    return container;
  }

  const grid = el("div", { class: "artist-grid" });
  for (const artist of state.artists) {
    const filledCount = state.fields.filter((field) => isFieldFilled(field, artist)).length;
    const completion = state.fields.length ? filledCount / state.fields.length : 0;
    const hue = completionHue(completion);

    const card = el(
      "div",
      {
        class: "artist-card",
        style: `background: hsl(${hue}, 60%, 93%); border-color: hsl(${hue}, 55%, 72%);`,
        onclick: (e) => {
          if (e.target.closest(".remove-artist")) return;
          navigate(`#/artist/${encodeURIComponent(artist.id)}`);
        },
      },
      [
        el("div", { class: "card-accent-bar", style: `background: hsl(${hue}, 65%, 46%);` }),
        el("button", {
          class: "btn-ghost remove-artist",
          title: "Remove artist",
          onclick: (e) => {
            e.stopPropagation();
            removeArtist(artist.id);
          },
        }, "✕"),
        el("p", { class: "name" }, artist.name),
        el("p", { class: "completion-note" }, `${filledCount}/${state.fields.length} filled`),
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
      const isOwnBox = field.type === "status" || field.type === "checklist" || field.type === "multi";
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
          list.appendChild(renderNoteRow(artist, field, opt.noteLabel));
        }
        if (opt && opt.revealList) {
          renderEntrySubList(list, artist.values, opt.revealList);
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
  if (field.extraNotes) {
    for (const extra of field.extraNotes) {
      list.appendChild(renderExtraNoteRow(artist, field, extra));
    }
  }
}

// An always-visible note box independent of a checklist's completion state (e.g. a
// link), keyed separately from the checklist's own "Details" note.
function renderExtraNoteRow(artist, field, config) {
  const notes = ensureNotes(artist);
  const noteKey = `${field.key}::${config.key}`;
  return el("div", { class: "field-row note-row" }, [
    el("div", { class: "field-label" }, config.label),
    renderNoteValueCell(notes, noteKey, config.label),
  ]);
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
        ensureCollapsed(artist)[boxKey] = false; // so the new (still-blank) entry is actually visible
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
    if (field.entrySubList && entry.value) {
      renderEntrySubList(list, entry, field.entrySubList);
    }
  });
}

// Renders an add-as-many-as-you-want breakdown under a single product entry
// (e.g. Territory Breakdown: territory + distributor + qty + PO#, repeatable).
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
      let control;
      if (subfield.type === "select") {
        control = el("select", {});
        control.appendChild(el("option", { value: "" }, "— Select —"));
        for (const opt of subfield.options) {
          const optionEl = el("option", { value: opt.value }, opt.label);
          if (opt.value === item[subfield.key]) optionEl.selected = true;
          control.appendChild(optionEl);
        }
        control.addEventListener("change", () => {
          if (control.value) item[subfield.key] = control.value;
          else delete item[subfield.key];
          saveState();
          render();
        });
      } else {
        control = el("input", {
          type: subfield.type === "number" ? "number" : "text",
          placeholder: subfield.placeholder || subfield.label,
        });
        if (subfield.type === "number") control.min = "0";
        control.value = item[subfield.key] != null ? item[subfield.key] : "";
        control.addEventListener("blur", () => {
          const val = control.value.trim();
          if (val === "") delete item[subfield.key];
          else item[subfield.key] = subfield.type === "number" ? Number(val) : val;
          saveState();
          setTimeout(render, 0);
        });
        control.addEventListener("keydown", (e) => {
          if (e.key === "Enter") control.blur();
        });
      }
      // A persistent label above the control, so it's still clear what each column is
      // once you've filled something in (unlike a placeholder, which disappears then).
      rowChildren.push(el("div", { class: `territory-field territory-field-${subfield.type === "number" ? "number" : "text"}` }, [
        el("span", { class: "territory-field-label" }, subfield.label),
        control,
      ]));
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

function renderNoteRow(artist, field, label = "Details") {
  const notes = ensureNotes(artist);
  return el("div", { class: "field-row note-row" }, [
    el("div", { class: "field-label" }, label),
    renderNoteValueCell(notes, field.key, label),
  ]);
}

// Renders a note's value cell. A "Link" note with a value set shows a real, clickable
// hyperlink (plus a small edit button) instead of the click-to-edit plain text used for
// every other kind of note — clicking a link should open it, not drop you into editing.
function renderNoteValueCell(notes, key, label) {
  const current = notes[key] || "";
  if (label === "Link" && current) {
    const wrapper = el("div", { class: "field-value note-link-row" });
    wrapper.appendChild(el("a", { class: "note-link", href: current, target: "_blank", rel: "noopener noreferrer" }, current));
    wrapper.appendChild(el("button", {
      class: "btn-ghost edit-link-btn",
      title: "Edit link",
      onclick: () => startEditKeyedNote(wrapper, notes, key),
    }, "✎"));
    return wrapper;
  }
  return el(
    "div",
    {
      class: "field-value" + (current ? "" : " placeholder"),
      onclick: (e) => startEditKeyedNote(e.currentTarget, notes, key),
    },
    current || `Click to add ${label.toLowerCase()}…`
  );
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
// True from the moment an edit schedules a push until that push actually lands. The
// 30s poll runs on its own fixed clock regardless of what you're doing — without this,
// a poll landing in the gap between "you added something" and "the debounced push 1.5s
// later" pulls the Sheet's still-old data and silently wipes what you just added.
let syncDirty = false;
// Artist ids that have already been confirmed (via syncPullNow's "no matching Sheet
// tab" prompt) as OK to seed with a new tab this session — avoids re-asking on every
// poll for an artist that's genuinely new.
const syncSeedConfirmed = new Set();
let syncDiscoverBusy = false;
let syncLastDiscoverAt = 0;
const SYNC_DISCOVER_MIN_INTERVAL_MS = 15000;

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

// Finds Sheet tabs that don't have a matching local artist yet — e.g. a tab created by
// hand directly in the Sheet — and adds + pulls each one so it shows up on the
// dashboard already populated instead of needing "+ Add Artist" first. Runs at most
// once per SYNC_DISCOVER_MIN_INTERVAL_MS since the dashboard route re-renders (and so
// re-calls this) on every local edit, not just on navigation.
// Returns the ids of any newly-discovered artists (each already pulled fresh), so a
// caller like syncAllArtists that's about to pull everyone anyway can skip re-pulling
// them a second time immediately after.
async function syncDiscoverArtists() {
  if (!syncEnabled() || syncDiscoverBusy) return [];
  const now = Date.now();
  if (now - syncLastDiscoverAt < SYNC_DISCOVER_MIN_INTERVAL_MS) return [];
  syncLastDiscoverAt = now;
  syncDiscoverBusy = true;
  try {
    const res = await fetch(`${SYNC_URL}?action=list`);
    const data = await res.json();
    if (!Array.isArray(data.artists)) return [];
    const existingNames = new Set(state.artists.map((a) => a.name));
    const newNames = data.artists.filter((name) => name && !existingNames.has(name));
    if (!newNames.length) return [];
    const addedIds = [];
    for (const name of newNames) {
      const artist = { id: slugify(name), name, values: {} };
      state.artists.push(artist);
      await syncPullNow(artist); // populate it now so the dashboard card isn't blank/red
      addedIds.push(artist.id);
    }
    saveState();
    render();
    return addedIds;
  } catch {
    // best effort — a tab created directly in the Sheet will just show up on a later attempt
    return [];
  } finally {
    syncDiscoverBusy = false;
  }
}

// syncBusy is a single shared lock — syncPullNow silently no-ops (not retries) if it's
// already held, e.g. by the background sync this page kicks off on load. Without this,
// a "Sync now" click landing in that window would skip most of its own pulls yet still
// report "All synced" at the end. Gives up after 10s so a genuinely stuck lock can't
// wedge this forever.
function waitUntilSyncFree(timeoutMs = 10000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function poll() {
      if (!syncBusy || Date.now() - start > timeoutMs) return resolve();
      setTimeout(poll, 150);
    })();
  });
}

// The dashboard's "Sync now" — bypasses the discovery throttle and force-pulls every
// known artist in turn (sequentially: syncPullNow/syncBusy is a single shared lock, so
// firing these in parallel would just make every pull after the first no-op). Skips
// artists syncDiscoverArtists just pulled fresh, so a cold sync doesn't fetch each one
// twice in a row.
async function syncAllArtists() {
  if (!syncEnabled()) return;
  setSyncStatusText("Syncing…");
  syncLastDiscoverAt = 0;
  await waitUntilSyncFree();
  const justDiscovered = new Set(await syncDiscoverArtists());
  for (const artist of state.artists) {
    if (justDiscovered.has(artist.id)) continue;
    await waitUntilSyncFree();
    await syncPullNow(artist, { force: true });
  }
  setSyncStatusText(`All synced ${new Date().toLocaleTimeString()}`);
}

function renderDashboardSyncRow() {
  if (!syncEnabled()) return el("div", {});
  return el("p", { class: "sync-status-line" }, [
    el("span", { id: "sync-status-text" }, "Not yet synced"),
    el("button", { class: "btn-ghost sync-now-btn", onclick: syncAllArtists }, "Sync now"),
  ]);
}

function syncSchedulePush(artist) {
  if (!syncEnabled() || !isEditUnlocked()) return;
  if (syncSuppressNextPush) {
    syncSuppressNextPush = false;
    return;
  }
  syncDirty = true;
  if (syncPushTimer) clearTimeout(syncPushTimer);
  syncPushTimer = setTimeout(() => syncAttemptPush(artist), SYNC_PUSH_DEBOUNCE_MS);
}

// syncPushNow silently no-ops if a pull happens to be in flight at that exact moment
// (syncBusy) — retry shortly after instead of just dropping the push. Without this, a
// dropped push just sits there relying on some later, unrelated pull or edit to notice
// syncDirty and flush it — usually fine, but not guaranteed, and slower than it should be.
function syncAttemptPush(artist) {
  if (syncBusy) {
    syncPushTimer = setTimeout(() => syncAttemptPush(artist), 500);
    return;
  }
  syncPushNow(artist);
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ---- Flattening an artist's simple parameters to/from [label, value] rows ----

// AMPED and INTEGRAL mirror each other's field labels (One-Pager, Inventory), so those
// two groups get their group name prefixed to keep sheet rows unique. Everything else
// keeps its plain label.
function paramLabel(field) {
  if (field.group === "AMPED" || field.group === "INTEGRAL") return `${field.group}: ${field.label}`;
  return field.label;
}

function syncBuildParameters(artist) {
  const rows = [["Artist", artist.name], ["Title", artist.release || ""]];
  const notes = artist.notes || {};
  for (const field of state.fields) {
    if (field.type === "multi") continue; // Product/Territory get their own table
    const label = paramLabel(field);
    if (field.type === "date" || field.type === "text") {
      rows.push([label, artist.values[field.key] || ""]);
    } else if (field.type === "checklist") {
      const values = artist.values[field.key] || {};
      // A computed summary row (not read back on pull — the checklist's real state
      // lives in the item rows below) so Art Proof gets the same colored-dropdown look
      // as the status fields at a glance, instead of needing to scan every item.
      rows.push([label, isChecklistComplete(field, values) ? "Completed" : "Incomplete"]);
      for (const item of field.items) {
        rows.push([`${label}: ${item.label}`, values[item.key] ? "Yes" : "No"]);
      }
      if (field.allowNote) rows.push([`${label}: Details`, notes[field.key] || ""]);
      if (field.extraNotes) {
        for (const extra of field.extraNotes) {
          rows.push([`${label}: ${extra.label}`, notes[`${field.key}::${extra.key}`] || ""]);
        }
      }
    } else if (field.type === "status") {
      const raw = artist.values[field.key] || "";
      const opt = field.options.find((o) => o.value === raw);
      rows.push([label, opt ? opt.label : ""]);
      if (opt && opt.requiresNote) {
        rows.push([`${label}: ${opt.noteLabel || "Details"}`, notes[field.key] || ""]);
      }
      // opt.revealList (e.g. Manufacturing's Plants) gets its own table — see
      // findRevealListField/syncBuildRevealList — since it's a repeating list, not a
      // simple key/value pair.
    }
  }
  return rows;
}

// Tells the Sheet what widget each Parameters row should use — a colored dropdown
// limited to a status field's options, a checklist's own Completed/Incomplete summary,
// or a Yes/No dropdown for each of its items — keyed by the exact row label
// syncBuildParameters wrote it under.
function syncBuildParameterOptions() {
  const map = {};
  const yesNo = [
    { label: "Yes", color: "green" },
    { label: "No", color: "red" },
  ];
  for (const field of state.fields) {
    if (field.type === "multi") continue;
    const label = paramLabel(field);
    if (field.type === "status" && field.options && field.options.length) {
      map[label] = { kind: "dropdown", options: field.options.map((o) => ({ label: o.label, color: o.color })) };
    } else if (field.type === "checklist") {
      map[label] = {
        kind: "dropdown",
        options: [
          { label: "Completed", color: "green" },
          { label: "Incomplete", color: "red" },
        ],
      };
      for (const item of field.items) {
        map[`${label}: ${item.label}`] = { kind: "dropdown", options: yesNo };
      }
    }
  }
  return map;
}

function syncApplyParameters(artist, rows) {
  const byLabel = new Map(rows.map((r) => [r[0], r[1]]));
  // A label that isn't in the sheet at all (as opposed to present-but-blank) means this
  // Sheet predates that label — e.g. it hasn't been repushed since a field was renamed or
  // added. Treat that as "no signal" and leave the local value alone, rather than reading
  // it as "cleared" and wiping data that just hasn't round-tripped through the new schema
  // yet.
  const hasLabel = (label) => byLabel.has(label);
  const val = (label) => (byLabel.get(label) || "").toString().trim();
  const matchOption = (options, label) => options.find(
    (o) => o.label.toLowerCase() === label.toLowerCase() || o.value.toLowerCase() === label.toLowerCase()
  );

  artist.notes = artist.notes || {};
  if (hasLabel("Title")) {
    const release = val("Title");
    if (release) artist.release = release;
    else delete artist.release;
  }

  for (const field of state.fields) {
    if (field.type === "multi") continue;
    const label = paramLabel(field);
    if (field.type === "date" || field.type === "text") {
      if (!hasLabel(label)) continue;
      const v = val(label);
      if (v) artist.values[field.key] = v;
      else delete artist.values[field.key];
    } else if (field.type === "checklist") {
      if (!field.items.some((item) => hasLabel(`${label}: ${item.label}`))) continue;
      const values = {};
      for (const item of field.items) {
        const v = val(`${label}: ${item.label}`).toUpperCase();
        values[item.key] = v === "TRUE" || v === "YES" || v === "1";
      }
      artist.values[field.key] = values;
      if (field.allowNote && hasLabel(`${label}: Details`)) {
        const detail = val(`${label}: Details`);
        if (detail) artist.notes[field.key] = detail;
        else delete artist.notes[field.key];
      }
      if (field.extraNotes) {
        for (const extra of field.extraNotes) {
          const noteLabel = `${label}: ${extra.label}`;
          if (!hasLabel(noteLabel)) continue;
          const noteKey = `${field.key}::${extra.key}`;
          const v = val(noteLabel);
          if (v) artist.notes[noteKey] = v;
          else delete artist.notes[noteKey];
        }
      }
    } else if (field.type === "status") {
      if (!hasLabel(label)) continue;
      const opt = matchOption(field.options, val(label));
      if (opt) artist.values[field.key] = opt.value;
      else delete artist.values[field.key];

      if (opt && opt.requiresNote) {
        const noteLabel = `${label}: ${opt.noteLabel || "Details"}`;
        if (hasLabel(noteLabel)) {
          const detail = val(noteLabel);
          if (detail) artist.notes[field.key] = detail;
          else delete artist.notes[field.key];
        }
      }
    }
  }
}

// ---- Manufacturing Plants table (any status option with a revealList) ----

function findRevealListField() {
  for (const field of state.fields) {
    if (field.type !== "status") continue;
    for (const opt of field.options) {
      if (opt.revealList) return opt.revealList;
    }
  }
  return null;
}

function syncBuildRevealList(artist) {
  const config = findRevealListField();
  if (!config) return [];
  const items = Array.isArray(artist.values[config.key]) ? artist.values[config.key] : [];
  return items.map((item) => {
    if (!item.id) item.id = uid();
    const cells = config.fields.map((f) => {
      const raw = item[f.key];
      if (f.type === "select") {
        const opt = (f.options || []).find((o) => o.value === raw);
        return opt ? opt.label : "";
      }
      return raw != null ? raw : "";
    });
    return [item.id, ...cells];
  });
}

function syncApplyRevealList(artist, rows) {
  const config = findRevealListField();
  if (!config) return;
  // rows is null (not just []) when the Sheet doesn't have a MANUFACTURING PLANTS section
  // at all yet — an old-format Sheet that hasn't been repushed since this table was added.
  // Leave local data alone rather than reading "section missing" as "list cleared."
  if (!Array.isArray(rows)) return;
  const newItems = rows.map((row) => {
    const [rawId, ...values] = row;
    const item = { id: (rawId || "").toString().trim() || uid() };
    config.fields.forEach((f, i) => {
      const raw = (values[i] || "").toString().trim();
      if (!raw) return;
      if (f.type === "select") {
        const opt = (f.options || []).find(
          (o) => o.label.toLowerCase() === raw.toLowerCase() || o.value.toLowerCase() === raw.toLowerCase()
        );
        if (opt) item[f.key] = opt.value;
      } else {
        item[f.key] = raw;
      }
    });
    return item;
  });
  artist.values[config.key] = newItems;
}

// ---- Product + Territory Breakdown: one flat row per territory allocation ----
// (Type/Title/UPC/GS1 repeat across every territory row for the same product, matching
// how the source spreadsheet this format was modeled on denormalizes it.)

function findProductField() {
  return state.fields.find((f) => f.type === "multi");
}

function syncBuildProductAndTerritories(artist) {
  const productField = findProductField();
  const rows = [];
  if (!productField) return rows;

  const entries = Array.isArray(artist.values[productField.key]) ? artist.values[productField.key] : [];
  for (const entry of entries) {
    // Include even a blank, just-added entry (no format type picked yet) — otherwise it's
    // never represented in any push at all, so as soon as the push that adds it also
    // clears the "unsynced changes pending" flag (even though it couldn't actually
    // represent this entry), the very next poll wipes it before you've even chosen a type.
    if (!productField.entrySubList) continue;
    if (!entry.id) entry.id = uid();
    const opt = productField.options.find((o) => o.value === entry.value);
    const typeLabel = opt ? opt.label : (entry.value || "");
    const title = opt && opt.allowCustomTitle ? entry.title || "" : "";
    let gs1Label = "";
    let upc = "";
    if (productField.entrySubStatus) {
      const cfg = productField.entrySubStatus;
      const gs1Opt = cfg.options.find((o) => o.value === entry[cfg.key]);
      gs1Label = gs1Opt ? gs1Opt.label : "";
      upc = entry[cfg.extraFieldKey] || "";
    }
    const items = Array.isArray(entry[productField.entrySubList.key]) ? entry[productField.entrySubList.key] : [];
    if (items.length === 0) {
      // A product with no territory breakdown yet would otherwise contribute zero rows
      // to this flat table — and vanish entirely the next time it's pulled back in.
      // Emit one placeholder row (blank territory/distributor/quantity) so the product
      // itself survives a push/pull round-trip before you've had a chance to add any.
      rows.push([entry.id, typeLabel, title, upc, gs1Label, "", "", ""]);
      continue;
    }
    for (const item of items) {
      rows.push([
        entry.id,
        typeLabel,
        title,
        upc,
        gs1Label,
        item.territory || "",
        item.distributor || "",
        item.quantity != null ? item.quantity : "",
      ]);
    }
  }
  return rows;
}

function syncApplyProductAndTerritories(artist, rows) {
  const productField = findProductField();
  if (!productField) return;
  // rows is null (not just []) when the Sheet hasn't been repushed in the flat
  // Product/Territory layout yet — leave local product data alone rather than reading
  // "nothing found at the new location" as "every product was deleted."
  if (!Array.isArray(rows)) return;

  const toNumberOrUndefined = (v) => (v !== "" && v != null && !isNaN(Number(v)) ? Number(v) : undefined);

  const oldEntries = Array.isArray(artist.values[productField.key]) ? artist.values[productField.key] : [];
  const oldById = new Map(oldEntries.map((e) => [e.id, e]));

  const groups = new Map();
  const order = [];
  for (const row of rows) {
    const [rawId, typeLabel, title, upc, gs1Label, territory, distributor, quantity] = row;
    const id = (rawId || "").toString().trim();
    if (!id) continue;
    if (!groups.has(id)) {
      groups.set(id, { typeLabel, title, upc, gs1Label, territories: [] });
      order.push(id);
    }
    const territoryText = (territory || "").toString().trim();
    const distributorText = (distributor || "").toString().trim();
    const qty = toNumberOrUndefined(quantity);
    // A row with nothing in any of the territory columns is the placeholder row a
    // territory-less product gets (see syncBuildProductAndTerritories) — it's there so
    // the product itself survives the round-trip, not to represent a real, blank
    // territory entry.
    if (!territoryText && !distributorText && qty === undefined) continue;
    const territoryEntry = { id: uid(), territory: territoryText, distributor: distributorText };
    if (qty !== undefined) territoryEntry.quantity = qty;
    groups.get(id).territories.push(territoryEntry);
  }

  const newEntries = order.map((id) => {
    const group = groups.get(id);
    const entry = { id };

    const opt = productField.options.find(
      (o) => o.label.toLowerCase() === (group.typeLabel || "").toString().trim().toLowerCase()
        || o.value.toLowerCase() === (group.typeLabel || "").toString().trim().toLowerCase()
    );
    if (opt) entry.value = opt.value;
    if (opt && opt.allowCustomTitle && group.title) entry.title = group.title.toString().trim();

    if (productField.entrySubStatus) {
      const cfg = productField.entrySubStatus;
      const gs1Opt = cfg.options.find(
        (o) => o.label.toLowerCase() === (group.gs1Label || "").toString().trim().toLowerCase()
          || o.value.toLowerCase() === (group.gs1Label || "").toString().trim().toLowerCase()
      );
      if (gs1Opt) entry[cfg.key] = gs1Opt.value;
      if (entry[cfg.key] === cfg.upcOnValue && group.upc) entry[cfg.extraFieldKey] = group.upc.toString().trim();
    }
    if (productField.entrySubList) {
      entry[productField.entrySubList.key] = group.territories;
    }
    // The flat sheet table only carries per-territory quantity, not the product's own
    // top-level Qty — carry that forward from the existing local entry so it survives a pull.
    const old = oldById.get(id);
    if (old && old.quantity != null) entry.quantity = old.quantity;
    return entry;
  });

  artist.values[productField.key] = newEntries;
}

// ---- Network calls ----

async function syncPushNow(artist) {
  if (!syncEnabled() || syncBusy) return;
  syncBusy = true;
  setSyncStatusText("Syncing…");
  try {
    const parameters = syncBuildParameters(artist);
    const parameterOptions = syncBuildParameterOptions();
    const productTerritory = syncBuildProductAndTerritories(artist);
    const plants = syncBuildRevealList(artist);
    saveState(); // persists any entry IDs syncBuildProductAndTerritories/syncBuildRevealList just backfilled
    const res = await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "push", artist: artist.name, parameters, parameterOptions, productTerritory, plants }),
    });
    // fetch() only rejects on a true network failure — an HTTP error page (e.g. Apps
    // Script occasionally serving Google's generic 404 instead of actually running)
    // still resolves "successfully" here. Without checking the response, that would get
    // treated as a real push: syncDirty clears, syncHash updates to data that was never
    // actually written — and the next pull, fetching the real (unchanged) Sheet, would
    // then overwrite the local edit that everyone thought had already synced.
    if (!res.ok) throw new Error(`push failed: HTTP ${res.status}`);
    const result = await res.json(); // throws if the body isn't real JSON (e.g. an error page)
    if (result.error) throw new Error(result.error);
    artist.syncHash = simpleHash(JSON.stringify({ parameters, productTerritory, plants }));
    saveState();
    syncDirty = false;
    setSyncStatusText(`Synced ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    setSyncStatusText("Sync error — will retry", true);
  } finally {
    syncBusy = false;
  }
}

async function syncPullNow(artist, opts = {}) {
  if (!syncEnabled() || syncBusy) return;
  // There's a not-yet-pushed local edit (e.g. still inside the 1.5s debounce window
  // after adding something). Pulling now would fetch the Sheet's still-old data and
  // stomp on it — flush that pending push first (bypassing its debounce, since whatever
  // triggered this pull means the debounce is moot anyway) rather than just declining to
  // pull, so a poll landing in that window doesn't leave things stuck if the push failed.
  if (syncDirty) {
    if (syncPushTimer) {
      clearTimeout(syncPushTimer);
      syncPushTimer = null;
    }
    await syncPushNow(artist);
    if (syncDirty) return; // push failed — syncPushNow already reported the error
  }
  syncBusy = true;
  setSyncStatusText("Syncing…");
  try {
    const res = await fetch(`${SYNC_URL}?action=pull&artist=${encodeURIComponent(artist.name)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    if (!data.exists) {
      syncBusy = false;
      // No Sheet tab matches this artist's name (matching is exact, including
      // capitalization) — before silently creating one, make sure that's actually what's
      // going on and not a typo that would orphan an existing tab with real data under a
      // slightly different name. Ask only once per artist per session so a genuinely new
      // artist doesn't get re-nagged on every ~30s poll.
      if (!syncSeedConfirmed.has(artist.id)) {
        const proceed = confirm(
          `No Sheet tab named "${artist.name}" was found — syncing will create a new, empty one.\n\n` +
          `If you meant to link to an existing tab, click Cancel and check the artist name matches the tab name exactly (including capitalization), then try again.`
        );
        if (!proceed) {
          setSyncStatusText("Sync paused — no matching Sheet tab found", true);
          return;
        }
        syncSeedConfirmed.add(artist.id);
      }
      await syncPushNow(artist); // nothing in the Sheet yet for this artist — seed it
      return;
    }

    const hash = simpleHash(JSON.stringify({ parameters: data.parameters, productTerritory: data.productTerritory, plants: data.plants }));
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
    // An edit can land (and go dirty) while this pull's fetch was still in flight —
    // Apps Script can take a few seconds to respond. That edit hasn't been pushed yet,
    // so applying this now-stale pulled data would overwrite it; let the pending push
    // (already scheduled) supersede this pull instead.
    if (syncDirty) {
      setSyncStatusText(`Synced ${new Date().toLocaleTimeString()}`);
      return;
    }

    syncApplyParameters(artist, data.parameters);
    syncApplyProductAndTerritories(artist, data.productTerritory);
    syncApplyRevealList(artist, data.plants);
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

// Clicking something inside the page (e.g. "← All artists") blurs whatever's focused
// before its own click handler runs, so any in-progress edit commits first. Browser
// Back/Forward skips that — it fires hashchange directly, and render() would wipe the
// DOM (and an unsaved edit with it) before the field's blur handler ever got a chance to
// save it. Force that blur here first so the edit commits either way.
window.addEventListener("hashchange", () => {
  const active = document.activeElement;
  const appEl = document.getElementById("app");
  if (active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName) && appEl && appEl.contains(active)) {
    active.blur();
  }
  render();
});
// No DOMContentLoaded listener needed — this script runs after <div id="app"> in the
// HTML (no defer/async), so the DOM is already ready by the time it executes. Adding one
// anyway used to fire render() a second time moments later; since syncEnterArtist's
// "already active for this artist" guard makes that second call a no-op, its paired
// syncSchedulePush call would find the push-suppression flag already consumed and
// schedule a spurious push — using whatever local data existed before the initial pull
// had even finished, sometimes clobbering it.
render();
