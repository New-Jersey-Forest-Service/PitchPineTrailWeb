# Process Log

## Date

2026-06-18

## Repo Context

This repository is `PitchPineTrail`, a retro-style forest management game. The existing desktop version lives under `src/` and is implemented in Python with tkinter, pygame, Pillow, pandas, and matplotlib.

Important context files:

- `context/LocalAnaconda.md` documents this computer's preferred Python interpreter:
  `C:\Users\wzipse\AppData\Local\anaconda3\python.exe`
- `context/webplan.md` describes the intended static web port.

## Date

2026-08-20

## Summary

Added the Google Analytics (gtag.js) tag for property `G-GGW42FVZ05` immediately after the `<head>` opening tag in `index.html`, per Google's snippet placement instructions. This is a single-page static app, so only one file needed the tag.

## Files Changed

- `index.html`

## Commands / Tests Run

None; markup-only change, verified by inspection.

## Verification

Confirmed the tag is the first content inside `<head>` and appears only once in the file.

## Caveats / Next Steps

None.

- `src/game_logic.py` is the source of truth for simulation behavior.
- `src/gui.py` is the source of truth for screen flow, animations, sounds, overlays, analysis lab behavior, and certificate/export behavior.

Current git note: at the time this log was written, both `context/` and `web/` appeared as untracked directories in `git status --short`.

## User Request

The user asked to execute the web port plan from `context/webplan.md`, after first becoming familiar with the repo and local Anaconda guidance.

## Work Completed

Created the first static web-port implementation under `web/`.

Added:

- `web/index.html`
  - Static app shell with `#game-root`.
  - Loads `css/style.css`.
  - Loads Chart.js and html2canvas from CDN.
  - Loads `js/screens.js` as an ES module.

- `web/css/style.css`
  - Fullscreen desktop-oriented layout.
  - Retro Courier styling.
  - Palette matching `context/webplan.md` and `src/gui.py`.
  - Styles for metrics, action buttons, overlays, analysis lab, chart overlays, certificate overlay, and survey overlay.

- `web/js/game.js`
  - ES module port of `src/game_logic.py`.
  - Exports `ACTIONS` and `Game`.
  - Preserves current Python source details that are more specific than `webplan.md`, including:
    - recruitment scheduling,
    - achievement flags/history,
    - hurricane random offset within the decade,
    - non-losing wildfire handling inside `updateStand`,
    - catastrophic wildfire and SPB random event logic,
    - decadal data generation with `Start` row and off-decade event snapshots.

- `web/js/sounds.js`
  - Browser `Audio` wrappers for existing WAV files.
  - Supports looping ambient sounds and one-shot effects.

- `web/js/charts.js`
  - Analysis data table rendering.
  - Chart.js plot rendering for numeric and risk variables.
  - CSV export including actions and achievements.

- `web/js/screens.js`
  - Main browser screen router.
  - Intro and zoom flow.
  - Main game action flow.
  - Management animations.
  - Loss screens.
  - Achievement queue/screens.
  - Hurricane and non-losing wildfire screens.
  - Win screen with dynamic medal background filename.
  - Field guide, definitions, hints, exit survey overlay.
  - Certificate overlay using html2canvas.
  - Analysis lab screen with table, plots, CSV export, definitions navigation, and return flow.

No desktop Python files under `src/` were intentionally edited.

## Local Verification Performed

The machine did not have `node` on PATH, and browser automation packages were not installed:

- `node --check ...` failed because `node` was not recognized.
- Python checks showed Playwright, Selenium, js2py, quickjs, and dukpy were not installed.

Used the documented Anaconda interpreter:

```powershell
& 'C:\Users\wzipse\AppData\Local\anaconda3\python.exe' --version
```

This returned Python 3.13.9.

Started a repo-root static server:

```powershell
Start-Process -FilePath 'C:\Users\wzipse\AppData\Local\anaconda3\python.exe' -ArgumentList @('-m','http.server','8001') -WindowStyle Hidden
```

Verified these returned HTTP 200:

- `http://localhost:8001/web/`
- `http://localhost:8001/web/js/charts.js`
- `http://localhost:8001/src/assets/analyze.jpg`
- `http://localhost:8001/src/assets/Evenagestand.jpg`

Also ran a Python asset-reference check over `web/`; it reported:

```text
missing asset refs: 0
```

## Important Caveat

The web plan says the web app should reference shared assets via paths like `../src/assets/filename.jpg`. This works only when the repository root is served and the app is opened at `/web/`.

It does not work if the HTTP document root is the `web/` folder itself. For example, `python -m http.server --directory web` cannot serve `../src/assets/...`.

This has deployment implications:

- GitHub Pages configured with source folder `/web` will likely break shared asset paths.
- Safer options:
  - configure Pages/source so the repo root is served and users open `/PitchPineTrail/web/`,
  - duplicate/copy assets into `web/assets/`,
  - add a build/copy step,
  - or revise paths/deployment layout intentionally.

