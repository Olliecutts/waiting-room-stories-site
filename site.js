const DEFAULT_PATTERN_DATA_PATH = "data/public_patterns_sample.json";
const DEFAULT_PROFESSIONAL_PATTERNS_PATH = "data/professional_patterns_sample.json";
const DEFAULT_SHARE_ASSETS_PATH = "data/share_assets.json";
document.documentElement.classList.add("motion-ready");
const SHARE_URL = "https://waitingroom.kingchillithepug.com/";
const SHARE_TEXT =
  "The Waiting Room Stories Project collects real owner stories about emergency and specialist vet care becoming unreachable because of cost, insurance limits, upfront payment, or lack of fast support.";
const SHARE_TITLE = "The Waiting Room Stories Project";
const REQUIRED_SHARE_HASHTAGS = "#WaitingRoomProject #KingChilliThePug";
const DEFAULT_SHARE_CAPTION =
  "The Waiting Room Stories Project collects real owner stories about emergency and specialist vet care becoming unreachable because of cost, insurance limits, upfront payment, or lack of fast support.\n\nhttps://waitingroom.kingchillithepug.com/\n\n#WaitingRoomProject #KingChilliThePug #WaitingRoomStories";
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

function getOwnerDataRoot() {
  return document.querySelector("[data-owner-data-page]");
}

function getProfessionalPatternsRoot() {
  return document.querySelector("[data-professional-patterns-page]");
}

function getConfiguredSources(root) {
  const liveSource = root?.dataset.patternsLiveSource?.trim();
  const fallbackSource = root?.dataset.patternsSource?.trim() || DEFAULT_PATTERN_DATA_PATH;
  return liveSource ? [liveSource, fallbackSource] : [fallbackSource];
}

function getProfessionalPatternSource(root) {
  return root?.dataset.professionalPatternsSource?.trim() || DEFAULT_PROFESSIONAL_PATTERNS_PATH;
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

function formatPercentValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Snapshot unavailable";
  return `${number.toFixed(1).replace(/\.0$/, "")}%`;
}

function formatCountValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Snapshot unavailable";
  return number.toLocaleString("en-GB");
}

function ownerTopItem(data, key) {
  return getChartItems(data, key)[0] || null;
}

function getOwnerDisplayStats(data) {
  const storyCount = Number(data?.stories_shared_so_far ?? data?.total_stories);
  const mainBarrier = ownerTopItem(data, "main_barriers");
  const insurance = ownerTopItem(data, "insurance_status");
  const helped = ownerTopItem(data, "what_would_have_helped");
  const care = ownerTopItem(data, "care_needed");
  const countryItems = getChartItems(data, "country");

  return {
    story_count: formatCountValue(storyCount),
    story_count_label: Number.isFinite(storyCount) ? `${formatCountValue(storyCount)} stories` : "Snapshot unavailable",
    total_stories: formatCountValue(Number(data?.total_stories ?? storyCount)),
    main_barrier_label: mainBarrier?.label || "Snapshot unavailable",
    main_barrier_percent: Number.isFinite(mainBarrier?.percentage) ? formatPercentValue(mainBarrier.percentage) : "Snapshot unavailable",
    main_barrier_fill: Number.isFinite(mainBarrier?.percentage) ? `${mainBarrier.percentage}%` : "0%",
    insurance_label: insurance?.label || "Snapshot unavailable",
    insurance_percent: Number.isFinite(insurance?.percentage) ? formatPercentValue(insurance.percentage) : "Snapshot unavailable",
    insurance_fill: Number.isFinite(insurance?.percentage) ? `${insurance.percentage}%` : "0%",
    helped_label: helped?.label || "Snapshot unavailable",
    helped_percent: Number.isFinite(helped?.percentage) ? formatPercentValue(helped.percentage) : "Snapshot unavailable",
    helped_fill: Number.isFinite(helped?.percentage) ? `${helped.percentage}%` : "0%",
    care_label: care?.label || "Snapshot unavailable",
    care_percent: Number.isFinite(care?.percentage) ? formatPercentValue(care.percentage) : "Snapshot unavailable",
    last_updated: formatPatternDate(data?.last_updated || data?.updated),
    country_items: countryItems
  };
}

function setCountAwareText(node, value) {
  node.textContent = value;
  if (!node.matches("[data-count-up]")) return;
  const target = numericValueFromText(value);
  if (target === null) return;
  node.dataset.countValue = String(target);
  node.dataset.countAnimated = "false";
  delete node.dataset.countAnimated;
  setCountFinal(node);
}

