const DEFAULT_PATTERN_DATA_PATH = "data/public_patterns_sample.json";
const CHART_PALETTE = [
  "#4a2574",
  "#8a5aa8",
  "#e9b8d0",
  "#7c9b7d",
  "#f4d872",
  "#c9addc",
  "#6e3f93"
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
        label: String(item.label || "Unknown"),
        percentage: Number.isFinite(percentage) ? percentage : 0
      };
    })
    .filter((item) => item.percentage > 0);
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
  center.textContent = "100%";
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
  setText("[data-updated]", data.last_updated || data.updated || "Unknown");
  setText("[data-patterns-source-status]", sourceLabel);
  setWarning("");

  document.querySelectorAll("[data-chart-key]").forEach((container) => {
    const key = container.getAttribute("data-chart-key");
    renderDonutChart(container, getChartItems(data, key));
  });
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
        isFallback ? "Showing the public-safe sample snapshot." : "Showing the latest public-safe live snapshot."
      );
      if (isFallback && sources.length > 1) {
        setWarning("Using public-safe sample data because live pattern data could not be loaded.");
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

window.WRSPatterns = { loadPatterns };
loadPatterns();