Downstream agents should resolve this deployment-path decision before polishing the web port.

## Recommended Next Steps

1. Open `http://localhost:8001/web/` in a browser and click through the app manually.
2. Check browser console for ES module/runtime errors.
3. Verify a complete 100-year game can be played.
4. Test high-risk flows:
   - low TPA loss,
   - catastrophic wildfire loss,
   - SPB loss,
   - hurricane screen,
   - non-losing wildfire screen,
   - all achievement popups,
   - win screen medal background selection,
   - analysis lab charts and CSV export,
   - certificate save.
5. Decide on GitHub Pages asset strategy.
6. Once browser-tested, consider adding a lightweight automated test harness for `web/js/game.js` parity against expected deterministic simulations.

## Known Limits Of Current Implementation

- Pixel-perfect tkinter parity has not been browser-verified yet.
- Runtime JavaScript has not been checked with Node or browser automation because the local tools were unavailable.
- CDN dependencies require network access in the browser:
  - Chart.js
  - html2canvas
- Browser audio autoplay behavior means sounds should begin only after user interaction; this was considered in the screen flow, but still needs manual browser testing.

## 2026-06-18 Update: Agent Instructions

Created root-level `AGENTS.md` with repo-specific operating instructions for downstream agents.

The instructions cover:

- required context files to read before editing,
- local Anaconda interpreter usage,
- web-port constraints,
- shared-asset/GitHub Pages caveat,
- local testing server workflow,
- requirement to ask the user before shutting down test servers at session end,
- requirement to append meaningful updates to `logs/processlog.md`,
- git/file safety guidance.

Files changed:

- `AGENTS.md`
- `logs/processlog.md`

## 2026-06-18 Update: GitHub Pages Site Instructions

Created `context/siteinstructions.md` with instructions for publishing the web port on GitHub Pages.

The instructions note a corrected deployment constraint from GitHub's current Pages documentation: branch-based publishing supports a selected branch root or `/docs`, not an arbitrary `/web` folder. Because the current web app references shared assets via `../src/assets/...`, the recommended current deployment is to publish from the repository root and open the game at `/PitchPineTrail/web/`.

Files changed:

- `context/siteinstructions.md`
- `logs/processlog.md`

Verification/context used:

- Official GitHub Pages docs for creating a Pages site.
- Official GitHub Pages docs for configuring a publishing source.

## 2026-06-18 Update: Local Test Server Started

Started a local repo-root HTTP server for testing the web game.

Command used:

```powershell
Start-Process -FilePath 'C:\Users\wzipse\AppData\Local\anaconda3\python.exe' -ArgumentList @('-m','http.server','8001') -WindowStyle Hidden
```

Working directory:

```text
C:\Users\wzipse\Documents\dev\projects\PitchPineTrail
```

Open the game at:

```text
http://localhost:8001/web/
```

Verification:

- `http://localhost:8001/web/` returned HTTP 200.

Server process:

- PID `29984`
- Command line: `"C:\Users\wzipse\AppData\Local\anaconda3\python.exe" -m http.server 8001`

Reminder: ask the user before shutting this server down at session end.

## 2026-06-18 Update: Local Test Server Stopped

Stopped the local repo-root HTTP server after the user asked to shut it down.

Stopped process:

- PID `29984`
- Port `8001`

Verification:

- `netstat -ano | Select-String ':8001'` returned no listeners.

## 2026-06-18 Update: User-Started 8001 Server Stopped

The user reported that their attempt to run the local server on port `8001` failed and asked to shut it down.

Stopped process:

- PID `24044`
- Command line observed before shutdown: `"C:\Users\wzipse\AppData\Local\anaconda3\python.exe" -m http.server 8001`

Verification:

- After stopping the process, `netstat -ano | Select-String ':8001'` showed no active listener.
- A temporary `TIME_WAIT` entry remained, which is expected after closing a TCP server.

## 2026-06-18 Update: Local Test Server Restarted

Started the repo-root HTTP server for web game testing after the user asked to start it again.

Command used:

```powershell
Start-Process -FilePath 'C:\Users\wzipse\AppData\Local\anaconda3\python.exe' -ArgumentList @('-m','http.server','8001') -WindowStyle Hidden
```

Working directory:

```text
C:\Users\wzipse\Documents\dev\projects\PitchPineTrail
```

Open the game at:

```text
http://localhost:8001/web/
```

Verification:

- `http://localhost:8001/web/` returned HTTP 200.

Server process:

- PID `24672`
- Command line: `"C:\Users\wzipse\AppData\Local\anaconda3\python.exe" -m http.server 8001`

Reminder: ask the user before shutting this server down at session end.

## 2026-07-22 Update: GitHub Pages Port Planning

