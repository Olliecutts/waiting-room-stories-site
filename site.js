const DEFAULT_PATTERN_DATA_PATH = "data/public_patterns_sample.json";
const DEFAULT_SHARE_ASSETS_PATH = "data/share_assets.json";
const SHARE_URL = "https://waitingroom.kingchillithepug.com/";
const SHARE_TEXT =
  "The Waiting Room Stories Project collects real owner stories about emergency and specialist vet care becoming unreachable because of cost, insurance limits, upfront payment, or lack of fast support.";
const SHARE_TITLE = "The Waiting Room Stories Project";
const DEFAULT_SHARE_CAPTION =
  "The Waiting Room Stories Project collects real owner stories about emergency and specialist vet care becoming unreachable because of cost, insurance limits, upfront payment, or lack of fast support.\n\nhttps://waitingroom.kingchillithepug.com/";
const HIDDEN_OTHER_LABEL = "";
const LEGACY_SMALL_SAMPLE_LABEL = ["Other", " / ", "small sample"].join("");
const LEGACY_OTHER_RESPONSES_LABEL = ["Other", " responses"].join("");
const LEGACY_OTHER_ANSWER_LABEL = ["Other", " answer"].join("");
const LEGACY_OTHER_ANSWER_SELECTED_LABEL = ["Other", " answer", " selected"].join("");
const LEGACY_SMALLER_CATEGORIES_LABEL = ["Smaller", " categories"].join("");
const LEGACY_OTHER_LESS_COMMON_LABEL = ["Other", " or ", "less common", " responses"].join("");
const LEGACY_UNCLEAR_POLICY_LABEL = ["Unclear", " policy", " terms"].join("");
const HIDDEN_OTHER_ALIASES = new Set([
  "Other",
  "other",
  LEGACY_SMALL_SAMPLE_LABEL,
  LEGACY_OTHER_RESPONSES_LABEL,
  LEGACY_OTHER_ANSWER_LABEL,
  LEGACY_OTHER_ANSWER_SELECTED_LABEL,
  LEGACY_SMALLER_CATEGORIES_LABEL,
  LEGACY_OTHER_LESS_COMMON_LABEL
]);
const PUBLIC_LABEL_MAP = {
  [LEGACY_OTHER_LESS_COMMON_LABEL]: HIDDEN_OTHER_LABEL,
  [LEGACY_OTHER_ANSWER_LABEL]: HIDDEN_OTHER_LABEL,
  [LEGACY_OTHER_ANSWER_SELECTED_LABEL]: HIDDEN_OTHER_LABEL,
  [LEGACY_OTHER_RESPONSES_LABEL]: HIDDEN_OTHER_LABEL,
  [LEGACY_SMALLER_CATEGORIES_LABEL]: HIDDEN_OTHER_LABEL,
  [LEGACY_UNCLEAR_POLICY_LABEL]: "Clearer policy terms would have helped",
  "Heart, breathing, neurological, spinal, trauma, poisoning, or other emergency care": "Complex emergency care",
  "Clearer insurance information before the emergency": "Clearer policy terms would have helped",
  "I did not know what my policy actually covered": "Clearer policy terms would have helped",
  "Insurance paying the vet directly": "Direct-to-vet payment would have helped",
  "A fast emergency grant": "Fast emergency support would have helped",
  "A safe payment plan": "Safe payment plan would have helped",
  "Insurance that covered more": "Insurance that covered more would have helped",
  "More time to decide": "More time to decide would have helped",
  "Someone explaining the options simply": "Someone explaining options simply would have helped",
  "I had insurance but it ran out": "Insurance ran out",
  "I had insurance but it did not cover this": "Insurance did not cover this",
  "I had insurance but had to pay upfront first": "Had insurance but had to pay upfront",
  "I am not sure": "Not sure",
  "Prefer not to say": "Prefer not to say"
};
const CHART_PALETTE = [
  "#4B2E59",
  "#6F3FA0",
  "#B68CC9",
  "#F6AFC8",
  "#E65F8E",
  "#8DB596",
  "#F4D35E",
  "#5CB8B2",
  "#5B8DEF",
  "#7B416F"
];

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function setWarning(message) {
  const warning = document.querySelector("[data-patterns-warning]");
  if (!warning) return;
  warning.hidden = !message;
  warning.textContent = message || "";
}

