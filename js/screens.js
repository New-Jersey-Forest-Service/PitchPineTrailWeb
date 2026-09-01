import { ACTIONS, Game } from "./game.js";
import { exportCSV, renderDataTable, showVariablePlot } from "./charts.js";
import { sounds, stopAllLoops } from "./sounds.js";

const root = document.getElementById("game-root");
const ASSET_BASE = "assets/";
const ART_WIDTH = 5515;
const ART_HEIGHT = 2700;

const game = new Game();
const decodedBackgrounds = new Map();
let backgroundRequest = 0;
let zoomHotspotCleanup = null;
Object.assign(game, {
  current_bg_img: "Evenagestand.jpg", //Standard background image
  achievement_queue: [],
  achievement_final_bg: null,
  event_return_bg: null,
  thin_lightly_event: false,
  prescribed_burn_event: false,
  pb_after_first_heavythin_shown: false,
  pb_after_heavythin_with_tl_shown: false,
  has_made_first_choice: false,
  hurricane_pending: false,
  wildfire_pending: false,
  wildfire_last_shown_year: null,
  hurricane_last_shown_year: null,
  certificate_saved: false,
  hint_index: 0
});

window.pitchPineTrailGame = game;

// Achievement Screen images with sound and text description.

const achievementScreens = {
  snake: { image: "Pinesnake.jpg", sound: sounds.playPineSnakeSound, title: "This forest is excellent northern pine snake habitat.\n\nPine snakes are utilizing the stand!" },
  gentian: { image: "gentian.jpg", sound: sounds.playGentianSound, title: "This forest now supports rare Pine Barrens gentian!\n\nGentian is growing in the stand!" },
  short: { image: "shortleaf.jpg", sound: sounds.playPageTurnSound, title: "You created sunny spots in your forest & received funding to plant seedlings...\n\nYou earned the Shortleaf Pine achievement!" },
  turkey: { image: "turkeybeard.jpg", sound: sounds.playPageTurnSound, title: "Turkeybeard is now growing in this stand!\n\nYou earned the Turkeybeard achievement!" },
  tanager: { image: "Tanager.jpg", sound: sounds.playTanagerSound, title: "This forest is being visited by Summer Tanagers.\n\nThese neotropical birds are migrating through the stand!" },
  bunting: { image: "bunting.jpg", sound: sounds.playBuntingSound, title: "This forest is being visited by Indigo Buntings.\n\nThese neotropical birds are migrating through the stand!" },
  frog: { image: "treefrog.jpg", sound: sounds.playTreeFrogSound, title: " Pine Barrens tree frogs have colonized this forest.\n\nTree frogs are calling from the stand!" }
};

const endingMedals = [
  ["Pine snake", "pine_snake_achieved", "pine_snakes_colonized", "pinesnake_medal_end.png"],
  ["Gentian", "gentian_achieved", "gentian_colonized", "gentian_medal_end.png"],
  ["Summer Tanager", "summer_tanager_achieved", "summer_tanager_colonized", "tanager_medal_end.png"],
  ["Pine Barrens tree frog", "tree_frog_achieved", "pine_barrens_tree_frog_colonized", "treefrog_medal_end.png"],
  ["Indigo Bunting", "indigo_bunting_achieved", "indigo_bunting_colonized", "bunting_medal_end.png"],
  ["Turkeybeard", "turkey_beard_achieved", null, "turkeybeard_medal_end.png"],
  ["Shortleaf pine", "short_achieved", "short_colonized", "shortleaf_medal_end.png"]
];

const bookshelfMedals = [
  ["Pine snake", "pine_snake_achieved", "pine_snakes_colonized", "pinesnake_medal.png", "Northern Pinesnake"],
  ["Gentian", "gentian_achieved", "gentian_colonized", "gentian_medal.png", "Pine Barrens Gentian"],
  ["Summer Tanager", "summer_tanager_achieved", "summer_tanager_colonized", "tanager_medal.png", "Summer Tanager"],
  ["Pine Barrens \n Tree Frog", "tree_frog_achieved", "pine_barrens_tree_frog_colonized", "treefrog_medal.png", "Pine Barrens\nTree Frog"],
  ["Indigo Bunting", "indigo_bunting_achieved", "indigo_bunting_colonized", "bunting_medal.png", "Indigo Bunting"],
  ["Turkeybeard", "turkey_beard_achieved", null, "turkeybeard_medal.png", "Turkeybeard"],
  ["Shortleaf Pine", "short_achieved", "short_colonized", "shortleaf_medal.png", "Shortleaf Pine"]
];

const coloringPageAchievements = [
  ["pine_snake_achieved", "pine_snakes_colonized", "pinesnake_coloringpage.pdf"],
  ["gentian_achieved", "gentian_colonized", "gentian_coloringpage.pdf"],
  ["summer_tanager_achieved", "summer_tanager_colonized", "tanager_coloringpage.pdf"],
  ["tree_frog_achieved", "pine_barrens_tree_frog_colonized", "treefrog_coloringpage.pdf"],
  ["indigo_bunting_achieved", "indigo_bunting_colonized", "bunting_coloringpage.pdf"],
  ["short_achieved", "short_colonized", "shortleaf_coloringpage.pdf"],
  ["turkey_beard_achieved", null, "turkeybeard_coloringpage.pdf"]
];

function asset(name) {
  if (name.startsWith("../") || name.startsWith("http")) return name;
  return `${ASSET_BASE}${name.replace(/^assets\//, "")}`;
}

// Computes the current background image's on-screen scale/offset, matching whatever background-size mode is active.
function getArtLayout(imageWidth = ART_WIDTH, imageHeight = ART_HEIGHT) {
  const contain = root.style.backgroundSize === "contain";
  const scale = contain
    ? Math.min(root.clientWidth / imageWidth, root.clientHeight / imageHeight)
    : Math.max(root.clientWidth / imageWidth, root.clientHeight / imageHeight);
  const imageLeft = (root.clientWidth - imageWidth * scale) / 2;
  const imageTop = (root.clientHeight - imageHeight * scale) / 2;
  return { scale, imageLeft, imageTop };
}

// Resolves once an image has fully loaded (and decoded, when supported), caching the result.
function preloadImage(name) {
  const imageName = name.replace(/^assets\//, "");
  if (decodedBackgrounds.has(imageName)) return Promise.resolve();
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // The loaded image is still usable when decode() is unavailable.
      }
      decodedBackgrounds.set(imageName, true);
      resolve();
    };
    image.onerror = resolve;
    image.src = asset(imageName);
  });
}