- Summary: Documented a non-implementation migration plan for a self-contained GitHub Pages artifact and added task-plan guidance for agents.
- Files changed: `tasks/PagesPortPlan.md`, `AGENTS.md`, `logs/promptlog.md`, `logs/processlog.md`.
- Inspection run: `rg` found the web asset base in `web/js/screens.js` and `web/js/sounds.js` is currently `../src/assets/`; no Pages workflow or configuration files were present.
- Verification: The plan recommends a root `assets/` directory and a Pages Actions artifact containing both `assets/` and `web/`, preserving the relative `/web/` game URL.
- Caveat / next step: This session intentionally makes no implementation changes to asset locations, application code, or deployment settings. The pre-existing `AGENTS.md` prompt-log change was retained and expanded as requested.

## 2026-07-22 Update: Mirrored Agent Instruction Files

- Summary: Added the rule that `AGENTS.md` and `CLAUDE.md` must remain identical, and created `CLAUDE.md` as the matching copy.
- Files changed: `AGENTS.md`, `CLAUDE.md`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: Compared the two instruction files by content after creation; they match.
- Caveat / next step: Future edits to either instruction file must be applied to both in the same task.

## 2026-07-22 Update: Commit And Push Preparation

- Summary: Prepared the Pages-port plan, mirrored agent instructions, and required logs for commit on branch `WZport`.
- Files changed: `AGENTS.md`, `CLAUDE.md`, `tasks/PagesPortPlan.md`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: Confirmed `AGENTS.md` and `CLAUDE.md` are byte-identical; reviewed the staged scope before commit.
- Next step: Commit the listed files and push `WZport` to `origin`.

## 2026-07-22 Update: Web-Only Pages Plan Revision

- Summary: Revised `tasks/PagesPortPlan.md` after confirmation that this is a standalone web-project fork and does not need to preserve desktop functionality.
- Files changed: `tasks/PagesPortPlan.md`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: The revised plan makes `web/` a self-contained Pages deploy root with assets at `web/assets/`, a root site URL, and no production dependency on `src/`.
- Caveat / next step: This is a planning-only change; no assets, browser paths, desktop files, or deployment workflow were modified.

## 2026-07-22 Update: Pages Source And Artifact Layout Clarification

- Summary: Expanded `tasks/PagesPortPlan.md` to keep all site source under `web/`, publish its contents at the Pages artifact root, and keep repository operational files out of the deployment.
- Files changed: `tasks/PagesPortPlan.md`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: The plan now explicitly covers the root public URL, document-relative asset paths, `.github/workflows/pages.yml`, artifact structure, and the optional `/docs` branch-publishing alternative.
- Caveat / next step: This remains a planning-only change; no site files or GitHub Pages configuration were modified.

## 2026-08-18 Update: Preloaded Intro Zoom Frames

- Summary: Updated the intro zoom sequence to preload and decode all ten frames before beginning the timed background swaps, preventing progressive JPEG rendering over the navy root background.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Unified Hover Artwork Positioning

- Summary: Changed hover artwork placement to use the same root artwork transform as the zoom screen rather than rounded hotspot DOM offsets, aligning it across main play, guide, and analysis screens.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Analysis Data Download Artwork

- Summary: Replaced the Analysis Lab Save Data button with hoverable `downloaddata` artwork at `2668,1937`. Clicking exports CSV data and displays `floppy.png` at `3300,1420` with `358 x 157` artwork-scaled dimensions for five seconds.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Suppressed Current Guide Hover Artwork

- Summary: Removed the self-referential hover artwork from each Definitions and Field Guide screen's own return region, including their Analysis Lab variants. Opposite-guide toggle regions retain hover artwork.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Hover Artwork For Navigation Regions

- Summary: Added responsive hover artwork for all hint, glossary, and field-guide click regions across zoom, gameplay, guide, and analysis screens. Hover artwork is removed on mouse leave, focus loss, or screen navigation.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Conditional Coloring Page Download

- Summary: Added a hoverable coloring-page download image to winning and losing screens. It builds a combined PDF containing the standard page, the good-ending page when applicable, and available pages for earned achievements.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Caveat: `turkeybeard_coloringpage.pdf` is not present in `assets`, so Turkeybeard is not currently included in the download.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Removed Analysis Guide Graph Buttons

- Summary: Kept bookshelf medals and summaries on the Analysis Definitions and Analysis Field Guide screens while suppressing graph controls there. The main Analysis Lab retains graph controls.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: Pending focused JavaScript diagnostics.

## 2026-08-19 Update: Analysis Guide Screen Overlays

- Summary: Reused the Analysis Lab bookshelf medals, management summary, achievement summary, and graph controls on both Analysis Definitions and Analysis Field Guide screens.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Analysis Field Guide Navigation

- Summary: Added `analyze_fieldguide.jpg` as an Analysis Lab guide screen. The Analysis Lab now has artwork-scaled glossary and field-guide hotspots, and the two guide screens can toggle between each other or return to the lab through their matching source regions.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Event And Achievement Navigation

- Summary: Added the shared Exit and Restart controls to achievement, hurricane, and non-losing wildfire screens, with a navigation layer above their temporary screen content.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Bookshelf Medals On Guide Screens