function getPatternRoot() {
  return document.querySelector("[data-patterns-page]");
}

function getHomeRoot() {
  return document.querySelector("[data-home-page]");
}

function getRoadmapRoot() {
  return document.querySelector("[data-roadmap-page]");
}

function getConfiguredSources(root) {
  const liveSource = root?.dataset.patternsLiveSource?.trim();
  const fallbackSource = root?.dataset.patternsSource?.trim() || DEFAULT_PATTERN_DATA_PATH;
  return liveSource ? [liveSource, fallbackSource] : [fallbackSource];
}

async function fetchJson(source) {
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load ${source}`);
  return response.json();
}

function normaliseChartItems(items) {
  if (!Array.isArray(items)) return [];
  const total = items.reduce((sum, item) => sum + Number(item.count ?? item.value ?? 0), 0);
  const grouped = new Map();

  items.forEach((item) => {
    const count = Number(item.count ?? item.value ?? 0);
    const percentage = Number(
      item.percentage ?? (total > 0 ? ((count / total) * 100).toFixed(1) : 0)
    );
    const label = normalisePublicLabel(item.label || "Unknown");
    if (!label) return;
    const existing = grouped.get(label) || { label, count: 0, percentage: 0 };
    existing.count += Number.isFinite(count) ? count : 0;
    existing.percentage += Number.isFinite(percentage) ? percentage : 0;
    grouped.set(label, existing);
  });

  return Array.from(grouped.values())
    .filter((item) => item.percentage > 0)
    .sort(sortChartItems);
}

function normalisePublicLabel(label) {
  const text = String(label || "Unknown").trim();
  if (HIDDEN_OTHER_ALIASES.has(text)) return HIDDEN_OTHER_LABEL;
  return PUBLIC_LABEL_MAP[text] || text;
}

function isOtherBucket(item) {
  return !item.label;
}

function sortChartItems(a, b) {
  if (isOtherBucket(a) && !isOtherBucket(b)) return 1;
  if (!isOtherBucket(a) && isOtherBucket(b)) return -1;
  if (b.percentage !== a.percentage) return b.percentage - a.percentage;
  return a.label.localeCompare(b.label);
}

function getChartItems(data, key) {
  if (data?.charts?.[key]) return normaliseChartItems(data.charts[key]);

  const legacyMap = {
    country: "countries",
    care_needed: "care_needed",
    main_barriers: "barriers",
    insurance_status: "insurance_status",
    outcomes: "outcomes",
    what_would_have_helped: "helped"
  };

  return normaliseChartItems(data?.[legacyMap[key]]);
}

function buildGradient(items) {
  let cursor = 0;
  const visibleTotal = items.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
  const closeFinalSlice = Math.abs(visibleTotal - 100) < 0.6;
  const segments = items.map((item, index) => {
    const start = cursor;
    const isLast = index === items.length - 1;
    const end = isLast && closeFinalSlice ? 100 : Math.min(100, cursor + item.percentage);
    cursor = end;
    const colour = getChartColour(index);
    return `${colour} ${start}% ${end}%`;
  });

  return segments.length ? `conic-gradient(${segments.join(", ")})` : "none";
}

function getChartColour(index) {
  const base = CHART_PALETTE[index % CHART_PALETTE.length];
  const cycle = Math.floor(index / CHART_PALETTE.length);
  if (cycle === 0) return base;
  return adjustHexLightness(base, cycle % 2 === 0 ? -12 : 12);
}

function adjustHexLightness(hex, amount) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const adjusted = channels.map((channel) => {
    const delta = amount >= 0 ? (255 - channel) * (amount / 100) : channel * (amount / 100);
    return Math.max(0, Math.min(255, Math.round(channel + delta)));
  });
  return `#${adjusted.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function renderDonutChart(container, items) {
  if (!container) return;
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "patterns-status";
    empty.textContent = "No pattern data is available for this chart yet.";
    container.append(empty);
    return;
  }

  const chart = document.createElement("div");
  chart.className = "donut-chart";
  chart.style.setProperty("--chart-gradient", buildGradient(items));
  chart.setAttribute("role", "img");
  chart.setAttribute(
    "aria-label",
    items.map((item) => `${item.label}: ${item.percentage.toFixed(1)}%`).join(", ")
  );

  const hole = document.createElement("div");
  hole.className = "donut-hole";
  const center = document.createElement("span");
  center.className = "donut-center";
  center.textContent = "♥";
  center.setAttribute("aria-hidden", "true");
  hole.append(center);
  chart.append(hole);

  const legend = document.createElement("div");
  legend.className = "chart-legend";
  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "legend-row";

    const labelWrap = document.createElement("span");
    labelWrap.className = "legend-label";

    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.background = getChartColour(index);
    swatch.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent = item.label;
    labelWrap.append(swatch, label);

    const percent = document.createElement("span");
    percent.className = "legend-percent";
    percent.textContent = `${item.percentage.toFixed(1)}%`;

    row.append(labelWrap, percent);
    legend.append(row);
  });

  container.append(chart, legend);
}