function setBg(name) {
  game.current_bg_img = name.replace(/^assets\//, "");
  const imageName = game.current_bg_img;
  const request = ++backgroundRequest;
  const apply = () => {
    if (request === backgroundRequest) {
      root.style.backgroundImage = `url("${asset(imageName)}")`;
    }
  };
  if (decodedBackgrounds.has(imageName)) {
    apply();
    return;
  }
  const image = new Image();
  image.onload = async () => {
    try {
      await image.decode();
    } catch {
      // The loaded image is still usable when decode() is unavailable.
    }
    decodedBackgrounds.set(imageName, true);
    apply();
  };
  image.onerror = apply;
  image.src = asset(imageName);
}

function updatePixelLayout() {
  const rootWidth = root.clientWidth;
  const rootHeight = root.clientHeight;
  const contain = root.style.backgroundSize === "contain";
  const scale = contain
    ? Math.min(rootWidth / ART_WIDTH, rootHeight / ART_HEIGHT)
    : Math.max(rootWidth / ART_WIDTH, rootHeight / ART_HEIGHT);
  const imageWidth = ART_WIDTH * scale;
  const imageHeight = ART_HEIGHT * scale;
  const imageLeft = (rootWidth - imageWidth) / 2;
  const imageTop = (rootHeight - imageHeight) / 2;
  const set = (name, value) => root.style.setProperty(`--${name}`, `${value}px`);
  const point = (name, x, y) => {
    set(`${name}-left`, imageLeft + x * scale);
    set(`${name}-top`, imageTop + y * scale);
  };
  const size = (name, width, height) => {
    if (width != null) set(`${name}-width`, width * scale);
    if (height != null) set(`${name}-height`, height * scale);
  };
  // Scales a font/spacing value (defined in artwork pixels) by the same factor used for positioning.
  const scalePx = (name, value) => set(name, value * scale);

  point("metrics", 4190, 1490);
  size("metrics", 1100, 1044);
  scalePx("metrics-font-size", 42);
  scalePx("metric-risk-font-size", 52);
  scalePx("metrics-line-height", 50);
  point("actions", 4550, 300);
  size("actions", 720, 590);
  scalePx("actions-font-size", 50);
  scalePx("actions-width", 750);
  scalePx("actions-height", 590);
  scalePx("actions-gap", 20);
  scalePx("actions-padding", 8, 14);
  point("intro", 4429, 2403);
  point("intro-second", 3309, 1917);
  scalePx("button-font-size", 48);
  scalePx("button-width", 400);
  scalePx("button-padding", 20, 30);
  point("definitions", 276, 2592);
  point("definitions-overlay", 0, 0);
  size("definitions-overlay", ART_WIDTH, ART_HEIGHT);
  point("field-guide", 276, 1863);
  point("field-guide-overlay", 0, 0);
  size("field-guide-overlay", ART_WIDTH, ART_HEIGHT);
  point("bookshelf-medal-slot-1", 75, 2000);
  point("bookshelf-medal-slot-2", 275, 2000);
  point("bookshelf-medal-slot-3", 475, 2000);
  point("bookshelf-medal-slot-4", 75, 2210);
  point("bookshelf-medal-slot-5", 275, 2210);
  point("bookshelf-medal-slot-6", 475, 2210);
  point("bookshelf-medal-slot-7", 275, 2420);
  size("bookshelf-medal", 150, 200);
  point("coloring-page", 90, 1990);
  size("coloring-page", 510, 653);
  point("main-exit", 783, 40);
  size("main-exit", 303.39, 171);
  point("main-restart", 1124, 40);
  size("main-restart", 527.25, 171);
  point("hint", 3695, 81);
  point("summary", 4550, 260);
  size("summary", 1000);
  scalePx("summary-font-size", 48);
  scalePx("summary-width", 900);
  point("closing-analyze", 3236, 2098);
  size("closing-analyze", 814, 643);
  point("closing-certificate", 3560, 43);
  size("closing-certificate", 613, 490);
  point("closing-restart", 3394, 1295);
  size("closing-restart", 500, 500);
  point("closing-exit", 3394, 1800);
  size("closing-exit", 495, 279);
  point("closing-pocketprez", 3000, 1650);
  size("closing-pocketprez", 350, 464);
  point("achievement-actions", 5175, 1050);
  scalePx("achievement-actions-font-size", 48);
  point("event-actions", 5175, 1050);
  scalePx("event-actions-font-size", 48);
  point("loss-message", 4450, 280);
  size("loss-message", 1000);
  scalePx("loss-message-font-size", 60);
  point("event-message", 4450, 200);
  size("event-message", 1000);
  scalePx("event-message-font-size", 60);
  point("analysis-table", 1500, 650);
  size("analysis-table", 1498, 950);
  scalePx("analysis-table-font-size", 43);
  scalePx("analysis-table-width", 1500);
  point("plot-buttons", 4700, 1960);
  scalePx("plot-buttons-font-size", 48);
  point("achievement-list", 4570, 1180);
  size("achievement-list", 1380);
  scalePx("achievement-list-font-size", 45);
  point("analysis-return", 1378, 1923);
  size("analysis-return", 896, 198);
  point("analysis-return-hotspot", 1378, 1923);
  size("analysis-return-hotspot", 200, 200);
  point("download-data", 3185, 1923);
  size("download-data", 789, 198);
  point("download-data-hotspot", 3774, 1923);
  size("download-data-hotspot", 200, 200);
  point("floppy", 3333, 1388);
  size("floppy", 300, 221);
  point("chart-overlay", 1400, 603);
  size("chart-overlay", 1727, 1100);
  point("chart-close", 2760, 600);
  size("chart-close", 320, 75);
  point("chart-faq", 1400, 1660);
  size("chart-faq", 800, 75);
  point("certificate", 3100, 150);
  size("certificate", 1400);
  point("certificate-save", 4400, 770);
  point("hint-overlay", 2758, 54);
  size("hint-overlay", 2640);
  point("survey-overlay", 780, 40);
  size("survey-overlay", 2000);
  point("survey-open", 2100, 800);
  point("survey-exit", 1950, 950);
  point("survey-cancel", 2250, 950);
  point("medal-slot-1", 1379, 324);
  point("medal-slot-2", 1379, 972);
  point("medal-slot-3", 1379, 1620);
  point("medal-slot-4", 2482, 324);
  point("medal-slot-5", 2482, 972);
  point("medal-slot-6", 2482, 1620);
  point("medal-slot-7", 3589, 972);
  size("medal", 950);
}

window.addEventListener("resize", updatePixelLayout);

function clearScreen(bgName) {
  zoomHotspotCleanup?.();
  zoomHotspotCleanup = null;
  root.innerHTML = "";
  updatePixelLayout();
  if (bgName) setBg(bgName);
}

function button(text, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

function imageButton(imageName, hoverImageName, className, altText, onClick) {
  const img = document.createElement("img");
  img.className = className;
  img.src = asset(imageName);
  img.alt = altText;
  img.tabIndex = 0;
  img.addEventListener("mouseenter", () => {
    img.src = asset(hoverImageName);
  });
  img.addEventListener("mouseleave", () => {
    img.src = asset(imageName);
  });
  img.addEventListener("click", onClick);
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  });
  return img;
}

// Image button whose hover/click region is an independently sized hotspot instead of the image's own bounds.
function imageButtonWithHotspot(imageName, hoverImageName, imageClassName, hotspotClassName, altText, onClick) {
  const img = document.createElement("img");
  img.className = imageClassName;
  img.src = asset(imageName);
  img.alt = altText;
  const hotspot = document.createElement("div");
  hotspot.className = hotspotClassName;
  hotspot.tabIndex = 0;
  hotspot.setAttribute("role", "button");
  hotspot.setAttribute("aria-label", altText);
  const showHover = () => {
    img.src = asset(hoverImageName);
  };
  const hideHover = () => {
    img.src = asset(imageName);
  };
  hotspot.addEventListener("mouseenter", showHover);
  hotspot.addEventListener("mouseleave", hideHover);
  hotspot.addEventListener("focus", showHover);
  hotspot.addEventListener("blur", hideHover);
  hotspot.addEventListener("click", onClick);
  hotspot.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  });
  return [img, hotspot];
}

// Image button wrapped in a positioned container so a hover popup can appear to its left.
function imageButtonWithPopup(imageName, hoverImageName, className, altText, onClick, popupText) {
  const wrapper = document.createElement("div");
  wrapper.className = `${className} image-button-wrapper`;
  wrapper.tabIndex = 0;
  wrapper.setAttribute("role", "button");
  wrapper.setAttribute("aria-label", altText);
  const img = document.createElement("img");
  img.className = "image-button-img";
  img.src = asset(imageName);
  img.alt = "";
  const popup = document.createElement("div");
  popup.className = "image-button-popup";
  popup.textContent = popupText;
  wrapper.append(img, popup);
  const showHover = () => {
    img.src = asset(hoverImageName);
  };
  const hideHover = () => {
    img.src = asset(imageName);
  };
  wrapper.addEventListener("mouseenter", showHover);
  wrapper.addEventListener("mouseleave", hideHover);
  wrapper.addEventListener("focus", showHover);
  wrapper.addEventListener("blur", hideHover);
  wrapper.addEventListener("click", onClick);
  wrapper.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  });
  return wrapper;
}

function addHotspotHoverImage(hotspot, imageName, imageX, imageY, imageWidth, imageHeight) {
  let hoverImage = null;
  const showImage = () => {
    if (hoverImage) return;
    const { scale, imageLeft, imageTop } = getArtLayout();
    hoverImage = document.createElement("img");
    hoverImage.className = "hotspot-hover-image";
    hoverImage.src = asset(imageName);
    hoverImage.alt = "";
    hoverImage.style.left = `${imageLeft + imageX * scale}px`;
    hoverImage.style.top = `${imageTop + imageY * scale}px`;
    hoverImage.style.width = `${imageWidth * scale}px`;
    hoverImage.style.height = `${imageHeight * scale}px`;
    root.append(hoverImage);
  };
  const hideImage = () => {
    hoverImage?.remove();
    hoverImage = null;
  };
  hotspot.addEventListener("mouseenter", showImage);
  hotspot.addEventListener("mouseleave", hideImage);
  hotspot.addEventListener("focus", showImage);
  hotspot.addEventListener("blur", hideImage);
  return () => {
    hotspot.removeEventListener("mouseenter", showImage);
    hotspot.removeEventListener("mouseleave", hideImage);
    hotspot.removeEventListener("focus", showImage);
    hotspot.removeEventListener("blur", hideImage);
    hideImage();
  };
}

// Function for risk classes. This affects the text color in the clipboard panel for fire and SPB risk.

function riskClass(risk) {
  return risk === "Low" ? "risk-low" : risk === "Moderate" ? "risk-moderate" : "risk-high";
}

/* Metrics panel. This is the clipboard panel that shows year, BA, TPA, QMD, Carbon per acre,
 Crowning index, fire risk, and SPB risk. */