- Summary: Rendered the persistent bookshelf medal grid on the Definitions and Field Guide screens above their transparent artwork overlays.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Bookshelf Medal Hover Labels

- Summary: Added hover and keyboard-focus labels to each earned bookshelf medal, using the requested achievement names and brown `8px` text on a tan background.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.
- Caveat / next step: Browser playback should be manually checked to confirm the decoded frame transitions look smooth at the 300 ms interval.

## 2026-08-18 Update: Decode All Background Images Before Swap

- Summary: Centralized background image loading in `setBg` so every background is loaded and decoded off-screen before being applied, preserving the current image while a replacement loads.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.
- Caveat / next step: Browser playback should be checked across intro, management, achievement, event, loss, and analysis screens.

## 2026-08-18 Update: Start Forest Sound On Intro Screen

- Summary: Moved the forest ambience start from the Begin button handler to `showIntroScreen()`, so `forest_sound.wav` begins when the intro screen appears and continues into the zoom sequence.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.
- Caveat / next step: Browser audio playback still depends on the browser's autoplay policy.

## 2026-08-18 Update: Pine Snake Ending Medal Overlay

- Summary: Added `pinesnake_medal_end.png` as a transparent overlay on the closing screen when the player has earned the pine-snake achievement.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.
- Caveat / next step: The overlay position and size may be adjusted in `.pinesnake-medal-end` after visual browser testing.

## 2026-08-18 Update: QMD Ending Backgrounds And Achievement Overlays

- Summary: Refactored the closing screen to choose only `bad_nomedal.jpg`, `okay_nomedal.jpg`, or `good_nomedal.jpg` from QMD, then layer all earned achievement medal PNGs over that background.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Achievement overlays: `pinesnake_medal_end.png`, `gentian_medal_end.png`, `tanager_medal_end.png`, `treefrog_medal_end.png`, `bunting_medal_end.png`, `turkeybeard_medal_end.png`, and `shortleaf_medal_end.png`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css` after the refactor and cleanup.
- Caveat / next step: Browser visual testing should confirm that the shared overlay placement matches the artwork dimensions.

## 2026-08-18 Update: Ordered Ending Medal Grid

- Summary: Ordered earned ending medals using `game.achievements_history` and placed them in an eight-slot 3-3-2 grid: three rows in each of the first two columns and two rows in the third.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.
- Caveat / next step: Browser visual testing may be needed to tune slot coordinates and medal size for the target viewport.

## 2026-08-18 Update: Enlarged And Raised Medal Grid

- Summary: Increased ending medal overlays from a 240px maximum width to 300px and moved all medal grid rows upward while preserving the 3-3-2 layout.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.
- Caveat / next step: Final spacing should be visually checked at the target browser viewport.

## 2026-08-18 Update: Increased Medal Size Again

- Summary: Increased the ending medal overlay width from a 300px maximum to 360px while preserving the current grid positions.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.

## 2026-08-18 Update: Repositioned Let's Play Button

- Summary: Added positioning for the post-zoom `.intro-buttons-second` container at 70% from the left and 80% from the top.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.

## 2026-08-18 Update: Removed Zoom Definitions Button

- Summary: Removed the `Click for Definitions` button from the final zoom frame, leaving only the `Let's Play!` button on the `zoom_10.jpg` screen.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Responsive Zoom Definitions Hotspot

- Summary: Added a hover-only definitions popup over the measured `zoom_10.jpg` artwork region (`x=714..1440`, `y=142..446`) using the image's `5515 x 2700` dimensions.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: The hotspot accounts for `background-size: contain`, centered image offsets, browser resizing, and removes its resize listener when leaving the zoom screen.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.
- Caveat / next step: Browser visual testing should confirm the hotspot aligns with the intended artwork location at the target viewport.

## 2026-08-18 Update: Removed Game Root Minimum Dimensions

- Summary: Removed the `1024px` minimum width and `600px` minimum height from `#game-root` so its dimensions follow the actual browser viewport.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.
- Caveat / next step: Narrow viewport testing may reveal other fixed-width panels that need separate responsive rules.

## 2026-08-18 Update: Repositioned Definitions Popup

- Summary: Centered the zoom definitions popup over its image-scaled hotspot and moved it below the hotspot instead of above and left-aligned.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.

## 2026-08-18 Update: Right-Aligned Definitions Popup

- Summary: Positioned the zoom definitions popup 10px to the right of the hover area, vertically centered it against the hotspot, and centered its text.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.

## 2026-08-18 Update: Added Field Guide Zoom Hotspot

- Summary: Added a second image-scaled hover popup at `x=1252`, `y=299`, using the same `304 x 426` source-region size as the definitions hotspot.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Both zoom hotspots share contain scaling, centered offsets, resize handling, hover/focus behavior, and cleanup.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Added Hint Zoom Hotspot