function initChartReveal() {
  const cards = document.querySelectorAll(".donut-card");
  if (!cards.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
  );

  cards.forEach((card) => observer.observe(card));
}

function renderPatterns(data, sourceLabel) {
  setText("[data-updated]", formatPatternDate(data.last_updated || data.updated));
  setText("[data-patterns-source-status]", data.refresh_note || sourceLabel);
  setWarning("");

  document.querySelectorAll("[data-chart-key]").forEach((container) => {
    const key = container.getAttribute("data-chart-key");
    renderDonutChart(container, getChartItems(data, key));
  });
  document.querySelectorAll("[data-chart-note]").forEach((note) => {
    const key = note.getAttribute("data-chart-note");
    const text = data?.chart_notes?.[key] || "";
    note.hidden = !text;
    note.textContent = text;
  });
  initChartReveal();
}

function formatPatternDate(value) {
  if (!value) return "Updated date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated date unavailable";
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return `Updated ${formatted}`;
}

function formatSnapshotDate(value) {
  const formatted = formatPatternDate(value).replace(/^Updated /, "");
  return formatted === "date unavailable" ? "Snapshot unavailable" : formatted;
}

function setSnapshotCard(key, value) {
  const card = document.querySelector(`[data-snapshot-card="${key}"]`);
  const node = card?.querySelector("[data-snapshot-value]");
  if (node) node.textContent = value || "Snapshot unavailable";
}

function setSnapshotCopy(key, value) {
  const card = document.querySelector(`[data-snapshot-card="${key}"]`);
  const node = card?.querySelector(".snapshot-copy");
  if (node && value) node.textContent = value;
}

function renderHomeSnapshot(data, isFallback) {
  const storyCount = Number(data.stories_shared_so_far ?? data.total_stories);
  setSnapshotCard("total_stories", Number.isFinite(storyCount) ? storyCount.toLocaleString("en-GB") : "Snapshot unavailable");
  setSnapshotCard("countries_represented", Number.isFinite(Number(data.countries_represented)) ? Number(data.countries_represented).toLocaleString("en-GB") : "Snapshot unavailable");
  setSnapshotCard("top_barrier", data.top_barrier?.label || "Snapshot unavailable");
  setSnapshotCard("top_care_type", data.top_care_type?.label || "Snapshot unavailable");
  setSnapshotCopy("top_care_type", data.top_care_type?.helper);
  setSnapshotCard("last_updated", formatSnapshotDate(data.last_updated || data.updated));
  setText(
    "[data-snapshot-status]",
    isFallback && getConfiguredSources(getHomeRoot()).length > 1
      ? "Showing the latest public pattern update available."
      : "Every story contributes to the project. Charts show grouped, non-identifying patterns."
  );
}

