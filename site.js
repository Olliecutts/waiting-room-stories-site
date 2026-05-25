const DEFAULT_PATTERN_DATA_PATH = "data/public_patterns_sample.json";
const DEFAULT_SHARE_ASSETS_PATH = "data/share_assets.json";
const SHARE_URL = "https://waitingroom.kingchillithepug.com/";
const SHARE_TEXT =
  "The Waiting Room Stories Project collects real owner stories about emergency and specialist vet care becoming unreachable because of cost, insurance limits, upfront payment, or lack of fast support.";
const SHARE_TITLE = "The Waiting Room Stories Project";
const SMALLER_CATEGORIES_LABEL = "Smaller categories";
const OTHER_ANSWER_LABEL = "Other answer";
const LEGACY_SMALL_SAMPLE_LABEL = ["Other", " / ", "small sample"].join("");
const SMALL_SAMPLE_ALIASES = new Set([
  LEGACY_SMALL_SAMPLE_LABEL,
  ["Other", " responses"].join(""),
  SMALLER_CATEGORIES_LABEL
]);
const PUBLIC_LABEL_MAP = {
  Other: OTHER_ANSWER_LABEL,
  other: OTHER_ANSWER_LABEL,
  No: "No insurance",
  Yes: "Had insurance",
  "I had insurance but it ran out": "Insurance ran out",
  "I had insurance but it did not cover this": "Insurance did not cover this",
  "I had insurance but had to pay upfront first": "Had insurance but had to pay upfront",
  "I am not sure": "Not sure",
  "Prefer not to say": "Prefer not to say"
};
const CHART_PALETTE = [
  "#4a2574",
  "#c9addc",
  "#e9b8d0",
  "#7c9b7d",
  "#f4d872",
  "#8a5aa8",
  "#6e3f93",
  "#fff9ef"
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

  return items
    .map((item) => {
      const count = Number(item.count ?? item.value ?? 0);
      const percentage = Number(
        item.percentage ?? (total > 0 ? ((count / total) * 100).toFixed(1) : 0)
      );

      return {
        label: normalisePublicLabel(item.label || "Unknown"),
        percentage: Number.isFinite(percentage) ? percentage : 0
      };
    })
    .filter((item) => item.percentage > 0)
    .sort(sortChartItems);
}

function normalisePublicLabel(label) {
  const text = String(label || "Unknown").trim();
  if (SMALL_SAMPLE_ALIASES.has(text)) return SMALLER_CATEGORIES_LABEL;
  return PUBLIC_LABEL_MAP[text] || text;
}

function isSmallerCategories(item) {
  return item.label === SMALLER_CATEGORIES_LABEL;
}

function sortChartItems(a, b) {
  if (isSmallerCategories(a) && !isSmallerCategories(b)) return 1;
  if (!isSmallerCategories(a) && isSmallerCategories(b)) return -1;
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
  const segments = items.map((item, index) => {
    const start = cursor;
    const end = Math.min(100, cursor + item.percentage);
    cursor = end;
    const colour = CHART_PALETTE[index % CHART_PALETTE.length];
    return `${colour} ${start}% ${end}%`;
  });

  if (cursor < 100 && segments.length > 0) {
    segments.push(`${CHART_PALETTE[segments.length % CHART_PALETTE.length]} ${cursor}% 100%`);
  }

  return segments.length ? `conic-gradient(${segments.join(", ")})` : "none";
}

function renderDonutChart(container, items) {
  if (!container) return;
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "patterns-status";
    empty.textContent = "No public-safe data is available for this chart yet.";
    container.append(empty);
    return;
  }

  const chart = document.createElement("div");
  chart.className = "donut-chart";
  chart.style.background = buildGradient(items);
  chart.setAttribute("role", "img");
  chart.setAttribute(
    "aria-label",
    items.map((item) => `${item.label}: ${item.percentage.toFixed(1)}%`).join(", ")
  );

  const hole = document.createElement("div");
  hole.className = "donut-hole";
  const center = document.createElement("span");
  center.className = "donut-center";
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
    swatch.style.background = CHART_PALETTE[index % CHART_PALETTE.length];
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

function renderPatterns(data, sourceLabel) {
  setText("[data-updated]", formatPatternDate(data.last_updated || data.updated));
  setText("[data-patterns-source-status]", sourceLabel);
  setWarning("");

  document.querySelectorAll("[data-chart-key]").forEach((container) => {
    const key = container.getAttribute("data-chart-key");
    renderDonutChart(container, getChartItems(data, key));
  });
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
  setText("[data-patterns-source-status]", "Public-safe pattern data could not be loaded.");
  setWarning("Pattern data could not be loaded. Please try again later.");
  if (lastError) console.warn(lastError.message);
}

function encodedShareBody() {
  return encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`);
}

function setShareStatus(panel, message) {
  if (!panel) return;
  const status = panel.querySelector("[data-share-status]");
  if (status) status.textContent = message || "";
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

    nativeButton?.addEventListener("click", () => handleNativeShare(panel));
    copyButton?.addEventListener("click", () => copyShareLink(panel));
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
  download.textContent = "Download image";
  if (isLive) {
    download.href = asset.download_path;
    download.download = "";
  } else {
    download.type = "button";
    download.disabled = true;
  }

  const share = document.createElement("button");
  share.className = "button secondary";
  share.type = "button";
  share.textContent = isLive ? "Copy link" : "Share";
  if (isLive) {
    share.addEventListener("click", () => copyShareLink(document.querySelector("[data-share-project]")));
  } else {
    share.disabled = true;
  }

  actions.append(download, share);
  card.append(status, title, description, actions);
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
  initShareTools,
  loadPatterns,
  loadShareAssets,
  normaliseChartItems
};

loadPatterns();
initShareTools();
loadShareAssets();