- Summary: Added a third zoom hotspot at image coordinates `x=79`, `y=226` with source dimensions `250 x 237`, displaying the hint message before gameplay begins.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Artwork-Pixel UI Layout Conversion

- Summary: Added a shared `5515 x 2700` artwork coordinate transform using the current `cover` or `contain` presentation, centered crop/letterbox offsets, and resize updates.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Converted layout surfaces: metrics, action controls, intro controls, navigation, hint/survey overlays, summary, ending medals, event/loss/achievement content, analysis controls, chart overlay, certificate, and loading note.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`; a CSS variable search confirmed all new layout variables are assigned by `updatePixelLayout()`.
- Caveat / next step: The source coordinates preserve the prior percentage-based arrangement as a first pass; visual browser testing may still warrant tuning individual artwork anchors.

## 2026-08-18 Update: Preserve UI During Turn Animations

- Summary: Changed `startAnimation()` to render the updated game screen before swapping animation backgrounds, removing the `clearScreen(during)` call that deleted buttons and text overlays.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.
- Caveat / next step: Browser testing should confirm the controls remain visually readable over each animation frame.

## 2026-08-18 Update: Restore Background After Temporary Screens

- Summary: Fixed achievement, hurricane, and wildfire Continue flows so temporary background images no longer become the main play screen background.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Achievement queues restore and clear `achievement_final_bg`; event screens save, restore, and clear `event_return_bg`; restart resets both fields.
- Verification: `get_errors` reported no errors in `js/screens.js`; control-flow review confirmed all restoration paths.

## 2026-08-18 Update: Reduced Responsive Ending Medal Size

- Summary: Reduced the ending medal width from `1435` to `950` artwork pixels while retaining the shared responsive artwork-scale calculation.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Preserve UI During Hurricane Animation

- Summary: Changed the hurricane screen to render the current game UI before cycling hurricane backgrounds instead of clearing the root first.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.
- Caveat / next step: Browser playback should confirm the controls remain readable over the hurricane artwork at the target viewport.

## 2026-08-18 Update: Replaced Main Definitions Button With Glossary Hotspot

- Summary: Removed the main play screen Definitions button and replaced it with a clickable artwork-scaled hotspot at the established definitions region.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Hover/focus shows `Don't know what a term means? Click here for the Glossary!`; clicking opens the existing definitions screen and returning rebuilds the hotspot.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Replaced Main Field Guide Button With Hotspot

- Summary: Removed the main play screen Field Guide button and replaced it with a clickable artwork-scaled hotspot at the existing zoom field-guide region (`x=299`, `y=1252`, `304 x 426`).
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Hover/focus shows field-guide guidance; clicking opens the existing field guide screen. Definitions and field-guide hotspot cleanup now run together.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Restore Background From Guide Screens

- Summary: Updated the Field Guide and Definitions Return buttons to restore the gameplay background captured before each temporary guide screen was opened.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Replaced Guide Return Buttons With Hotspots

- Summary: Replaced the visible Definitions and Field Guide Return buttons with responsive clickable hotspots at their established artwork regions.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Definitions returns from `x=142`, `y=714`; Field Guide returns from `x=299`, `y=1252`; both use `304 x 426` regions and restore the captured gameplay background.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Replaced Analysis Definitions Buttons With Hotspots

- Summary: Replaced the Analysis Lab Definitions button and the Analysis Definitions Return button with responsive artwork-scaled hover/click hotspots.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Both use the analysis definitions artwork region at `x=276`, `y=2592`, preserve `prevBg` and `returnTarget`, and clean up their resize listeners on screen changes.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Matched Analysis Glossary Region

- Summary: Changed the Analysis Lab glossary hotspot and its Return hotspot to exactly match the main play Definitions region: `x=142`, `y=714`, `304 x 426`.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Removed Analysis Glossary Hover Text

- Summary: Removed popup text from the Analysis Lab glossary and Return hotspots while preserving their clickable regions, keyboard focus, and navigation.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Restored Analysis Glossary Hover Text

- Summary: Restored the glossary popup on the Analysis Lab glossary hotspot while keeping the Analysis Definitions return hotspot text-free.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Replaced Hint Button With Hotspot

- Summary: Removed the main Hint button and moved its behavior to the artwork-defined hint region at `x=79`, `y=226`, `250 x 237`.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Hover/focus shows `Stuck? Click for a hint!`; clicking opens the next hint image, positioned directly to the right of the hotspot and constrained to the visible screen width.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Adjusted Hint Image Size And Offset

- Summary: Reduced the hint overlay maximum from `2640` to `2200` artwork pixels and moved it 20px to the right of the hint hotspot.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Scoped Main Exit Button Text Size

- Summary: Added the `main-exit-button` class to the main play Exit button and set its font size independently at `16px`.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Added Guide Screen Close Sound

- Summary: Connected `sounds.playPageCloseSound()` to the Field Guide return hotspot and Analysis Definitions return hotspot.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Closing either screen plays `page_close.wav`; opening them continues to use the existing page-turn sound.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Independent Survey Button Positioning

