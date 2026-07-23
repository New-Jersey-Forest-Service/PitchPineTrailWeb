# GitHub Pages Port Plan

## Goal

Make the browser version independently deployable to GitHub Pages without changing the desktop game's behavior or keeping production asset references that point outside the published site.

## Current State And Deployment Problem

- The browser application is under `web/`.
- Desktop assets are under `src/assets/`.
- `web/js/screens.js` and `web/js/sounds.js` each use `../src/assets/` as their asset base.
- That path works only when the repository root is served locally and the browser opens `/web/`.
- A Pages deployment whose published directory is `web/` cannot serve `src/assets/`, so images and audio would fail to load.
- There is no Pages configuration or deployment workflow in the repository at present.

## Recommended Target Layout

Adopt a repository-level canonical asset directory and deploy the web app plus that directory as one Pages artifact:

```text
PitchPineTrailWeb/
├── assets/                 # Canonical shared images, audio, and fonts
├── src/                    # Desktop Python application
├── web/                    # Static browser application
│   ├── index.html
│   ├── css/
│   └── js/
├── tasks/
│   └── implemented/
└── .github/workflows/      # GitHub Pages deployment workflow
```

The Pages artifact should retain both top-level directories:

```text
published-site/
├── assets/
└── web/
    └── index.html
```

The public game URL will then be the project-site URL plus `/web/`, and the browser can use the portable relative asset base `../assets/`. This works in both the published artifact and a repository-root local server.

## Implementation Steps

1. Inventory all asset consumers before moving anything.
   - Search Python, JavaScript, HTML, CSS, documentation, and workflow files for `src/assets`, `assets/`, and individual asset names.
   - Record case-sensitive filenames because GitHub Pages runs on Linux and will not tolerate Windows-only case mismatches.

2. Create the canonical `assets/` directory at the repository root and move the full contents of `src/assets/` into it in one deliberate change.
   - Preserve filenames and binary formats exactly.
   - Do not duplicate the collection: one canonical copy avoids drift and keeps deployed content deterministic.

3. Update desktop asset resolution without changing desktop behavior.
   - Replace references in `src/gui.py`, `src/main.py`, and any other Python consumers so they resolve the repository-level `assets/` directory from the source file location, not from the current working directory.
   - Run the desktop app or its applicable smoke checks to confirm images, audio, animations, certificates, and overlays still locate their assets.

4. Update browser asset resolution.
   - Change the shared JavaScript asset base in `web/js/screens.js` and `web/js/sounds.js` from `../src/assets/` to `../assets/`.
   - Search for any direct asset URLs outside those helpers and update them to the same layout.
   - Keep relative URLs; do not hard-code a repository name or GitHub Pages base URL, so forks and local hosting continue to work.

5. Add a GitHub Pages Actions deployment workflow.
   - Trigger on pushes to the chosen publishing branch and optionally on manual dispatch.
   - Check out the repository, create a clean staging directory, and copy only `web/` and `assets/` into it without transforming application code.
   - Upload that staging directory with the official GitHub Pages artifact action and deploy it with the official Pages deployment action.
   - Add a `.nojekyll` file to the staged site (or artifact root) so Pages treats the static files as-is.
   - Configure repository Settings → Pages to use **GitHub Actions** as its source.

6. Make the intended URLs explicit.
   - Production: `https://<organization>.github.io/<repository>/web/`.
   - Local verification: serve the repository root and open `http://localhost:8001/web/`.
   - Optional future enhancement: publish the game at the site root only if the project deliberately moves `web/` contents to the artifact root; do not make that structural change implicitly.

7. Verify before enabling production publishing.
   - Use browser developer tools to confirm there are no 404s for JPG, WAV, JavaScript, CSS, Chart.js, or html2canvas.
   - Exercise intro, zoom, each management action, achievements, random events, loss conditions, analysis charts, CSV export, certificate save, and win screens.
   - Validate the deployed Pages URL, not only the local server.
   - Confirm the workflow artifact contains `web/index.html` and `assets/` at the expected relative locations.

8. Update documentation after the deployment works.
   - Add the live Pages URL, local test command, and asset-layout explanation to `README.md`.
   - Update `context/webplan.md` so it no longer recommends `../src/assets/` or the unsupported `/web` branch-folder Pages configuration.

## AGENTS.md Changes To Make During Implementation

The current agent guidance correctly flags the asset-path caveat. After this plan is implemented, update it to state:

- `assets/` is the canonical shared asset directory for both desktop and browser versions.
- The browser app must reference assets with paths valid from `web/` inside the Pages artifact (currently `../assets/`).
- GitHub Pages is deployed through the repository workflow and the deployed game lives at `/web/` unless a future approved migration changes the public root.
- Local testing continues to serve the repository root at `http://localhost:8001/web/`.

Do not remove the rule requiring browser behavior to remain aligned with `src/game_logic.py` and `src/gui.py`.

## Completion Criteria

- One canonical asset copy exists and both applications resolve it successfully.
- The hosted artifact is self-contained and does not rely on unpublished repository paths.
- The deployed game loads all local assets without 404 errors.
- Desktop behavior remains intact.
- README, `context/webplan.md`, and `AGENTS.md` accurately describe the final structure and deployment process.
