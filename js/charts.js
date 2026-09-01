import { ACTIONS } from "./game.js";

const RISK_COLORS = {
  Low: "#228B22",
  Moderate: "#FFA600",
  High: "#B22222"
};

// Y-axis label and fixed [min, max] per variable, matching the desktop gui.py charts.
const Y_AXIS_CONFIGS = {
  QMD: ["Quadratic Mean Diameter (inches)", 0, 25],
  TPA: ["Trees per Acre", 0, 650],
  BA: ["Basal Area (sq ft/acre)", 0, 150],
  carbon: ["Carbon (Metric Tons/acre)", 0, 25],
  CI: ["Crowning Index (mph)", 0, 50]
};

let currentChart = null;

// Data Table

export function renderDataTable(rows) {
  const headers = ["Year", "QMD", "TPA", "BA", "Carbon", "CI", "Fire risk", "SPB risk"];
  const roundTwo = (value) => typeof value === "number" ? Math.round(value * 100) / 100 : value;
  const data = rows.map((row) => [
    row.year,
    roundTwo(row.QMD),
    roundTwo(row.TPA),
    roundTwo(row.BA),
    roundTwo(row.carbon),
    roundTwo(row.CI),
    row.fireRisk,
    row.spbRisk
  ]);
  const widths = headers.map((header, index) => Math.max(
    header.length,
    ...data.map((row) => String(row[index] ?? "").length)
  ));
  widths[3] = 5;
  widths[4] = 5;
  const format = (row) => row.map((value, index) => String(value ?? "").padEnd(widths[index])).join("  ");
  return [format(headers), format(headers.map((header) => "-".repeat(header.length))), ...data.map(format)].join("\n");
}

// Variable Plot

export function showVariablePlot(container, variable, decadalData) {
  if (!window.Chart) {
    container.innerHTML = "<p>Chart.js did not load.</p>";
    return;
  }
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
  const canvas = document.createElement("canvas");
  container.innerHTML = "";
  container.append(canvas);

  // Labels for variables

  const labels = decadalData.map((row) => row.year === "Start" ? -1 : Number(row.year));
  const isRisk = variable === "fireRisk" || variable === "spbRisk";
  const fieldLabel = {
    QMD: "Quadratic Mean Diameter over time",
    TPA: "Trees per Acre over time",
    BA: "Basal Area over time",
    carbon: "Carbon in Metric Tons/acre over time",
    CI: "Crowning Index over time",
    fireRisk: "Fire Risk over time",
    spbRisk: "SPB Risk over time"
  }[variable] ?? variable;

  const values = isRisk
    ? decadalData.map((row) => ({ Low: 1, Moderate: 2, High: 3 }[row[variable]] ?? null))
    : decadalData.map((row) => Number(row[variable]));
  const points = values.map((value, index) => ({ x: labels[index], y: value }));
  const [yAxisLabel, yMin, yMax] = Y_AXIS_CONFIGS[variable] ?? ["", undefined, undefined];

  const dataset = isRisk
    ? {
        type: "bar",
        label: fieldLabel,
        data: points,
        backgroundColor: decadalData.map((row) => RISK_COLORS[row[variable]] ?? "#b5c3d8"),
        borderColor: "#1b2336",
        barThickness: 20
      }
    : {
        type: "line",
        label: fieldLabel,
        data: points,
        borderColor: "#05dd4c",
        backgroundColor: "#05dd4c",
        pointBackgroundColor: "#05dd4c",
        pointBorderColor: "#121e22",
        tension: 0.15
      };

  currentChart = new Chart(canvas, {
    data: { datasets: [dataset] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#b5c3d8",
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: fieldLabel,
          color: "#b5c3d8",
          font: { family: "Courier New", weight: "bold" }
        }
      },
      scales: {
        x: {
          type: "linear",
          min: -1,
          max: 100,
          afterBuildTicks: (axis) => {
            axis.ticks = Array.from({ length: 11 }, (_, i) => ({ value: i * 10 }));
          },
          ticks: { color: "#b5c3d8" },
          grid: { color: "#2c404b" },
          title: { display: true, text: "Year", color: "#b5c3d8" }
        },
        y: {
          min: isRisk ? 0 : yMin,
          max: isRisk ? 3.4 : yMax,
          ticks: {
            color: "#b5c3d8",
            callback: (value) => isRisk ? ({ 1: "Low", 2: "Moderate", 3: "High" }[value] ?? "") : value
          },
          grid: { color: "#2c404b" },
          title: { display: !isRisk && !!yAxisLabel, text: yAxisLabel, color: "#b5c3d8" }
        }
      }
    }
  });
}

export function exportCSV(game) {
  const rows = game.getDecadalData(10).map((row) => {
    const year = row.year === "Start" ? -1 : Number(row.year);
    const actions = game.action_history
      .filter(([actionYear]) => actionYear === year)
      .map(([, action]) => ACTIONS[String(action)] ?? String(action))
      .join("; ");
    const achievements = game.achievements_history
      .filter(([achievementYear]) => achievementYear === year)
      .map(([, name]) => name)
      .join(" - ");
    return {
      Year: row.year,
      QMD: row.QMD,
      TPA: row.TPA,
      BA: row.BA,
      Carbon: row.carbon,
      CI: row.CI,
      "Fire risk": row.fireRisk,
      "SPB risk": row.spbRisk,
      Actions: actions,
      Achievements: achievements
    };
  });

  if (!rows.length) return;
  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `PitchPineTrail_data_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