- Summary: Added dedicated classes and independent relative-position rules for the Open Feedback, Exit, and Cancel survey buttons.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Artwork-Pixel Survey Button Positions

- Summary: Converted the three survey action buttons to independent responsive artwork-pixel anchors instead of relative offsets within the shared action row.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Current anchors: Open Feedback `1000,500`; Exit `4420,2376`; Cancel `4930,2376`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Responsive Survey Button Text

- Summary: Added responsive `clamp()` font sizing to all three independently positioned survey buttons.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css`.

## 2026-08-18 Update: Survey Exit Tab Close Request

- Summary: Added `window.close()` to the survey Exit action while retaining the existing screen-clearing fallback.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.
- Caveat: Browsers generally block scripts from closing tabs that were opened directly by the user.

## 2026-08-18 Update: Added Main Screen Restart Button

- Summary: Added a navy Restart button beside Exit on the main play screen.
- Behavior: Restart resets the game state and audio, then returns directly to `zoom_10.jpg` with its existing hotspots and `Let's Play!` button.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Hurricane Screen Shows Only Continue

- Summary: Removed the normal game action UI from the hurricane animation screen; the event now shows only the hurricane sequence and its final Continue button.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Independent Closing Button Positions

- Summary: Split the four ending-screen buttons from the shared `closing-actions` flex position into independent artwork-pixel anchors.
- Buttons: Analyze `3750,2200`; Certificate `4400,2200`; Restart `4800,2200`; Exit `5200,2200`.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Achievement Action Anchor

- Summary: Added a dedicated artwork-pixel anchor for achievement actions at `4800,800`.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Restored Closing Action Positioning Context

- Summary: Replaced `.closing-actions { display: contents; }` with a real static block so the four absolute-positioned ending buttons resolve against the game root.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css` or `js/screens.js`.

## 2026-08-18 Update: Explicit Closing Button Layer

- Summary: Made `.closing-actions` a full-screen positioned layer aligned to `#game-root`, with pointer events enabled only on the four independently positioned buttons.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `css/style.css` or `js/screens.js`.

## 2026-08-18 Update: Root-Aligned Achievement Continue Button

- Summary: Applied the full-screen positioning-layer fix to achievement actions so the Continue button uses its artwork-pixel anchor rather than an upper-left fallback.
- Files changed: `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Anchor: `point("achievement-actions", 4800, 800)` in `js/screens.js`.
- Verification: `get_errors` reported no errors in `css/style.css` or `js/screens.js`.

## 2026-08-18 Update: Fixed BA Analysis Table Width

- Summary: Set the BA column in `renderDataTable()` to a consistent 10-character width.
- Files changed: `js/charts.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/charts.js`.

## 2026-08-18 Update: Unified Hurricane Continue Behavior

- Summary: Changed the hurricane screen to keep one Continue button throughout the animation and after the event message appears, matching achievement screens.
- Behavior: Continue uses one handler, cancels the animation timer when pressed early, stops the hurricane sound, restores the gameplay background, and returns to gameplay.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Unified Closing And Loss Buttons

- Summary: Changed loss-screen actions to reuse the winning-screen closing action layer and shared Analyze, Restart, and Exit button classes.
- Behavior: Matching buttons on winning and loss screens now use the same artwork-pixel positions and CSS rules.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-18 Update: Early Hurricane Continue Control

- Summary: Made the hurricane Continue button visible and clickable immediately when the animation starts.
- Behavior: Early Continue cancels the pending animation timer, stops the hurricane sound, restores the gameplay background, and returns to the main game screen.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Keep Metrics Over Hurricane Animation

- Summary: Rendered the metrics panel on the hurricane animation screen while keeping normal action buttons and navigation hidden.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-18 Update: Looping Tree Frog Achievement Animation

- Summary: Added an indefinite tree-frog achievement animation alternating `treefrog.jpg` and `treefrog_1.jpg`.
- Timing: The initial/return `treefrog.jpg` frame displays for 2200ms; `treefrog_1.jpg` displays for 700ms.
- Behavior: Achievement metrics, message, and Continue remain visible; Continue cancels the timer and advances the queue.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-07-22 Update: Commit And Push Preparation (Plan Clarification)

- Summary: Prepared the latest GitHub Pages plan clarification and its required logs for commit on branch `WZport`.
- Files changed: `tasks/PagesPortPlan.md`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: Ran `git diff --check`; the plan explicitly preserves `web/` as the site source directory while publishing its contents at the Pages artifact root.
- Next step: Commit the listed files and push `WZport` to `origin`.

## 2026-07-22 Update: Pages Port Implementation Branch

- Summary: Created and switched to `WZPagesPortPlan` from `WZport` at commit `17a31fc` to implement the GitHub Pages port plan.
- Files changed: `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `git branch --show-current` returned `WZPagesPortPlan`; the branch started with a clean working tree.
- Next step: Implement the web-only Pages layout on this branch.

