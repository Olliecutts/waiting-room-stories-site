const DATA_PATH = "data/public_patterns_sample.json";

function renderBarChart(container, items) {
  if (!container || !Array.isArray(items) || items.length === 0) return;
  const max = Math.max(...items.map((item) => item.value));
  container.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const meta = document.createElement("div");
    meta.className = "bar-meta";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("span");
    value.textContent = item.value;
    meta.append(label, value);

    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.setProperty("--bar-width", `${Math.max(6, Math.round((item.value / max) * 100))}%`);
    track.append(fill);

    row.append(meta, track);
    container.append(row);
  });
}

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

async function loadPatterns() {
  const patternRoot = document.querySelector("[data-patterns-page]");
  if (!patternRoot) return;

  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error(`Could not load ${DATA_PATH}`);
    const data = await response.json();
    setText("[data-sample-size]", data.sample_size);
    setText("[data-excluded-flags]", data.excluded_flagged_rows);
    setText("[data-updated]", data.updated);
    renderBarChart(document.querySelector("[data-chart='countries']"), data.countries);
    renderBarChart(document.querySelector("[data-chart='care']"), data.care_needed);
    renderBarChart(document.querySelector("[data-chart='barriers']"), data.barriers);
    renderBarChart(document.querySelector("[data-chart='insurance']"), data.insurance_status);
    renderBarChart(document.querySelector("[data-chart='outcomes']"), data.outcomes);
    renderBarChart(document.querySelector("[data-chart='helped']"), data.helped);
  } catch (error) {
    const warning = document.querySelector("[data-patterns-warning]");
    if (warning) {
      warning.hidden = false;
      warning.textContent = "Pattern data could not be loaded locally. Check the JSON path before deployment.";
    }
  }
}

loadPatterns();