function renderOwnerCountryBars(container, items) {
  if (!container) return;
  const visible = items.filter((item) => Number(item.count) > 0).slice(0, 5);
  if (!visible.length) return;
  const maxCount = Math.max(...visible.map((item) => Number(item.count) || 0));
  container.innerHTML = "";
  visible.forEach((item) => {
    const count = Number(item.count) || 0;
    const level = maxCount > 0 ? Math.max(1, (count / maxCount) * 100) : 1;
    const displayLabel = item.label === "Other countries" ? "Other" : item.label;

    const bar = document.createElement("div");
    bar.className = "country-bar";
    bar.style.setProperty("--level", `${level}%`);
    bar.setAttribute("aria-label", `${displayLabel}: ${count.toLocaleString("en-GB")} owner stories`);

    const label = document.createElement("div");
    label.className = "country-label";
    const strong = document.createElement("strong");
    strong.textContent = displayLabel;
    const value = document.createElement("span");
    value.textContent = count.toLocaleString("en-GB");
    label.append(strong, value);

    const column = document.createElement("div");
    column.className = "country-column";
    const fill = document.createElement("i");
    fill.setAttribute("aria-hidden", "true");
    column.append(fill);

    bar.append(label, column);
    container.append(bar);
  });
}

function renderOwnerDataDisplays(data) {
  const stats = getOwnerDisplayStats(data);

  document.querySelectorAll("[data-owner-value]").forEach((node) => {
    const key = node.getAttribute("data-owner-value");
    if (!key || !(key in stats)) return;
    setCountAwareText(node, stats[key]);
  });

  document.querySelectorAll("[data-owner-fill]").forEach((node) => {
    const key = node.getAttribute("data-owner-fill");
    const value = stats[`${key}_fill`] || stats[key] || "0%";
    node.style.setProperty("--fill", value);
  });

  document.querySelectorAll("[data-owner-bar]").forEach((node) => {
    const key = node.getAttribute("data-owner-bar");
    const value = stats[`${key}_fill`] || stats[key] || "0%";
    node.style.setProperty("--bar", value);
  });

  document.querySelectorAll("[data-owner-country-bars]").forEach((container) => {
    renderOwnerCountryBars(container, stats.country_items);
  });
}

function normaliseProfessionalChartItems(items) {
  if (!Array.isArray(items)) return [];
  const rawItems = items
    .map((item) => ({
      label: String(item.label || "").trim(),
      count: Number(item.count ?? 0),
      percentage: Number(item.percentage)
    }))
    .filter((item) => item.label && Number.isFinite(item.count) && item.count >= 0);

  const total = rawItems.reduce((sum, item) => sum + item.count, 0);
  return rawItems
    .map((item) => ({
      label: item.label,
      count: item.count,
      percentage: Number.isFinite(item.percentage)
        ? item.percentage
        : total > 0
          ? Number(((item.count / total) * 100).toFixed(1))
          : 0
    }))
    .filter((item) => item.percentage > 0)
    .sort(sortChartItems);
}

function getProfessionalChartEntries(data) {
  const charts = data?.charts && typeof data.charts === "object" ? data.charts : {};
  return Object.entries(charts).map(([key, chart]) => {
    const chartObject = Array.isArray(chart) ? { items: chart } : chart || {};
    return {
      key,
      title: chartObject.title || key.replace(/_/g, " "),
      description: chartObject.description || "Reviewed anonymous Professional Insight multiple-choice responses only.",
      items: normaliseProfessionalChartItems(chartObject.items)
    };
  });
}

function hasReviewedProfessionalCharts(data) {
  if (data?.status !== "reviewed_aggregate") return false;
  return getProfessionalChartEntries(data).some((chart) => chart.items.length > 0);
}

function renderProfessionalPlaceholder(data, message) {
  const root = getProfessionalPatternsRoot();
  if (!root) return;
  const shell = root.querySelector("[data-professional-charts]");
  const placeholder = root.querySelector("[data-professional-placeholder]");
  const panel = root.querySelector("[data-professional-placeholder-panel]");
  const grid = root.querySelector("[data-professional-chart-grid]");
  const status = root.querySelector("[data-professional-patterns-status]");
  const placeholderMessage =
    message ||
    data?.placeholder?.message ||
    "Professional insight charts will appear here once the first responses have been reviewed. These charts will stay separate from the owner story charts.";

  root.classList.remove("has-reviewed-professional-charts");
  shell?.classList.remove("has-reviewed-professional-charts");
  if (placeholder) placeholder.hidden = false;
  if (panel) {
    panel.hidden = false;
    panel.textContent = placeholderMessage;
  }
  root.querySelectorAll("[data-professional-placeholder-message]").forEach((node) => {
    node.textContent = placeholderMessage;
  });
  if (grid) {
    grid.hidden = true;
    grid.innerHTML = "";
  }
  if (status) {
    status.textContent = data?.last_updated ? formatPatternDate(data.last_updated) : "";
  }
}