## 2026-07-22 Update: Pages Port Branch Publication Preparation

- Summary: Prepared `WZPagesPortPlan` for its initial push to `origin`.
- Files changed: `logs/promptlog.md`, `logs/processlog.md`.
- Verification: Confirmed the current branch is `WZPagesPortPlan` and `origin` is configured for `New-Jersey-Forest-Service/PitchPineTrailWeb`.
- Next step: Commit the branch handoff logs and push the branch with upstream tracking.

## 2026-07-22 Update: GitHub Pages Port Implemented

- Summary: Converted the standalone web fork into a self-contained GitHub Pages site under `web/`.
- Files changed: moved `src/assets/` to `web/assets/`; updated `web/js/screens.js` and `web/js/sounds.js`; added `.github/workflows/pages.yml`; rewrote `README.md`, `context/webplan.md`, and `context/siteinstructions.md`; updated synchronized `AGENTS.md` and `CLAUDE.md`; removed desktop-only `src/`, `requirements.txt`, `ppt.bat`, and `context/LocalAnaconda.md`; moved `tasks/PagesPortPlan.md` to `tasks/implemented/`.
- Commands and tests: served `web/` with `C:\Users\n2ubx\anaconda3\python.exe -m http.server 8001 --directory web` (PID `23796`); verified the site root and representative files returned HTTP 200; verified all 483 assets returned HTTP 200; verified 76 direct browser asset references exist; confirmed AGENTS and CLAUDE are byte-identical.
- Verification result: browser assets are now served from `web/assets/`, with no active browser source using `../src/assets/`.
- Caveat / next step: the local test server remains running on port 8001. Configure GitHub Pages to use GitHub Actions, then merge or push the desired deployment branch to `main` to trigger the workflow. The in-app browser could not reach the local host despite the host-level HTTP checks succeeding.

## 2026-07-22 Update: Local Pages Test Server Stopped

- Summary: Stopped the local static server after the user confirmed their manual test succeeded and asked for shutdown.
- Files changed: `logs/promptlog.md`, `logs/processlog.md`.
- Server stopped: PID `23796`, command `C:\Users\n2ubx\anaconda3\python.exe -m http.server 8001 --directory web`.
- Verification: Process no longer exists and `netstat` found no listener on port `8001`.
- Next step: No local test server remains running.

## 2026-07-22 Update: Pages Port Commit And Push Preparation

- Summary: Prepared the completed web-only Pages migration for commit and push on `WZPagesPortPlan`.
- Files changed: all completed migration files plus `logs/promptlog.md` and `logs/processlog.md`.
- Verification: Local site, assets, workflow structure, and mirrored agent instructions were verified before staging; no local test server remains running.
- Next step: Commit the migration and push `WZPagesPortPlan` to `origin`.

## 2026-07-22 Update: Pull Request Preparation

- Summary: Preparing a pull request from `WZPagesPortPlan` into the repository's root/default branch, `main`.
- Files changed: `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `WZPagesPortPlan` is synchronized with `origin` at `a30a4e4`; local branches confirm `main` is the repository root branch.
- Next step: Commit these handoff logs, push the branch, then create a draft pull request targeting `main`.

## 2026-07-22 Update: Pull Request Handoff

- Summary: The user will create the pull request from `WZPagesPortPlan` into `main` directly.
- Files changed: `logs/promptlog.md`, `logs/processlog.md`.
- Verification: The Pages migration commit `a30a4e4` is already pushed to `origin/WZPagesPortPlan`.
- Caveat / next step: GitHub CLI is not installed locally, so no pull request was created in this session. The two log files contain uncommitted handoff notes.

## 2026-08-13 Update: Root-Level GitHub Pages Layout

- Summary: Moved the static browser app from `web/` to the repository root so the site entry point is root `index.html`.
- Files changed: moved `web/index.html` to `index.html`; moved `web/assets/`, `web/css/`, and `web/js/` to root `assets/`, `css/`, and `js/`; updated `.github/workflows/pages.yml`, `README.md`, `context/webplan.md`, `context/siteinstructions.md`, synchronized `AGENTS.md` and `CLAUDE.md`, `logs/promptlog.md`, and `logs/processlog.md`.
- Commands and tests: inspected Pages workflow, application references, and repository layout; confirmed the browser entry point uses document-relative `css/` and `js/` paths before moving files.
- Verification result: the Pages workflow now uploads `.` and root `index.html` references `css/style.css` and `js/screens.js`, which resolve correctly from the repository root.
- Caveat / next step: run the root-level local server and confirm the GitHub Actions deployment after pushing the changes.

## 2026-08-13 Update: Root-Level Local Smoke Test

- Summary: Started and tested the re-rooted static site.
- Files changed: `logs/processlog.md`.
- Command: `C:\Users\n2ubx\anaconda3\python.exe -m http.server 8001` from the repository root (PID `27404`).
- Verification: HTTP 200 responses for `/`, `/css/style.css`, `/js/screens.js`, and `/assets/introscreen.jpg` at `http://localhost:8001/`.
- Caveat / next step: The tool-run temporary server is no longer active after the smoke test. Push the changes and confirm the GitHub Actions Pages deployment.