function renderMetrics(parent = root) {
  const status = game.getStatusDict();
  const panel = document.createElement("section");
  panel.className = "metrics-panel";
  panel.innerHTML = `
    <div>Year: ${status.year}</div>
    <br>
    <div>Basal Area(BA): ${Number(status.BA).toFixed(1)} sqft/acre</div>
    <br>
    <div>Trees Per Acre(TPA): ${status.TPA}</div>
    <br>
    <div>Quadratic Mean Diameter(QMD): ${Number(status.QMD).toFixed(1)} inches</div>
    <br>
    <div>Carbon per Acre: ${Number(status.carbon).toFixed(1)} Metric Tons/acre</div>
    <br>
    <div>Crowning Index: ${Number(status.CI).toFixed(1)}</div>
    <span class="metric-risk ${riskClass(status.fire_risk)}">Fire Risk:<br>${status.fire_risk}</span>
    <span class="metric-risk ${riskClass(status.SPB_risk)}">Southern Pine Beetle Risk:<br>${status.SPB_risk}</span>
  `;
  parent.append(panel);
  return panel;
}

function renderBookshelfMedals() {
  const achievementOrder = new Map(
    (game.achievements_history || []).map(([, name], index) => [name, index])
  );
  const earnedMedals = bookshelfMedals
    .filter(([, achievementFlag, colonizedFlag]) => game[achievementFlag] || (colonizedFlag && game[colonizedFlag]))
    .sort(([nameA], [nameB]) => (achievementOrder.get(nameA) ?? Number.MAX_SAFE_INTEGER)
      - (achievementOrder.get(nameB) ?? Number.MAX_SAFE_INTEGER));

  earnedMedals.forEach(([, , , imageName, label], index) => {
    const slot = document.createElement("div");
    slot.className = `bookshelf-medal-slot bookshelf-medal-slot-${index + 1}`;
    slot.tabIndex = 0;
    slot.setAttribute("aria-label", label);
    const medal = document.createElement("img");
    medal.className = "bookshelf-medal-overlay";
    medal.src = asset(imageName);
    medal.alt = "";
    const tooltip = document.createElement("span");
    tooltip.className = "bookshelf-medal-tooltip";
    tooltip.textContent = label;
    slot.append(medal, tooltip);
    root.append(slot);
  });
}

async function downloadColoringPages(isGoodEnding) {
  if (!window.PDFLib) return;
  const templateNames = ["standard_coloringpage.pdf"];
  if (isGoodEnding) templateNames.push("goodend_coloringpage.pdf");
  coloringPageAchievements.forEach(([achievementFlag, colonizedFlag, pdfName]) => {
    if (game[achievementFlag] || (colonizedFlag && game[colonizedFlag])) templateNames.push(pdfName);
  });

  const combinedPdf = await PDFLib.PDFDocument.create();
  for (const templateName of templateNames) {
    const response = await fetch(asset(templateName));
    if (!response.ok) continue;
    const sourcePdf = await PDFLib.PDFDocument.load(await response.arrayBuffer());
    const pages = await combinedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    pages.forEach((page) => combinedPdf.addPage(page));
  }

  const link = document.createElement("a");
  link.download = "PitchPineTrailColoringPages.pdf";
  link.href = URL.createObjectURL(new Blob([await combinedPdf.save()], { type: "application/pdf" }));
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderColoringPageDownload(isGoodEnding) {
  const coloringPage = document.createElement("img");
  coloringPage.className = "coloring-page-download";
  coloringPage.src = asset("coloringpage_click.png");
  coloringPage.alt = "Download coloring pages";
  coloringPage.tabIndex = 0;
  coloringPage.addEventListener("mouseenter", () => {
    coloringPage.src = asset("coloringpage_click_hover.png");
  });
  coloringPage.addEventListener("mouseleave", () => {
    coloringPage.src = asset("coloringpage_click.png");
  });
  coloringPage.addEventListener("click", async () => {
    coloringPage.style.pointerEvents = "none";
    try {
      await downloadColoringPages(isGoodEnding);
    } finally {
      coloringPage.style.pointerEvents = "auto";
    }
  });
  coloringPage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      coloringPage.click();
    }
  });
  root.append(coloringPage);
}

function renderCommonNav() {
  root.append(
    imageButton("exitbutton.png", "exitbutton_hover.png", "main-exit-button", "Exit", () => showExitSurveyOverlay()),
    imageButton("restart.png", "restart_hover.png", "main-restart-button", "Restart", restartGameToZoom)
  );
}

function lastEventNamed(name) {
  const events = game.stand.events || [];
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    const eventName = Array.isArray(event) ? event[1] : event;
    const eventYear = Array.isArray(event) ? event[0] : null;
    if (eventName === name) return { eventName, eventYear };
  }
  return null;
}

// Non-losing events (Hurricane and Wildfire); 
// with flags for whether the event has been displayed yet.

function consumeNewModalEvents() {
  const hurricane = lastEventNamed("Hurricane passed through");
  if (hurricane && game.hurricane_last_shown_year !== hurricane.eventYear && !game.hurricane_screen_shown) {
    game.hurricane_pending = true;
    game.hurricane_last_shown_year = hurricane.eventYear;
  }
  const wildfire = lastEventNamed("WILDFIRE");
  if (wildfire && game.wildfire_last_shown_year !== wildfire.eventYear && !game.wildfire_screen_shown) {
    game.wildfire_pending = true;
    game.wildfire_last_shown_year = wildfire.eventYear;
  }
}

// Builds array of achievements to show
// Returns true if any achievements are queued.