function createProfessionalChartCard(chart) {
  const card = document.createElement("article");
  card.className = "chart-module chart-card donut-card professional-chart-card professional-bar-card";

  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Professional Insight";
  const title = document.createElement("h3");
  title.textContent = chart.title;
  const description = document.createElement("p");
  description.className = "chart-helper";
  description.textContent = chart.description;
  copy.append(eyebrow, title, description);

  const layout = document.createElement("div");
  layout.className = "professional-ranked-chart";
  renderProfessionalRankedChart(layout, chart.items);

  card.append(copy, layout);
  return card;
}

function renderProfessionalRankedChart(container, items) {
  if (!container) return;
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "patterns-status";
    empty.textContent = "No reviewed Professional Insight chart data is available for this category yet.";
    container.append(empty);
    return;
  }

  const list = document.createElement("ol");
  list.className = "professional-bar-list";
  items.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "professional-bar-row";
    row.style.setProperty("--bar", `${Math.max(4, Math.min(100, item.percentage))}%`);
    row.style.setProperty("--accent", getChartColour(index));

    const top = document.createElement("div");
    top.className = "professional-bar-topline";

    const label = document.createElement("span");
    label.className = "professional-bar-label";
    label.textContent = item.label;

    const value = document.createElement("span");
    value.className = "professional-bar-value";
    value.textContent = `${item.percentage.toFixed(1)}% · ${item.count}`;

    const track = document.createElement("span");
    track.className = "professional-bar-track";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("i");
    track.append(fill);

    top.append(label, value);
    row.append(top, track);
    list.append(row);
  });

  container.append(list);
}

function renderOwnerRankedChart(container, items) {
  if (!container) return;
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "patterns-status";
    empty.textContent = "No owner pattern data is available for this chart yet.";
    container.append(empty);
    return;
  }

  const list = document.createElement("ol");
  list.className = "owner-bar-list";
  items.forEach((item, index) => {
    const row = document.createElement("li");
    row.className = "owner-bar-row";
    row.style.setProperty("--bar", `${Math.max(4, Math.min(100, item.percentage))}%`);
    row.style.setProperty("--accent", getChartColour(index));

    const top = document.createElement("div");
    top.className = "owner-bar-topline";

    const label = document.createElement("span");
    label.className = "owner-bar-label";
    label.textContent = item.label;

    const value = document.createElement("span");
    value.className = "owner-bar-value";
    value.textContent = `${item.percentage.toFixed(1)}% · ${item.count.toLocaleString("en-GB")}`;

    const track = document.createElement("span");
    track.className = "owner-bar-track";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("i");
    track.append(fill);

    top.append(label, value);
    row.append(top, track);
    list.append(row);
  });

  container.append(list);
}