## 2026-08-13 Update: Root-Level Pages Migration Committed

- Summary: Committed the requested root-level GitHub Pages migration on `WZport`.
- Files changed: root-level application files and assets, Pages workflow, documentation, synchronized agent instructions, and required logs.
- Commands and tests: staged only the migration scope; ran `git diff --cached --check`; created commit `4235811` (`Move GitHub Pages site to repository root`).
- Verification: Git identified the application files and 484 assets as renames from `web/` to the repository root.
- Caveat / next step: Push `WZport` to `origin`, then verify the GitHub Pages Actions deployment.

## 2026-08-19 Update: Transparent Glossary Overlay

- Summary: Changed the glossary screen so `definitions.png` is rendered as a transparent foreground image over the active gameplay background instead of replacing it.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Matched Glossary Overlay Bounds

- Summary: Bound `definitions.png` to the same calculated cover rectangle and centered crop offsets used by the root background.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Glossary Metrics Overlay

- Summary: Rendered the game metrics on the glossary screen and layered the metrics panel above the transparent definitions artwork.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Transparent Field Guide Overlay

- Summary: Applied the glossary presentation pattern to the field guide: it now overlays `fieldguide.png` over the current background at the exact cover bounds and shows metrics above the artwork.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: Cross-Linked Guide Hotspots

- Summary: Added the existing glossary hotspot to the field-guide screen and the existing field-guide hotspot to the glossary screen. Each screen retains its own Return hotspot.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Adaptive Certificate Name Text

- Summary: Added input-driven certificate name sizing that begins at the responsive CSS font size and reduces in half-pixel steps only when the entered name exceeds the input width, down to a 12px minimum.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Certificate PDF Export

- Summary: Replaced certificate JPG export with a `pdf-lib` export based on `certificate_blank.pdf`. Save temporarily hides the certificate overlay and all buttons, captures the gameplay screen, restores the UI, then embeds the image at the requested `3300 x 1638` pixel (300 DPI) layout bounds and adds a maximum-fit certificate name.
- Files changed: `index.html`, `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Behavior: Downloads are named `PitchPineTrailCertificate_<entered name>.pdf`; Windows-invalid filename characters are replaced with `_`.
- Verification: `get_errors` reported no errors in `index.html` or `js/screens.js`.

## 2026-08-19 Update: Centered Certificate PDF Name

- Summary: Updated the PDF certificate name placement to center at `2066,430`, with Courier Bold as the PDF-safe Courier New equivalent and `#004B1C` text color.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Independent Certificate Save Button

- Summary: Moved the certificate Save button out of the certificate overlay and into the game root, with its own responsive artwork-pixel position at `4128,314`.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-19 Update: One Certificate Per Run

- Summary: Added a per-run certificate export flag. After a successful PDF download, the Save button remains removed; reopening the certificate does not recreate it. Restarting the game resets the allowance.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: GUI-Consistent Event Messages

- Summary: Updated browser achievement, hurricane, non-losing wildfire, and loss-screen messages from `src/gui_event_messages.txt`, preserving the source paragraph breaks.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Hurricane Message During Animation

- Summary: Rendered the hurricane message before starting the lightning-and-rain background sequence, so it remains visible throughout the animation.
- Files changed: `js/screens.js`, `logs/promptlog.md`, `logs/processlog.md`.
- Verification: `get_errors` reported no errors in `js/screens.js`.

## 2026-08-19 Update: Persistent Bookshelf Medal Grid

- Summary: Added an achievement-ordered three-by-three bookshelf medal grid to gameplay, achievement, hurricane, wildfire, and loss screens. The grid is omitted from the winning screen.
- Files changed: `js/screens.js`, `css/style.css`, `logs/promptlog.md`, `logs/processlog.md`.
- Layout: Artwork-scaled slots use `bookshelf-medal-slot-1` through `bookshelf-medal-slot-9`, beginning at `75,2000`; medals are `150 x 200` artwork pixels.
- Verification: `get_errors` reported no errors in `js/screens.js` or `css/style.css`.

## 2026-08-21 Update: Jersey Devil Achievement Fix

- Summary: Restored the missing tail of `js/game.js` after an accidental truncated edit and kept the Jersey Devil as a no-medal achievement entry in the normal achievement queue. It is now tracked in `achievements_history` and shown in the achievement flow without appearing in the medal grids.
- Files changed: `js/game.js`, `js/screens.js`, `logs/processlog.md`.
- Commands / tests run: `get_errors` on both JavaScript files.
- Verification: `get_errors` reports no syntax errors in `js/game.js` or `js/screens.js`.
- Caveat / next step: If you want the Jersey Devil to appear in a different ordering or a custom text label in the achievement list, I can adjust the naming there without adding a medal asset.