function renderHomeSnapshotFallback() {
  ["total_stories", "countries_represented", "top_barrier", "top_care_type", "last_updated"].forEach((key) => {
    setSnapshotCard(key, "Snapshot unavailable");
  });
  setText(
    "[data-snapshot-status]",
    "The latest project update could not load. Please check the Patterns page later."
  );
}

async function loadHomeSnapshot() {
  const homeRoot = getHomeRoot();
  const container = document.querySelector("[data-home-snapshot]");
  if (!homeRoot || !container) return;

  const sources = getConfiguredSources(homeRoot);
  let lastError = null;

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    try {
      const data = await fetchJson(source);
      renderHomeSnapshot(data, index > 0 || source === DEFAULT_PATTERN_DATA_PATH);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  renderHomeSnapshotFallback();
  if (lastError) console.warn(lastError.message);
}

async function loadPatterns() {
  const patternRoot = getPatternRoot();
  if (!patternRoot) return;

  const sources = getConfiguredSources(patternRoot);
  let lastError = null;

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index];
    try {
      const data = await fetchJson(source);
      const isFallback = index > 0 || source === DEFAULT_PATTERN_DATA_PATH;
      renderPatterns(
        data,
        isFallback ? "Latest pattern update." : "Latest pattern update."
      );
      if (isFallback && sources.length > 1) {
        setWarning("Using the latest saved pattern update because live pattern data could not be loaded.");
      }
      return;
    } catch (error) {
      lastError = error;
    }
  }

  setText("[data-updated]", "Unavailable");
  setText("[data-patterns-source-status]", "Pattern data could not be loaded.");
  setWarning("Pattern data could not be loaded. Please try again later.");
  if (lastError) console.warn(lastError.message);
}

function encodedShareBody() {
  return encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`);
}

function setShareStatus(panel, message) {
  if (!panel) return;
  const status = panel.querySelector("[data-share-status], [data-action-status]");
  if (status) status.textContent = message || "";
}

function setActionStatus(trigger, message) {
  const scopedStatus =
    trigger?.closest("[data-caption-card], .asset-card, [data-share-project]")?.querySelector("[data-action-status], [data-share-status]") ||
    document.querySelector("[data-page-action-status]");
  if (scopedStatus) scopedStatus.textContent = message || "";
}

async function copyShareLink(panel) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(SHARE_URL);
    } else {
      const input = document.createElement("textarea");
      input.value = SHARE_URL;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setShareStatus(panel, "Link copied.");
    return true;
  } catch (error) {
    setShareStatus(panel, "Copy did not work. You can copy the page address from your browser.");
    return false;
  }
}

async function loadRoadmapSnapshot() {
  const roadmapRoot = getRoadmapRoot();
  const storiesNode = document.querySelector("[data-roadmap-stories]");
  if (!roadmapRoot || !storiesNode) return;

  const sources = getConfiguredSources(roadmapRoot);
  for (const source of sources) {
    try {
      const data = await fetchJson(source);
      const storyCount = Number(data.stories_shared_so_far ?? data.total_stories);
      if (Number.isFinite(storyCount)) {
        storiesNode.textContent = storyCount.toLocaleString("en-GB");
      }
      const status = document.querySelector("[data-roadmap-status]");
      if (status && data.last_updated) {
        status.textContent = `Updated after the latest reviewed data refresh: ${formatPatternDate(data.last_updated)}.`;
      }
      return;
    } catch (error) {
      // Try the next configured public aggregate source before falling back to the static value.
    }
  }

  setText("[data-roadmap-status]", "Using the saved project count until the latest public data can load.");
}

async function copyTextToClipboard(text, trigger, successMessage) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setActionStatus(trigger, successMessage || "Copied.");
    return true;
  } catch (error) {
    setActionStatus(trigger, "Copy did not work. You can select and copy the text manually.");
    return false;
  }
}

function initCaptionTools() {
  document.querySelectorAll("[data-copy-caption]").forEach((button) => {
    button.addEventListener("click", () => {
      const caption =
        button.dataset.copyCaption ||
        button.closest("[data-caption-card], .asset-card")?.querySelector("[data-caption-text]")?.textContent?.trim() ||
        DEFAULT_SHARE_CAPTION;
      copyTextToClipboard(caption, button, "Caption copied.");
    });
  });
}

async function handleNativeShare(panel) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: SHARE_TITLE,
        text: SHARE_TEXT,
        url: SHARE_URL
      });
      setShareStatus(panel, "Share sheet opened.");
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        setShareStatus(panel, "");
        return;
      }
    }
  }

  await copyShareLink(panel);
}

function initShareTools() {
  document.querySelectorAll("[data-share-project]").forEach((panel) => {
    const nativeButton = panel.querySelector("[data-share-native]");
    const copyButton = panel.querySelector("[data-copy-link]");
    const emailLink = panel.querySelector("[data-share-email]");
    const whatsappLink = panel.querySelector("[data-share-whatsapp]");
    const facebookLink = panel.querySelector("[data-share-facebook]");

    if (emailLink) {
      emailLink.href = `mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${encodedShareBody()}`;
    }
    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/?text=${encodedShareBody()}`;
      whatsappLink.target = "_blank";
      whatsappLink.rel = "noopener";
    }
    if (facebookLink) {
      facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
      facebookLink.target = "_blank";
      facebookLink.rel = "noopener";
    }

    if (nativeButton) {
      nativeButton.dataset.shareBound = "true";
      nativeButton.addEventListener("click", () => handleNativeShare(panel));
    }
    if (copyButton) {
      copyButton.dataset.copyLinkBound = "true";
      copyButton.addEventListener("click", () => copyShareLink(panel));
    }
  });

  document.querySelectorAll("[data-share-native]").forEach((button) => {
    if (button.dataset.shareBound === "true") return;
    button.dataset.shareBound = "true";
    button.addEventListener("click", () => handleNativeShare(button.closest("[data-share-project], [data-caption-card], .asset-card") || document.body));
  });

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    if (button.dataset.copyLinkBound === "true") return;
    button.dataset.copyLinkBound = "true";
    button.addEventListener("click", () => copyShareLink(button.closest("[data-share-project], [data-caption-card], .asset-card") || document.body));
  });
}