function queueAchievements(before, finalBg) {
  const queue = [];
  if (!before.snake && game.pine_snakes_colonized) queue.push("snake");
  if (!before.gentian && game.gentian_colonized && !game.gentian_screen_shown) queue.push("gentian");
  if (!before.tanager && game.summer_tanager_colonized && !game.summer_tanager_screen_shown) queue.push("tanager");
  if (!before.bunting && game.indigo_bunting_colonized && !game.indigo_bunting_screen_shown) queue.push("bunting");
  if (!before.frog && game.pine_barrens_tree_frog_colonized && !game.tree_frog_screen_shown) queue.push("frog");
  if (!before.turkey && game.turkey_beard_achieved && !game.turkey_beard_screen_shown) queue.push("turkey");
  if (!before.short && game.short_colonized && !game.short_screen_shown) queue.push("short");
  consumeNewModalEvents();
  if (queue.length) {
    game.current_bg_img = finalBg.replace(/^assets\//, "");
    game.achievement_final_bg = game.current_bg_img;
    game.achievement_queue = queue;
    showNextQueuedAchievementOrGame();
    return true;
  }
  return false;
}

function applyTurn(action) {
  const before = {
    snake: game.pine_snakes_colonized,
    gentian: game.gentian_colonized,
    tanager: game.summer_tanager_colonized,
    bunting: game.indigo_bunting_colonized,
    frog: game.pine_barrens_tree_frog_colonized,
    turkey: game.turkey_beard_achieved,
    short: game.short_colonized
  };
  game.updateStand(action);
  const event = game.simulateEvent();
  game.stand.year += 10;
  return { before, event };
}

function finishTurn(before, event, finalBg, animate = null) {
  if (game.isLowTpaGameOver()) return showLowTpaScreen();
  if (game.stand.catastrophic_wildfire) return showFireLossScreen();
  if (event === "SPB outbreak!" && game.stand.SPB_risk === "High") return showSpbLossScreen();
  if (queueAchievements(before, finalBg)) return;
  consumeNewModalEvents();
  if (game.hurricane_pending) {
    game.hurricane_pending = false;
    return showHurricaneScreen();
  }
  if (game.wildfire_pending) {
    game.wildfire_pending = false;
    return showWildfireScreen();
  }
  if (game.stand.year >= 100) return showClosingScreen();
  if (animate) return startAnimation(animate.during, animate.ms, animate.final);
  showGameScreen(event || "");
}

function chooseAnimation(action) {
  const history = game.action_history;
  const burnIndices = history.map(([, a], i) => a === "4" ? i : -1).filter((i) => i >= 0);
  const heavyIndices = history.map(([, a], i) => a === "3" ? i : -1).filter((i) => i >= 0);
  const firstBurnIdx = burnIndices.length ? burnIndices[0] : null;
  const firstHeavyIdx = heavyIndices.length ? heavyIndices[0] : null;
  const pbBeforeHeavy = firstBurnIdx !== null && firstHeavyIdx !== null && burnIndices.some((i) => i < firstHeavyIdx);
  const pbAfterHeavy = firstBurnIdx !== null && firstHeavyIdx !== null && burnIndices.some((i) => i > firstHeavyIdx);
  const pbBothSides = pbBeforeHeavy && pbAfterHeavy;
  const heavyBeforeFirstBurn = firstBurnIdx !== null && heavyIndices.some((i) => i < firstBurnIdx);
  const heavyAfterFirstBurn = firstBurnIdx !== null && heavyIndices.some((i) => i > firstBurnIdx);
  const hasHeavy = history.some(([, a]) => a === "3");

  const pack = (during, ms, final) => ({ during, ms, final });
  if (action === "4" && !game.prescribed_burn_event && game.thin_lightly_event && !hasHeavy) {
    game.prescribed_burn_event = true;
    return pack("prescribedburn_treedown.jpg", 2000, "afterburn_treedown.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && game.prescribed_burn_event && !hasHeavy) {
    game.thin_lightly_event = true;
    return pack("chainsaw_afterburn.jpg", 1500, "afterburn_treedown.jpg");
  }
  if (action === "4" && !game.prescribed_burn_event && !history.some(([, a]) => ["2", "3"].includes(a))) {
    game.prescribed_burn_event = true;
    return pack("prescribedburn.jpg", 2000, "afterburn.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && !history.some(([, a]) => ["3", "4"].includes(a))) {
    game.thin_lightly_event = true;
    return pack("chainsaw.jpg", 1500, "treedown.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && hasHeavy && !game.prescribed_burn_event) {
    game.thin_lightly_event = true;
    return pack("chainsaw_heavythin.jpg", 1500, "heavythin_treedown.jpg");
  }
  if (action === "3" && !hasHeavy && game.prescribed_burn_event && !game.thin_lightly_event) {
    return pack("mower_afterburn.jpg", 2000, "heavythin_afterburn.jpg");
  }
  if (action === "3" && !hasHeavy && game.thin_lightly_event && !game.prescribed_burn_event) {
    return pack("mower_treedown.jpg", 2000, "heavythin_treedown.jpg");
  }
  if (action === "3" && !hasHeavy && !game.thin_lightly_event && !game.prescribed_burn_event) {
    return pack("mower.jpg", 2000, "heavythin.jpg");
  }
  if (action === "3" && !hasHeavy && game.prescribed_burn_event && game.thin_lightly_event) {
    return pack("mower_afterburn_treedown.jpg", 2000, "heavythin_afterburn_treedown.jpg");
  }
  if (action === "4" && !game.prescribed_burn_event && hasHeavy && !game.thin_lightly_event) {
    game.prescribed_burn_event = true;
    return pack("prescribedburn_heavythin.jpg", 2000, "afterburn_heavythin.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && game.prescribed_burn_event && hasHeavy && heavyAfterFirstBurn && !heavyBeforeFirstBurn) {
    game.thin_lightly_event = true;
    return pack("chainsaw_heavythin_afterburn.jpg", 1500, "heavythin_afterburn_treedown.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && game.prescribed_burn_event && hasHeavy && firstBurnIdx !== null && firstHeavyIdx !== null && firstHeavyIdx < firstBurnIdx) {
    game.thin_lightly_event = true;
    return pack("chainsaw_afterburn_heavythin.jpg", 1500, "afterburn_heavythin_treedown.jpg");
  }
  if (action === "4" && !game.prescribed_burn_event && game.thin_lightly_event && hasHeavy) {
    game.prescribed_burn_event = true;
    return pack("prescribedburn_treedown_heavythin.jpg", 2000, "afterburn_heavythin_treedown.jpg");
  }
  if (action === "4" && game.prescribed_burn_event && hasHeavy && !game.thin_lightly_event && pbBeforeHeavy && !game.pb_after_first_heavythin_shown) {
    game.pb_after_first_heavythin_shown = true;
    return pack("prescribedburn2_heavythin.jpg", 2000, "afterburn_heavythin.jpg");
  }
  if (action === "4" && game.prescribed_burn_event && hasHeavy && game.thin_lightly_event && pbBeforeHeavy && !game.pb_after_heavythin_with_tl_shown) {
    game.pb_after_heavythin_with_tl_shown = true;
    return pack("prescribedburn2_heavythin_treedown.jpg", 2000, "afterburn_heavythin_treedown.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && pbBothSides) {
    game.thin_lightly_event = true;
    return pack("chainsaw_afterburn_heavythin.jpg", 1500, "afterburn_heavythin_treedown.jpg");
  }
  if (action === "2" && !game.thin_lightly_event && !game.prescribed_burn_event && hasHeavy && firstHeavyIdx !== null && (firstBurnIdx === null || firstHeavyIdx < firstBurnIdx)) {
    game.thin_lightly_event = true;
    return pack("chainsaw_afterburn_heavythin.jpg", 1500, "afterburn_heavythin_treedown.jpg");
  }
  return null;
}

function nextTurn(action) {
  game.has_made_first_choice = true;
  const animation = game.stand.year >= 90 && game.stand.year < 100 ? null : chooseAnimation(action);
  const { before, event } = applyTurn(action);
  const finalBg = animation?.final ?? game.current_bg_img ?? "Evenagestand.jpg";
  finishTurn(before, event, finalBg, animation);
}

function startAnimation(during, durationMs, final) {
  showGameScreen();
  setBg(during);
  setTimeout(() => {
    setBg(final);
    showGameScreen();
  }, durationMs);
}

function showIntroScreen() {
  root.style.backgroundSize = "cover";
  preloadImage("introscreen.jpg").then(() => {
    clearScreen("introscreen.jpg");
    sounds.playForestSound();
    const buttons = document.createElement("div");
    buttons.className = "intro-buttons";
    buttons.append(
      button("Begin", "tan-button", () => {
        startZoomSequence();
      }),
      button("Exit", "tan-button", () => showExitSurveyOverlay())
    );
    root.append(buttons);
  });
}

// Function for the intro zoom sequence from the title screen to the about screen.
// Plays a zoom sound and animates a series of images to create a zoom effect.

function startZoomSequence() {
  root.style.backgroundSize = "contain";
  sounds.playZoomSound();
  const frames = Array.from({ length: 10 }, (_, index) => `zoom_${index + 1}.jpg`);
  const preload = frames.map((name) => new Promise((resolve) => {
    const image = new Image();
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // The loaded image is still usable when decode() is unavailable.
      }
      resolve();
    };
    image.onerror = resolve;
    image.src = asset(name);
  }));

  Promise.all(preload).then(() => {
    clearScreen(frames[0]);
    let frame = 1;
    const timer = setInterval(() => {
      frame += 1;
      setBg(frames[frame - 1]);
      if (frame >= frames.length) {
        clearInterval(timer);
        showZoomFinalScreen();
      }
    }, 300);
  });
}

function showZoomFinalScreen() {
  root.style.backgroundSize = "contain";
  clearScreen("zoom_10.jpg");
  zoomHotspotCleanup = addZoomDefinitionsHotspot();
  const buttons = document.createElement("div");
  buttons.className = "intro-buttons-second";
  buttons.append(button("Let's Play!", "tan-button", showGameDisclaimerOverlay));
  root.append(buttons);
}

function showGameDisclaimerOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "disclaimer-overlay";
  const text = document.createElement("p");
  text.className = "disclaimer-text";
  text.textContent = "PLEASE NOTE: This game is based on real NJ forest data, tree growth and forest management concepts! However, in order to make this game playable and to best communicate the decision making and tradeoffs that go into real world forestry, adjustments have been made to growth and regeneration equations to mimic exaggerated scenarios that don't necessarily represent the real world and it's complexities. Ultimately this is a game, not a tool to plan or predict management! If you would like more details on actual forests metrics in NJ and how we actually plan management in our forests, please reach out at askaforester@dep.nj.gov";
  const gotIt = button("Got it!", "disclaimer-button", () => {
    overlay.remove();
    sounds.playLetsPlaySound();
    showGameScreen();
  });
  overlay.append(text, gotIt);
  root.append(overlay);
}

function addZoomDefinitionsHotspot() {
  const imageWidth = 5515;
  const imageHeight = 2700;
  const hotspots = [
    {
      x: 142,
      y: 714,
      text: "When playing the game, click here to help understand what different terms and management decisions mean!",
      label: "Definitions book information"
    },
    {
      x: 299,
      y: 1252,
      text: "When playing the game, click here for the field guide of rare plants and animals that could come live in your forest!",
      label: "Rare plants and animals field guide information"
    },
    {
      x: 79,
      y: 226,
      width: 250,
      height: 237,
      text: "You don't need a hint yet! You haven't even started!",
      label: "Hint information"
    }
  ].map(({ x, y, width = 304, height = 426, text, label }) => {
    const hotspot = document.createElement("div");
    hotspot.className = "zoom-definitions-hotspot";
    hotspot.tabIndex = 0;
    hotspot.setAttribute("aria-label", label);
    const popup = document.createElement("div");
    popup.className = "zoom-definitions-popup";
    popup.textContent = text;
    hotspot.append(popup);
    root.append(hotspot);
    const hoverAssets = {
      142: ["definitions_hover.png", 126, 712, 349, 470],
      299: ["fieldguide_hover.png", 284, 1251, 382, 541],
      79: ["hint_hover.png", 63, 227, 282, 237]
    };
    const [imageName, imageX, imageY, imageWidth, imageHeight] = hoverAssets[x];
    return { hotspot, x, y, width, height, cleanupHover: addHotspotHoverImage(hotspot, imageName, imageX, imageY, imageWidth, imageHeight) };
  });

  const positionHotspot = () => {
    const rootWidth = root.clientWidth;
    const rootHeight = root.clientHeight;
    const scale = Math.min(rootWidth / imageWidth, rootHeight / imageHeight);
    const displayedWidth = imageWidth * scale;
    const displayedHeight = imageHeight * scale;
    const imageLeft = (rootWidth - displayedWidth) / 2;
    const imageTop = (rootHeight - displayedHeight) / 2;
    for (const { hotspot, x, y, width, height } of hotspots) {
      hotspot.style.left = `${imageLeft + x * scale}px`;
      hotspot.style.top = `${imageTop + y * scale}px`;
      hotspot.style.width = `${width * scale}px`;
      hotspot.style.height = `${height * scale}px`;
    }
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    hotspots.forEach(({ hotspot, cleanupHover }) => {
      cleanupHover();
      hotspot.remove();
    });
  };
}

function addGameDefinitionsHotspot() {
  const imageWidth = ART_WIDTH;
  const imageHeight = ART_HEIGHT;
  const hotspot = document.createElement("div");
  hotspot.className = "zoom-definitions-hotspot";
  hotspot.tabIndex = 0;
  hotspot.setAttribute("aria-label", "Glossary information");
  hotspot.addEventListener("click", showDefinitionsScreen);
  const popup = document.createElement("div");
  popup.className = "zoom-definitions-popup";
  popup.textContent = "Don't know what a term means? Click here for the Glossary!";
  hotspot.append(popup);
  root.append(hotspot);
  const cleanupHover = addHotspotHoverImage(hotspot, "definitions_hover.png", 126, 712, 349, 470);

  const positionHotspot = () => {
    const { scale, imageLeft, imageTop } = getArtLayout(imageWidth, imageHeight);
    hotspot.style.left = `${imageLeft + 142 * scale}px`;
    hotspot.style.top = `${imageTop + 714 * scale}px`;
    hotspot.style.width = `${304 * scale}px`;
    hotspot.style.height = `${426 * scale}px`;
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    cleanupHover();
    hotspot.remove();
  };
}

function addGameFieldGuideHotspot() {
  const imageWidth = ART_WIDTH;
  const imageHeight = ART_HEIGHT;
  const hotspot = document.createElement("div");
  hotspot.className = "zoom-definitions-hotspot";
  hotspot.tabIndex = 0;
  hotspot.setAttribute("aria-label", "Field guide information");
  hotspot.addEventListener("click", showFieldGuideScreen);
  const popup = document.createElement("div");
  popup.className = "zoom-definitions-popup";
  popup.textContent = "Don't know what a plant or animal is? Click here for the Field Guide!";
  hotspot.append(popup);
  root.append(hotspot);
  const cleanupHover = addHotspotHoverImage(hotspot, "fieldguide_hover.png", 284, 1251, 382, 541);

  const positionHotspot = () => {
    const { scale, imageLeft, imageTop } = getArtLayout(imageWidth, imageHeight);
    hotspot.style.left = `${imageLeft + 299 * scale}px`;
    hotspot.style.top = `${imageTop + 1252 * scale}px`;
    hotspot.style.width = `${304 * scale}px`;
    hotspot.style.height = `${426 * scale}px`;
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    cleanupHover();
    hotspot.remove();
  };
}

function addGameHintHotspot() {
  const x = 79;
  const y = 226;
  const width = 250;
  const height = 237;
  const hotspot = document.createElement("div");
  hotspot.className = "zoom-definitions-hotspot";
  hotspot.tabIndex = 0;
  hotspot.setAttribute("aria-label", "Hint information");
  hotspot.addEventListener("click", showHintOverlay);
  const popup = document.createElement("div");
  popup.className = "zoom-definitions-popup";
  popup.textContent = "Stuck? Click for a hint!";
  hotspot.append(popup);
  root.append(hotspot);
  const cleanupHover = addHotspotHoverImage(hotspot, "hint_hover.png", 63, 227, 282, 237);

  const positionHotspot = () => {
    const { scale, imageLeft, imageTop } = getArtLayout();
    hotspot.style.left = `${imageLeft + x * scale}px`;
    hotspot.style.top = `${imageTop + y * scale}px`;
    hotspot.style.width = `${width * scale}px`;
    hotspot.style.height = `${height * scale}px`;
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    cleanupHover();
    hotspot.remove();
  };
}

function addGuideReturnHotspot(x, y, label, returnBg, showHover = true) {
  const hotspot = document.createElement("div");
  hotspot.className = "guide-return-hotspot";
  hotspot.tabIndex = 0;
  hotspot.setAttribute("aria-label", label);
  hotspot.addEventListener("click", () => {
    sounds.playPageCloseSound();
    game.current_bg_img = returnBg;
    showGameScreen();
  });
  root.append(hotspot);
  const [imageName, imageX, imageY, imageWidth, imageHeight] = x === 142
    ? ["definitions_hover.png", 126, 712, 349, 470]
    : ["fieldguide_hover.png", 284, 1251, 382, 541];
  const cleanupHover = showHover
    ? addHotspotHoverImage(hotspot, imageName, imageX, imageY, imageWidth, imageHeight)
    : () => {};

  const positionHotspot = () => {
    const { scale, imageLeft, imageTop } = getArtLayout();
    hotspot.style.left = `${imageLeft + x * scale}px`;
    hotspot.style.top = `${imageTop + y * scale}px`;
    hotspot.style.width = `${304 * scale}px`;
    hotspot.style.height = `${426 * scale}px`;
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    cleanupHover();
    hotspot.remove();
  };
}

function addAnalysisDefinitionsHotspot(label, onClick, text = "", showHover = true) {
  const x = 142;
  const y = 714;
  const width = 304;
  const height = 426;
  const hotspot = document.createElement("div");
  hotspot.className = "zoom-definitions-hotspot";
  hotspot.tabIndex = 0;
  hotspot.setAttribute("aria-label", label);
  hotspot.addEventListener("click", onClick);
  if (text) {
    const popup = document.createElement("div");
    popup.className = "zoom-definitions-popup";
    popup.textContent = text;
    hotspot.append(popup);
  }
  root.append(hotspot);
  const cleanupHover = showHover
    ? addHotspotHoverImage(hotspot, "definitions_hover.png", 126, 712, 349, 470)
    : () => {};

  const positionHotspot = () => {
    const { scale, imageLeft, imageTop } = getArtLayout();
    hotspot.style.left = `${imageLeft + x * scale}px`;
    hotspot.style.top = `${imageTop + y * scale}px`;
    hotspot.style.width = `${width * scale}px`;
    hotspot.style.height = `${height * scale}px`;
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    cleanupHover();
    hotspot.remove();
  };
}

function addAnalysisFieldGuideHotspot(label, onClick, text = "", showHover = true) {
  const x = 299;
  const y = 1252;
  const width = 304;
  const height = 426;
  const hotspot = document.createElement("div");
  hotspot.className = "zoom-definitions-hotspot";
  hotspot.tabIndex = 0;
  hotspot.setAttribute("aria-label", label);
  hotspot.addEventListener("click", onClick);
  if (text) {
    const popup = document.createElement("div");
    popup.className = "zoom-definitions-popup";
    popup.textContent = text;
    hotspot.append(popup);
  }
  root.append(hotspot);
  const cleanupHover = showHover
    ? addHotspotHoverImage(hotspot, "fieldguide_hover.png", 284, 1251, 382, 541)
    : () => {};

  const positionHotspot = () => {
    const { scale, imageLeft, imageTop } = getArtLayout();
    hotspot.style.left = `${imageLeft + x * scale}px`;
    hotspot.style.top = `${imageTop + y * scale}px`;
    hotspot.style.width = `${width * scale}px`;
    hotspot.style.height = `${height * scale}px`;
  };

  positionHotspot();
  window.addEventListener("resize", positionHotspot);
  return () => {
    window.removeEventListener("resize", positionHotspot);
    cleanupHover();
    hotspot.remove();
  };
}

function showGameScreen(narration = "") {
  const bg = game.current_bg_img?.startsWith("zoom_") ? "Evenagestand.jpg" : game.current_bg_img || "Evenagestand.jpg";
  clearScreen(bg);
  renderMetrics();
  renderBookshelfMedals();
  const actions = document.createElement("section");
  actions.className = "action-panel";
  for (const [key, label] of Object.entries(ACTIONS).filter(([key]) => ["1", "2", "3", "4"].includes(key))) {
    actions.append(button(`${key}. ${label}`, "action-button", () => {
      if (key === "1") sounds.playDoNothingSound();
      if (key === "2") sounds.playThinLightlySound();
      if (key === "3") sounds.playThinHeavilySound();
      if (key === "4") sounds.playPrescribedBurnSound();
      nextTurn(key);
    }));
  }
  root.append(actions);
  if (narration) {
    const note = document.createElement("div");
    note.className = "event-message";
    note.textContent = narration;
    root.append(note);
  }
  renderCommonNav();
  const cleanupDefinitionsHotspot = addGameDefinitionsHotspot();
  const cleanupFieldGuideHotspot = addGameFieldGuideHotspot();
  const cleanupHintHotspot = addGameHintHotspot();
  zoomHotspotCleanup = () => {
    cleanupDefinitionsHotspot();
    cleanupFieldGuideHotspot();
    cleanupHintHotspot();
  };
}

function showClosingScreen() {
  stopAllLoops(["forest"]);
  sounds.playTrumpetWinSound();
  clearScreen(getWinBgName());
  renderMetrics();
  renderColoringPageDownload(getWinBgName() === "good.jpg");
  const achievementOrder = new Map(
    (game.achievements_history || []).map(([year, name], index) => [name, index])
  );
  const earnedMedals = endingMedals
    .filter(([, achievementFlag, colonizedFlag]) => game[achievementFlag] || (colonizedFlag && game[colonizedFlag]))
    .sort(([nameA], [nameB]) => (achievementOrder.get(nameA) ?? Number.MAX_SAFE_INTEGER)
      - (achievementOrder.get(nameB) ?? Number.MAX_SAFE_INTEGER));
  earnedMedals.forEach(([, , , imageName], index) => {
      const medal = document.createElement("img");
      medal.className = `ending-medal-overlay ending-medal-slot-${index + 1}`;
      medal.src = asset(imageName);
      medal.alt = "";
      root.append(medal);
  });
  const summary = document.createElement("section");
  summary.className = "summary-panel";
  summary.textContent = game.getActionSummary();
  root.append(summary);
  const actions = document.createElement("div");
  actions.className = "closing-actions";
  actions.append(
    imageButtonWithPopup("analysislab_button.png", "analysislab_button_hover.png", "closing-analyze-button", "Analyze My Management", () => {
      sounds.playComputerStartup();
      showAnalysisLab(getWinBgName(), true, "closing");
    }, "To the computer lab!"),
    imageButton("savecert.png", "savecert_hover.png", "closing-certificate-button", "Save your successful management certificate", showCertificateOverlay),
    imageButtonWithPopup("tryagain.png", "tryagain_hover.png", "closing-restart-button", "Try Again", restartGame, "Whoo Hoo! Let's go!"),
    imageButtonWithPopup("exitbutton.png", "exitbutton_hover.png", "closing-exit-button", "Exit", () => showExitSurveyOverlay(), "Hope to see you again soon!"),
    imageButtonWithPopup("pocketprez.png", "pocketprez_hover.png", "closing-pocketprez-button", "Learn more about forestry concepts", () => window.open("https://dep.nj.gov/parksandforests/conservation/pocket-presentations/", "_blank", "noopener,noreferrer"), "Click here to learn more about the Forestry concepts presented in this game!")
  );
  root.append(actions);
}

function getWinBgName() {
  const status = game.getStatusDict();
  const rating = status.QMD < 13 ? "bad" : status.QMD < 15 ? "okay" : "good";
  return `${rating}.jpg`;
}

function showLossScreen(bg, text, soundFn) {
  stopAllLoops();
  soundFn?.();
  clearScreen(bg);
  renderMetrics();
  renderColoringPageDownload(false);
  const message = document.createElement("section");
  message.className = "loss-message";
  message.textContent = text;
  root.append(message);
  const actions = document.createElement("div");
  actions.className = "closing-actions";
  actions.append(
    imageButtonWithPopup("analysislab_button.png", "analysislab_button_hover.png", "closing-analyze-button", "Analyze My Management", () => showAnalysisLab(bg, true, bg), "To the computer lab!"),
    imageButtonWithPopup("tryagain.png", "tryagain_hover.png", "closing-restart-button", "Try Again", restartGame, "Whoo Hoo! Let's go!"),
    imageButtonWithPopup("exitbutton.png", "exitbutton_hover.png", "closing-exit-button", "Exit", () => showExitSurveyOverlay(), "Hope to see you again soon!"),
    imageButtonWithPopup("pocketprez.png", "pocketprez_hover.png", "closing-pocketprez-button", "Learn more about forestry concepts", () => window.open("https://dep.nj.gov/parksandforests/conservation/pocket-presentations/", "_blank", "noopener,noreferrer"), "Click here to learn more about the Forestry concepts presented in this game!")
  );
  root.append(actions);
}

function showLowTpaScreen() {
  showLossScreen("LowStocking.jpg", "The forest's growing stock trees have been depleted!\n\nWe're supposed to be growing a forest!", () => {
    sounds.playLosingTromboneSound();
    sounds.playWindSound();
  });
}

function showFireLossScreen() {
  showLossScreen("LossByFire.jpg", "A catastrophic wildfire has occurred!\n\nWe might get a new stand of pitch pine, but we're trying to grow a mature stand!", sounds.playFireSound);
}

function showSpbLossScreen() {
  showLossScreen("LossBySPB.jpg", "A Southern Pine Beetle outbreak has devastated your stand!\n\nWe're trying to grow a healthy forest!", sounds.playSpbEatingSound);
}

function showAchievementScreen(code) {
  const info = achievementScreens[code];
  if (!info) return showNextQueuedAchievementOrGame();
  clearScreen(info.image);
  info.sound?.();
  renderMetrics();
  renderBookshelfMedals();
  const message = document.createElement("section");
  message.className = "achievement-message";
  message.textContent = info.title;
  root.append(message);
  const actions = document.createElement("div");
  actions.className = "achievement-actions";
  actions.append(button("Continue", "green-button", () => {
    if (frogAnimationTimer) clearTimeout(frogAnimationTimer);
    if (code === "frog") sounds.stopTreeFrogSound();
    showNextQueuedAchievementOrGame();
  }));
  root.append(actions);
  renderCommonNav();
  let frogAnimationTimer = null;
  if (code === "frog") {
    const cycle = () => {
      setBg("treefrog_1.jpg");
      frogAnimationTimer = setTimeout(() => {
        setBg("treefrog.jpg");
        frogAnimationTimer = setTimeout(cycle, 1000);
      }, 400);
    };
    frogAnimationTimer = setTimeout(cycle, 500);
  }
}

function showNextQueuedAchievementOrGame() {
  const code = game.achievement_queue.shift();
  if (code) {
    if (code === "snake") game.pine_snake_achieved = true;
    if (code === "gentian") {
      game.gentian_screen_shown = true;
      game.gentian_achieved = true;
    }
    if (code === "tanager") {
      game.summer_tanager_screen_shown = true;
      game.summer_tanager_achieved = true;
    }
    if (code === "bunting") {
      game.indigo_bunting_screen_shown = true;
      game.indigo_bunting_achieved = true;
    }
    if (code === "frog") {
      game.tree_frog_screen_shown = true;
      game.tree_frog_achieved = true;
    }
    if (code === "turkey") {
      game.turkey_beard_screen_shown = true;
      game.turkey_beard_achieved = true;
    }
    if (code === "short") {
      game.short_screen_shown = true;
      game.short_achieved = true;
    }
    return showAchievementScreen(code);
  }
  if (game.achievement_final_bg) {
    game.current_bg_img = game.achievement_final_bg;
    game.achievement_final_bg = null;
  }
  if (game.hurricane_pending) {
    game.hurricane_pending = false;
    return showHurricaneScreen();
  }
  if (game.wildfire_pending) {
    game.wildfire_pending = false;
    return showWildfireScreen();
  }
  if (game.stand.year >= 100) return showClosingScreen();
  showGameScreen();
}

function showHurricaneScreen() {
  if (game.hurricane_screen_shown) return showGameScreen();
  game.event_return_bg = game.current_bg_img;
  game.hurricane_screen_shown = true;
  sounds.playHurricaneSound();
  clearScreen("hurricane_lightning.jpg");
  renderMetrics();
  renderBookshelfMedals();
  let hurricaneTimer = null;
  const continueHurricane = () => {
    if (hurricaneTimer) clearTimeout(hurricaneTimer);
    sounds.stopHurricaneSound();
    game.current_bg_img = game.event_return_bg || "Evenagestand.jpg";
    game.event_return_bg = null;
    showGameScreen();
  };
  const actions = document.createElement("div");
  actions.className = "event-actions";
  actions.append(button("Continue", "green-button", continueHurricane));
  root.append(actions);
  renderCommonNav();
  finishHurricaneScreen();
  const sequence = [
    ["hurricane_lightning.jpg", 200],
    ["hurricane_rain.jpg", 2900],
    ["hurricane_lightning.jpg", 200],
    ["hurricane_rain.jpg", 5100],
    ["hurricane_after.jpg", null]
  ];
  let index = 0;
  const step = () => {
    const [image, delay] = sequence[index];
    setBg(image);
    if (delay == null) return finishHurricaneScreen();
    index += 1;
    hurricaneTimer = setTimeout(step, delay);
  };
  step();
}

function finishHurricaneScreen() {
  if (root.querySelector(".hurricane-message")) return;
  const message = document.createElement("section");
  message.className = "event-message hurricane-message";
  message.textContent = "A hurricane passed through your forest.\n\nYour forest is still living but this may have significantly changed your forest metrics.";
  root.append(message);
}

function showWildfireScreen() {
  if (game.wildfire_screen_shown) return showGameScreen();
  game.event_return_bg = game.current_bg_img;
  game.wildfire_screen_shown = true;
  sounds.playFireSound();
  clearScreen("nonlosing_fire.jpg");
  renderMetrics();
  renderBookshelfMedals();
  const message = document.createElement("section");
  message.className = "event-message";
  message.textContent = "Your prescribed burn got out of control! Your forest was already at high fire risk...\n\nYour forest is still living but this may have changed your metrics.";
  root.append(message);
  const actions = document.createElement("div");
  actions.className = "event-actions";
  actions.append(button("Continue", "green-button", () => {
    sounds.stopFireSound();
    game.current_bg_img = game.event_return_bg || "Evenagestand.jpg";
    game.event_return_bg = null;
    if (game.stand.year >= 100) showClosingScreen();
    else showGameScreen();
  }));
  root.append(actions);
  renderCommonNav();
}

function showFieldGuideScreen() {
  sounds.playPageTurnSound();
  const returnBg = game.current_bg_img;
  clearScreen();
  const fieldGuideOverlay = document.createElement("img");
  fieldGuideOverlay.className = "field-guide-overlay";
  fieldGuideOverlay.src = asset("fieldguide.png");
  fieldGuideOverlay.alt = "";
  root.append(fieldGuideOverlay);
  renderMetrics();
  renderBookshelfMedals();
  const cleanupDefinitionsHotspot = addGameDefinitionsHotspot();
  const cleanupReturnHotspot = addGuideReturnHotspot(299, 1252, "Return from field guide", returnBg, false);
  zoomHotspotCleanup = () => {
    cleanupDefinitionsHotspot();
    cleanupReturnHotspot();
  };
}

function showDefinitionsScreen() {
  sounds.playPageTurnSound();
  const returnBg = game.current_bg_img;
  clearScreen();
  const definitionsOverlay = document.createElement("img");
  definitionsOverlay.className = "definitions-overlay";
  definitionsOverlay.src = asset("definitions.png");
  definitionsOverlay.alt = "";
  root.append(definitionsOverlay);
  renderMetrics();
  renderBookshelfMedals();
  const cleanupFieldGuideHotspot = addGameFieldGuideHotspot();
  const cleanupReturnHotspot = addGuideReturnHotspot(142, 714, "Return from glossary", returnBg, false);
  zoomHotspotCleanup = () => {
    cleanupFieldGuideHotspot();
    cleanupReturnHotspot();
  };
}

function showAnalysisDefinitions(prevBg, returnTarget) {
  sounds.playPageTurnSound();
  clearScreen("analyze_definitions.jpg");
  renderAnalysisOverlays(game.getDecadalData(10), false);
  const cleanupReturnHotspot = addAnalysisDefinitionsHotspot(
    "Return to Analysis Lab",
    () => {
      sounds.playPageCloseSound();
      showAnalysisLab(prevBg, false, returnTarget);
    },
    "",
    false
  );
  const cleanupFieldGuideHotspot = addAnalysisFieldGuideHotspot(
    "Analysis field guide information",
    () => showAnalysisFieldGuide(prevBg, returnTarget),
    "Don't know what a plant or animal is? Click here for the Field Guide!"
  );
  zoomHotspotCleanup = () => {
    cleanupReturnHotspot();
    cleanupFieldGuideHotspot();
  };
}

function showAnalysisFieldGuide(prevBg, returnTarget) {
  sounds.playPageTurnSound();
  clearScreen("analyze_fieldguide.jpg");
  renderAnalysisOverlays(game.getDecadalData(10), false);
  const cleanupDefinitionsHotspot = addAnalysisDefinitionsHotspot(
    "Analysis definitions information",
    () => showAnalysisDefinitions(prevBg, returnTarget),
    "Don't know what a term means? Click here for the Glossary!"
  );
  const cleanupReturnHotspot = addAnalysisFieldGuideHotspot(
    "Return to Analysis Lab",
    () => {
      sounds.playPageCloseSound();
      showAnalysisLab(prevBg, false, returnTarget);
    },
    "",
    false
  );
  zoomHotspotCleanup = () => {
    cleanupDefinitionsHotspot();
    cleanupReturnHotspot();
  };
}

function showHintOverlay() {
  sounds.playHintOpenSound();
  const existing = root.querySelector(".hint-overlay");
  if (existing) existing.remove();
  const images = Array.from({ length: 12 }, (_, index) => `hint${index + 1}.jpg`);
  const overlay = document.createElement("div");
  overlay.className = "hint-overlay";
  const { scale, imageLeft, imageTop } = getArtLayout();
  const hotspotRight = imageLeft + (79 + 250) * scale;
  const availableWidth = root.clientWidth - hotspotRight - 20;
  overlay.style.left = `${hotspotRight + 20}px`;
  overlay.style.top = `${imageTop + 226 * scale}px`;
  overlay.style.width = `${Math.max(0, Math.min(2200 * scale, availableWidth))}px`;
  overlay.style.transform = "none";
  overlay.innerHTML = `<img src="${asset(images[game.hint_index % images.length])}" alt="">`;
  game.hint_index = (game.hint_index + 1) % images.length;
  overlay.append(button("Close Hint", "red-button hint-close", () => {
    sounds.playHintCloseSound();
    overlay.remove();
  }));
  root.append(overlay);
}

function showExitSurveyOverlay() {
  sounds.playPageTurnSound();
  const existing = root.querySelector(".survey-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "survey-overlay";
  overlay.innerHTML = `<img src="${asset("exitsurvey.jpg")}" alt="">`;
  const actions = document.createElement("div");
  actions.className = "survey-actions";
  actions.append(
    button("Open Feedback Survey", "tan-button survey-open-button", () => window.open("https://forms.office.com/g/N38DQhPe2V", "_blank", "noopener")),
    button("Exit", "red-button survey-exit-button", () => {
      stopAllLoops();
      window.close();
      clearScreen(null);
      root.style.backgroundImage = "";
    }),
    button("Cancel", "green-button survey-cancel-button", () => overlay.remove())
  );
  overlay.append(actions);
  root.append(overlay);
}

function showCertificateOverlay() {
  const existing = root.querySelector(".certificate-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "certificate-overlay";
  overlay.innerHTML = `<img src="${asset("nameplate.jpg")}" alt="">`;
  const input = document.createElement("input");
  input.className = "certificate-name";
  input.placeholder = "Your name";
  const fitCertificateName = () => {
    input.style.fontSize = "";
    const maximumFontSize = Number.parseFloat(getComputedStyle(input).fontSize);
    const minimumFontSize = 12;
    let fontSize = maximumFontSize;
    while (input.scrollWidth > input.clientWidth && fontSize > minimumFontSize) {
      fontSize -= 0.5;
      input.style.fontSize = `${fontSize}px`;
    }
  };
  input.addEventListener("input", fitCertificateName);
  const save = button("Save", "green-button certificate-save", async () => {
    sounds.playSaveSound();
    if (!window.html2canvas || !window.PDFLib) return;
    const enteredName = input.value.trim();
    const hiddenElements = [overlay, ...root.querySelectorAll("button")];
    hiddenElements.forEach((element) => element.classList.add("hidden"));
    try {
      const canvas = await html2canvas(root);
      const pdfBytes = await fetch(asset("certificate_blank.pdf")).then((response) => {
        if (!response.ok) throw new Error("Unable to load certificate PDF template.");
        return response.arrayBuffer();
      });
      const pdf = await PDFLib.PDFDocument.load(pdfBytes);
      const page = pdf.getPages()[0];
      const pixelsToPoints = 72 / 300;
      const screenshot = await pdf.embedPng(canvas.toDataURL("image/png"));
      const screenshotWidth = 3300 * pixelsToPoints;
      const screenshotHeight = 1638 * pixelsToPoints;
      page.drawImage(screenshot, {
        x: 0,
        y: page.getHeight() - (913 + 1638) * pixelsToPoints,
        width: screenshotWidth,
        height: screenshotHeight
      });

      if (enteredName) {
        const font = await pdf.embedFont(PDFLib.StandardFonts.CourierBold);
        const maximumNameWidth = 2279 * pixelsToPoints;
        const maximumNameHeight = 321 * pixelsToPoints;
        let fontSize = maximumNameHeight / font.heightAtSize(1.5, { descender: false });
        while (font.widthOfTextAtSize(enteredName, fontSize) > maximumNameWidth) fontSize -= 0.5;
        const textWidth = font.widthOfTextAtSize(enteredName, fontSize);
        const textHeight = font.heightAtSize(fontSize, { descender: false });
        page.drawText(enteredName, {
          x: 2066 * pixelsToPoints - textWidth / 2,
          y: page.getHeight() - 430 * pixelsToPoints - textHeight / 2,
          size: fontSize,
          font,
          color: PDFLib.rgb(0, 75 / 255, 28 / 255)
        });
      }

      const downloadName = enteredName.replace(/[\\/:*?"<>|]/g, "_") || "Certificate";
      const link = document.createElement("a");
      link.download = `PitchPineTrailCertificate_${downloadName}.pdf`;
      link.href = URL.createObjectURL(new Blob([await pdf.save()], { type: "application/pdf" }));
      link.click();
      URL.revokeObjectURL(link.href);
      game.certificate_saved = true;
    } finally {
      hiddenElements.forEach((element) => {
        if (element === save && game.certificate_saved) element.remove();
        else element.classList.remove("hidden");
      });
    }
  });
  overlay.append(input);
  root.append(overlay);
  if (!game.certificate_saved) root.append(save);
}

// Switches screen to Analysis Lab

function renderAnalysisOverlays(rows, showGraphs = true) {
  renderBookshelfMedals();
  const summary = document.createElement("section");
  summary.className = "summary-panel";
  summary.textContent = game.getActionSummary();
  root.append(summary);

  const achievements = document.createElement("section");
  achievements.className = "achievement-list";
  const grouped = new Map();
  for (const [year, name] of game.getAchievementsList()) {
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year).push(name);
  }
  achievements.textContent = grouped.size
    ? [...grouped.entries()].map(([year, names]) => `Year ${year}:\n${names.map((name) => `   ${name}`).join("\n")}`).join("\n")
    : "No achievements.";
  root.append(achievements);

  if (showGraphs) {
    const plotButtons = document.createElement("div");
    plotButtons.className = "plot-buttons";
    const labels = {
      QMD: "QMD",
      TPA: "TPA",
      BA: "BA",
      carbon: "Carbon",
      CI: "CI",
      fireRisk: "Fire Risk",
      spbRisk: "SPB Risk"
    };
    for (const variable of Object.keys(labels)) {
      plotButtons.append(button(labels[variable], "green-button", () => showChartOverlay(variable, rows)));
    }
    root.append(plotButtons);
  }
}

function renderDataDownload() {
  const downloadData = () => {
    sounds.playSaveSound();
    exportCSV(game);
    root.querySelector(".floppy-confirmation")?.remove();
    const floppy = document.createElement("img");
    floppy.className = "floppy-confirmation";
    floppy.src = asset("floppy.png");
    floppy.alt = "";
    root.append(floppy);
    setTimeout(() => floppy.remove(), 5000);
  };
  const [download, hotspot] = imageButtonWithHotspot(
    "downloaddata.png", "downloaddata_hover.png", "data-download", "download-data-hotspot", "Download data", downloadData
  );
  root.append(download, hotspot);
}

function showAnalysisLab(prevBg = game.current_bg_img, loading = true, returnTarget = "game") {
  sounds.stopForestSound();
  sounds.stopFireSound();
  sounds.stopWindSound();
  sounds.stopSpbEatingSound();
  sounds.playAnalysisLabSound();
  clearScreen(loading ? "analyze_load.jpg" : "analyze.jpg");
  const build = () => {
    clearScreen("analyze.jpg");
    const rows = game.getDecadalData(10);
    const table = document.createElement("pre");
    table.className = "analysis-table";
    table.textContent = renderDataTable(rows);
    root.append(table);
    renderAnalysisOverlays(rows);
    const [returnImage, returnHotspot] = imageButtonWithHotspot(
      "returntogame.png", "returntogame_hover.png", "analysis-return", "analysis-return-hotspot", "Return to Game", () => {
        sounds.playComputerShutdown();
        sounds.stopAnalysisLabSound();
        setBg(prevBg);
        if (returnTarget === "closing") {
          showClosingScreen();
          sounds.playForestSound();
        } else if (returnTarget === "LowStocking.jpg") {
          showLowTpaScreen();
          sounds.playForestSound();
        } else if (returnTarget === "LossByFire.jpg") {
          showFireLossScreen();
          sounds.playForestSound();
        } else if (returnTarget === "LossBySPB.jpg") {
          showSpbLossScreen();
          sounds.playForestSound();
        } else if (game.stand.year >= 100) showClosingScreen();
        else showGameScreen();
      }
    );
    root.append(returnImage, returnHotspot);
    renderDataDownload();
    zoomHotspotCleanup = addAnalysisDefinitionsHotspot(
      "Analysis definitions information",
      () => showAnalysisDefinitions(prevBg, returnTarget),
      "Don't know what a term means? Click here for the Glossary!"
    );
    const cleanupFieldGuideHotspot = addAnalysisFieldGuideHotspot(
      "Analysis field guide information",
      () => showAnalysisFieldGuide(prevBg, returnTarget),
      "Don't know what a plant or animal is? Click here for the Field Guide!"
    );
    const cleanupDefinitionsHotspot = zoomHotspotCleanup;
    zoomHotspotCleanup = () => {
      cleanupDefinitionsHotspot();
      cleanupFieldGuideHotspot();
    };
    startAnalysisBlink();
  };
  if (loading) setTimeout(build, 1000);
  else build();
}

function showChartOverlay(variable, rows) {
  const existing = root.querySelector(".chart-overlay");
  if (existing) existing.remove();
  root.querySelector(".chart-close")?.remove();
  root.querySelector(".chart-faq")?.remove();
  const overlay = document.createElement("section");
  overlay.className = "chart-overlay";
  const chartBody = document.createElement("div");
  chartBody.className = "screen-fill";
  overlay.append(chartBody);
  const closeButton = button("Close Graph", "chart-close", () => {
    overlay.remove();
    closeButton.remove();
    faqButton.remove();
  });
  const faqButton = button("Why does my graph look like that?", "chart-faq", () => showFaqOverlay(closeButton, faqButton));
  root.append(overlay, closeButton, faqButton);
  showVariablePlot(chartBody, variable, rows);
}

function showFaqOverlay(closeButton, faqButton) {
  if (root.querySelector(".faq-overlay")) return;
  const overlay = document.createElement("div");
  overlay.className = "faq-overlay";
  overlay.innerHTML = `<img src="${asset("FAQs.jpg")}" alt="">`;
  closeButton.classList.add("hidden");
  faqButton.classList.add("hidden");
  overlay.append(button("Close FAQs", "green-button faq-close", () => {
    overlay.remove();
    closeButton.classList.remove("hidden");
    faqButton.classList.remove("hidden");
  }));
  root.querySelector(".chart-overlay")?.append(overlay);
}

let analysisBlinkTimer = null;
function startAnalysisBlink() {
  if (analysisBlinkTimer) clearInterval(analysisBlinkTimer);
  let blink = false;
  analysisBlinkTimer = setInterval(() => {
    if (!root.querySelector(".analysis-table")) {
      clearInterval(analysisBlinkTimer);
      analysisBlinkTimer = null;
      return;
    }
    setBg(blink ? "analyze.jpg" : "analyze_blink.jpg");
    blink = !blink;
  }, blink ? 500 : 1000);
}

function resetGameState() {
  stopAllLoops();
  game.resetGame();
  Object.assign(game, {
    current_bg_img: "Evenagestand.jpg",
    achievement_queue: [],
    achievement_final_bg: null,
    event_return_bg: null,
    thin_lightly_event: false,
    prescribed_burn_event: false,
    pb_after_first_heavythin_shown: false,
    pb_after_heavythin_with_tl_shown: false,
    has_made_first_choice: false,
    hurricane_pending: false,
    wildfire_pending: false,
    wildfire_last_shown_year: null,
    hurricane_last_shown_year: null,
    certificate_saved: false
  });
}

function restartGame() {
  resetGameState();
  sounds.playForestSound();
  showGameScreen();
}

function restartGameToZoom() {
  resetGameState();
  sounds.playForestSound();
  showZoomFinalScreen();
}

showIntroScreen();