function renderProfessionalCharts(data) {
  const root = getProfessionalPatternsRoot();
  if (!root) return;

  if (!hasReviewedProfessionalCharts(data)) {
    renderProfessionalPlaceholder(data);
    return;
  }

  const placeholder = root.querySelector("[data-professional-placeholder]");
  const panel = root.querySelector("[data-professional-placeholder-panel]");
  const grid = root.querySelector("[data-professional-chart-grid]");
  const status = root.querySelector("[data-professional-patterns-status]");
  const shell = root.querySelector("[data-professional-charts]");
  const summary =
    data?.summary ||
    "Reviewed anonymous Professional Insight charts. These charts stay separate from the owner story charts.";
  const chartEntries = getProfessionalChartEntries(data).filter((chart) => chart.items.length > 0);

  root.classList.add("has-reviewed-professional-charts");
  shell?.classList.add("has-reviewed-professional-charts");
  if (placeholder) placeholder.hidden = false;
  root.querySelectorAll("[data-professional-placeholder-message]").forEach((node) => {
    node.textContent = summary;
  });
  if (panel) {
    panel.hidden = true;
    panel.textContent = "";
  }
  if (!grid) return;
  grid.hidden = false;
  grid.innerHTML = "";
  chartEntries.forEach((chart) => grid.append(createProfessionalChartCard(chart)));
  if (status) {
    status.textContent = data?.last_updated ? formatPatternDate(data.last_updated) : "Reviewed professional aggregate charts loaded.";
  }
  initChartReveal();
  refreshMotion();
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
  const mark = document.createElement("span");
  mark.className = "sketched-heart-mark";
  center.append(mark);
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

    const progress = document.createElement("span");
    progress.className = "legend-progress";
    progress.setAttribute("aria-hidden", "true");
    const fill = document.createElement("i");
    fill.style.setProperty("--bar", `${Math.max(4, Math.min(100, item.percentage))}%`);
    fill.style.background = getChartColour(index);
    progress.append(fill);

    row.append(labelWrap, percent, progress);
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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function numericValueFromText(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function prepareCountUpNode(node) {
  const target = Number(node.dataset.countValue || numericValueFromText(node.textContent));
  if (!Number.isFinite(target)) return null;
  const suffix = node.getAttribute("data-count-suffix") || (/\+\s*$/.test(node.textContent.trim()) ? "+" : "");
  node.dataset.countTarget = String(target);
  node.dataset.countSuffix = suffix;
  return target;
}

function setCountFinal(node) {
  const target = prepareCountUpNode(node);
  if (target === null) return;
  const suffix = node.getAttribute("data-count-suffix") || node.dataset.countSuffix || "";
  node.textContent = `${Math.round(target).toLocaleString("en-GB")}${suffix}`;
}

function animateCountUpNode(node) {
  if (node.dataset.countAnimated === "true") return;
  if (prepareCountUpNode(node) === null) return;
  node.dataset.countAnimated = "true";
  setCountFinal(node);
}

function initCountUp(root = document) {
  const nodes = root.querySelectorAll("[data-count-up]");
  if (!nodes.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    nodes.forEach(setCountFinal);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCountUpNode(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.2 }
  );

  nodes.forEach((node) => {
    prepareCountUpNode(node);
    observer.observe(node);
  });
}

function initScrollReveals(root = document) {
  const nodes = root.querySelectorAll(".fade-up, .slide-in-left, .slide-in-right, .soft-scale");
  if (!nodes.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.16 }
  );

  nodes.forEach((node) => observer.observe(node));
}

function refreshMotion() {
  initCountUp();
  initScrollReveals();
}

function renderPatterns(data, sourceLabel) {
  renderOwnerDataDisplays(data);
  renderLiveStats(data);
  setText("[data-updated]", formatPatternDate(data.last_updated || data.updated));
  setText("[data-patterns-source-status]", sourceLabel || "");
  setText("[data-patterns-status]", "");
  setWarning("");

  document.querySelectorAll("[data-chart-key]").forEach((container) => {
    const key = container.getAttribute("data-chart-key");
    renderDonutChart(container, getChartItems(data, key));
  });
  document.querySelectorAll("[data-chart-card]").forEach((card) => {
    const key = card.getAttribute("data-chart-card");
    const target = card.querySelector(".chart-layout") || card.querySelector("[data-donut-wrap]") || card;
    card.classList.add("owner-ranked-card");
    if (target) target.className = "owner-ranked-chart";
    renderOwnerRankedChart(target, getChartItems(data, key));
  });
  document.querySelectorAll("[data-chart-note]").forEach((note) => {
    const key = note.getAttribute("data-chart-note");
    const text = data?.chart_notes?.[key] || "";
    note.hidden = !text;
    note.textContent = text;
  });
  initChartReveal();
  refreshMotion();
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

function setHomeStat(key, value) {
  const aliases = {
    total_stories: "stories_shared_so_far",
    top_barrier: "most_common_barrier",
    top_care_type: "most_common_care_type",
    top_insurance_status: "most_common_insurance_status",
    top_helped: "most_common_helped"
  };
  const selector = `[data-home-stat="${key}"], [data-home-stat="${aliases[key] || key}"]`;
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value || "Snapshot unavailable";
    if (node.matches("[data-count-up]")) {
      const target = numericValueFromText(value);
      if (target !== null) {
        node.dataset.countValue = String(target);
        delete node.dataset.countAnimated;
        setCountFinal(node);
      }
    }
  });
}

function barrierHeadline(label) {
  if (!label || label === "Snapshot unavailable") return "The most common barrier is loading.";
  if (label === "Had to pay upfront") return "Upfront payment is where care often becomes unreachable.";
  return `The most common barrier so far: ${label}.`;
}