function iconSvg(name) {
  const paths = {
    share: '<path d="M8.5 12.5 15.5 8.5"/><path d="M8.5 15.5 15.5 19.5"/><circle cx="6" cy="14" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="18" cy="21" r="2.4"/>',
    link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M8.2 10.8 6.8 12.2a4 4 0 0 0 5.7 5.7l1.4-1.4"/><path d="M15.8 17.2 17.2 15.8a4 4 0 0 0-5.7-5.7l-1.4 1.4"/>',
    copy: '<rect x="8" y="8" width="10" height="12" rx="2"/><path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 20h14"/>',
    email: '<rect x="4" y="7" width="16" height="11" rx="2"/><path d="m5 8 7 6 7-6"/>',
    whatsapp: '<path d="M7 20.5 8.2 17A7 7 0 1 1 12 19a7.4 7.4 0 0 1-3.3-.8Z"/><path d="M10.2 9.4c.2 3 2 4.8 4.8 5.4l1.2-1.3-2-.9-.8.7c-.9-.4-1.6-1.1-2-2l.7-.8-.9-2Z"/>',
    facebook: '<path d="M14 8.2h2V5h-2.5A4.5 4.5 0 0 0 9 9.5V12H6.8v3.2H9V23h3.5v-7.8h2.7l.5-3.2h-3.2V9.5c0-.7.5-1.3 1.5-1.3Z"/>',
    guidance: '<path d="M6 5.5h8.5a3.5 3.5 0 0 1 0 7H6z"/><path d="M6 12.5h9.5a3.5 3.5 0 0 1 0 7H6z"/><path d="M6 5.5v14"/>',
    heart: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/>'
  };
  if (!paths[name]) return null;

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "button-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = paths[name];
  return icon;
}

function initButtonIcons() {
  document.querySelectorAll("[data-icon]").forEach((button) => {
    if (button.querySelector(".button-icon")) return;
    const icon = iconSvg(button.dataset.icon);
    if (icon) button.prepend(icon);
  });
}