function getLiveStats(data) {
  const storyCount = Number(data.stories_shared_so_far ?? data.total_stories);
  const countries = Number(data.countries_represented);
  const topBarrier = getChartItems(data, "main_barriers")[0];
  const topInsurance = getChartItems(data, "insurance_status")[0];
  const topHelped = getChartItems(data, "what_would_have_helped")[0];
  const topCare = getChartItems(data, "care_needed")[0];
  return {
    stories_shared_so_far: Number.isFinite(storyCount) ? storyCount.toLocaleString("en-GB") : "Snapshot unavailable",
    total_stories: Number.isFinite(storyCount) ? storyCount.toLocaleString("en-GB") : "Snapshot unavailable",
    countries_represented: Number.isFinite(countries) ? countries.toLocaleString("en-GB") : "Snapshot unavailable",
    most_common_barrier: data.top_barrier?.label || data.most_common_barrier?.label || data.most_common_barrier || topBarrier?.label || "Snapshot unavailable",
    most_common_barrier_percentage: Number.isFinite(topBarrier?.percentage) ? `${topBarrier.percentage.toFixed(1)}%` : "Snapshot unavailable",
    most_common_care_type: data.top_care_type?.label || data.most_common_care_type?.label || data.most_common_care_type || topCare?.label || "Snapshot unavailable",
    most_common_insurance_status: topInsurance?.label || "Snapshot unavailable",
    most_common_helped: topHelped?.label || "Snapshot unavailable",
    last_updated: formatPatternDate(data.last_updated || data.updated)
  };
}

function renderLiveStats(data) {
  const stats = getLiveStats(data);
  Object.entries(stats).forEach(([key, value]) => {
    document.querySelectorAll(`[data-live-stat="${key}"]`).forEach((node) => {
      node.textContent = value;
      if (node.matches("[data-count-up]")) {
        const target = numericValueFromText(value);
      if (target !== null) {
        node.dataset.countValue = String(target);
        delete node.dataset.countAnimated;
        setCountFinal(node);
      }
    }
  });
  });
  document.querySelectorAll("[data-live-barrier-title]").forEach((node) => {
    node.textContent = barrierHeadline(stats.most_common_barrier);
  });
}

function captionWithHashtag(text) {
  const value = String(text || DEFAULT_SHARE_CAPTION).trim();
  const additions = [];
  if (!/#WaitingRoomProject\b/i.test(value)) additions.push("#WaitingRoomProject");
  if (!/#KingChilliThePug\b/i.test(value)) additions.push("#KingChilliThePug");
  if (!/#WaitingRoomStories\b/i.test(value)) additions.push("#WaitingRoomStories");
  return additions.length ? `${value}\n\n${additions.join(" ")}` : value;
}

function setSnapshotCopy(key, value) {
  const card = document.querySelector(`[data-snapshot-card="${key}"]`);
  const node = card?.querySelector(".snapshot-copy");
  if (node && value) node.textContent = value;
}

function renderHomeSnapshot(data, isFallback) {
  const stats = getLiveStats(data);
  const stories = stats.stories_shared_so_far;
  const countries = stats.countries_represented;
  const barrier = stats.most_common_barrier;
  const careType = stats.most_common_care_type;
  const insuranceStatus = stats.most_common_insurance_status;
  const helped = stats.most_common_helped;
  renderOwnerDataDisplays(data);
  renderLiveStats(data);
  setSnapshotCard("total_stories", stories);
  setSnapshotCard("countries_represented", countries);
  setSnapshotCard("top_barrier", barrier);
  setSnapshotCard("top_care_type", careType);
  setSnapshotCard("top_insurance_status", insuranceStatus);
  setSnapshotCard("top_helped", helped);
  setHomeStat("total_stories", stories);
  setHomeStat("countries_represented", countries);
  setHomeStat("top_barrier", barrier);
  setHomeStat("top_care_type", careType);
  setHomeStat("top_insurance_status", insuranceStatus);
  setHomeStat("top_helped", helped);
  setSnapshotCopy("top_care_type", data.top_care_type?.helper);
  setSnapshotCard("last_updated", formatSnapshotDate(data.last_updated || data.updated));
  setText(
    "[data-snapshot-status]",
    isFallback && getConfiguredSources(getHomeRoot()).length > 1
      ? "Showing the latest project charts available."
      : "Latest public update loaded."
  );
  setText("[data-home-status]", formatPatternDate(data.last_updated || data.updated));
  refreshMotion();
}

function renderHomeSnapshotFallback() {
  ["total_stories", "countries_represented", "top_barrier", "top_care_type", "top_insurance_status", "top_helped", "last_updated"].forEach((key) => {
    setSnapshotCard(key, "Snapshot unavailable");
  });
  setHomeStat("total_stories", "Latest count unavailable");
  setHomeStat("countries_represented", "Latest count unavailable");
  setHomeStat("top_barrier", "Latest count unavailable");
  setHomeStat("top_care_type", "Latest count unavailable");
  setHomeStat("top_insurance_status", "Latest count unavailable");
  setHomeStat("top_helped", "Latest count unavailable");
  setText("[data-home-status]", "Latest count could not load.");
  setText(
    "[data-snapshot-status]",
    "The latest project update could not load. Please check the Patterns page later."
  );
}

async function loadHomeSnapshot() {
  const homeRoot = getHomeRoot();
  if (!homeRoot) return;

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
  setText("[data-patterns-status]", "Pattern data could not be loaded. Please try again later.");
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

function copyTextFallback(text) {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Fallback copy failed.");
}

async function writeTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      copyTextFallback(text);
      return true;
    }
  }
  copyTextFallback(text);
  return true;
}

async function copyShareLink(panel) {
  try {
    await writeTextToClipboard(SHARE_URL);
    setShareStatus(panel, "Link copied.");
    return true;
  } catch (error) {
    setShareStatus(panel, `Copy did not work. Website link: ${SHARE_URL}`);
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
      renderOwnerDataDisplays(data);
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

  setText("[data-roadmap-status]", "Using the saved project count until the latest charts can load.");
}

async function loadOwnerDataDisplays() {
  const root = getOwnerDataRoot();
  if (!root || getHomeRoot() || getPatternRoot() || getRoadmapRoot()) return;

  const sources = getConfiguredSources(root);
  let lastError = null;

  for (const source of sources) {
    try {
      const data = await fetchJson(source);
      renderOwnerDataDisplays(data);
      refreshMotion();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) console.warn(lastError.message);
}

async function loadProfessionalPatterns() {
  const root = getProfessionalPatternsRoot();
  if (!root) return;

  const source = getProfessionalPatternSource(root);
  try {
    const data = await fetchJson(source);
    renderProfessionalCharts(data);
  } catch (error) {
    renderProfessionalPlaceholder(null);
    console.warn(error.message);
  }
}

async function copyTextToClipboard(text, trigger, successMessage) {
  try {
    await writeTextToClipboard(text);
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
      copyTextToClipboard(captionWithHashtag(caption), button, "Caption copied.");
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
  status.textContent = isLive ? "Share the project" : asset.status_label || "Coming soon";

  if (asset.image_path) {
    const preview = document.createElement("img");
    preview.className = "asset-preview";
    preview.src = asset.image_path;
    preview.alt = asset.alt_text || "";
    card.append(preview);
  }

  const title = document.createElement("h3");
  title.textContent = asset.title || "Project asset";

  const description = document.createElement("p");
  description.textContent = asset.description || "A shareable project image will appear here once approved.";

  const caption = document.createElement("p");
  caption.className = "caption-preview";
  caption.setAttribute("data-caption-text", "");
  caption.textContent = captionWithHashtag(asset.caption || DEFAULT_SHARE_CAPTION);

  const actions = document.createElement("div");
  actions.className = "asset-actions";

  const download = document.createElement(isLive ? "a" : "button");
  download.className = "button secondary";
  download.dataset.icon = "download";
  download.textContent = "Download graphic";
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
      copyTextToClipboard(captionWithHashtag(asset.caption || DEFAULT_SHARE_CAPTION), copyCaption, "Caption copied.");
    });
  } else {
    copyCaption.disabled = true;
  }

  const actionStatus = document.createElement("p");
  actionStatus.className = "patterns-status";
  actionStatus.setAttribute("data-action-status", "");
  actionStatus.setAttribute("aria-live", "polite");

  actions.append(download, copyCaption);
  card.append(status, title, description, caption, actions, actionStatus);
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
  loadOwnerDataDisplays,
  loadProfessionalPatterns,
  loadShareAssets,
  normaliseChartItems,
  initCountUp,
  initScrollReveals
};

loadHomeSnapshot();
loadRoadmapSnapshot();
loadPatterns();
loadOwnerDataDisplays();
loadProfessionalPatterns();
initExpandableChangeCards();
initButtonIcons();
initShareTools();
initCaptionTools();
loadShareAssets();
refreshMotion();