function initExpandableChangeCards() {
  document.querySelectorAll("details.change-card").forEach((card) => {
    const label = card.querySelector("[data-change-toggle-text]");
    const update = () => {
      card.dataset.expanded = card.open ? "true" : "false";
      if (label) label.textContent = card.open ? "Show less" : "Read more";
    };
    card.addEventListener("toggle", update);
    update();
  });
}

function createAssetCard(asset) {
  const card = document.createElement("article");
  card.className = "card asset-card";
  const isLive = asset.status === "live" && asset.image_path && asset.download_path;

  const status = document.createElement("span");
  status.className = isLive ? "asset-status live" : "coming-soon";
  status.textContent = isLive ? "Ready to share" : asset.status_label || "Coming soon";

  if (asset.image_path) {
    const preview = document.createElement("img");
    preview.className = "asset-preview";
    preview.src = asset.image_path;
    preview.alt = asset.alt_text || "";
    preview.loading = "lazy";
    card.append(preview);
  }

  const title = document.createElement("h3");
  title.textContent = asset.title || "Project asset";

  const description = document.createElement("p");
  description.textContent = asset.description || "A shareable project image will appear here once approved.";

  const actions = document.createElement("div");
  actions.className = "asset-actions";

  const download = document.createElement(isLive ? "a" : "button");
  download.className = "button secondary";
  download.dataset.icon = "download";
  download.textContent = "Download image";
  if (isLive) {
    download.href = asset.download_path;
    download.download = "";
  } else {
    download.type = "button";
    download.disabled = true;
  }

  const copyCaption = document.createElement("button");
  copyCaption.className = "button secondary";
  copyCaption.type = "button";
  copyCaption.dataset.icon = "copy";
  copyCaption.textContent = "Copy caption";
  if (isLive) {
    copyCaption.addEventListener("click", () => {
      copyTextToClipboard(asset.caption || DEFAULT_SHARE_CAPTION, copyCaption, "Caption copied.");
    });
  } else {
    copyCaption.disabled = true;
  }

  const shareProject = document.createElement("button");
  shareProject.className = "button secondary";
  shareProject.type = "button";
  shareProject.dataset.icon = "share";
  shareProject.textContent = "Share project";
  if (isLive) {
    shareProject.addEventListener("click", () => handleNativeShare(card));
  } else {
    shareProject.disabled = true;
  }

  const actionStatus = document.createElement("p");
  actionStatus.className = "patterns-status";
  actionStatus.setAttribute("data-action-status", "");
  actionStatus.setAttribute("aria-live", "polite");

  actions.append(download, copyCaption, shareProject);
  card.append(status, title, description, actions, actionStatus);
  return card;
}

async function loadShareAssets() {
  const container = document.querySelector("[data-share-assets]");
  if (!container) return;

  const source = container.dataset.shareAssetsSource || DEFAULT_SHARE_ASSETS_PATH;

  try {
    const data = await fetchJson(source);
    const assets = Array.isArray(data.assets) ? data.assets : [];
    if (!assets.length) return;
    container.innerHTML = "";
    assets.forEach((asset) => container.append(createAssetCard(asset)));
    initButtonIcons();
  } catch (error) {
    const fallback = container.querySelector(".asset-card");
    if (fallback) return;
    container.append(
      createAssetCard({
        title: "Project launch graphic",
        description: "A simple public graphic introducing The Waiting Room Stories Project.",
        status_label: "Coming soon"
      })
    );
  }
}

window.WRSSite = {
  copyShareLink,
  formatPatternDate,
  handleNativeShare,
  initButtonIcons,
  initExpandableChangeCards,
  initShareTools,
  loadHomeSnapshot,
  loadRoadmapSnapshot,
  loadPatterns,
  loadShareAssets,
  normaliseChartItems
};

loadHomeSnapshot();
loadRoadmapSnapshot();
loadPatterns();
initExpandableChangeCards();
initButtonIcons();
initShareTools();
initCaptionTools();
loadShareAssets();
