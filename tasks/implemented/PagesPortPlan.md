# GitHub Pages Port Plan

## Goal

Turn this repository into a self-contained static web project that GitHub Pages can publish directly. This repository is a separate web-project fork, so it does not need to retain a working desktop Python application or shared desktop/web asset paths.

## Current Deployment Problem

- The browser application is under `web/`, while its images and audio are in `src/assets/`.
- `web/js/screens.js` and `web/js/sounds.js` use `../src/assets/`.
- Those URLs work only when the repository root is served locally and the game is opened at `/web/`.
- They fail if `web/` is published as the Pages site, because `src/assets/` is outside the deployed directory.

## Recommended Target Layout

Make `web/` the complete, deployable website. It should contain all browser-delivered code and assets:

```text
PitchPineTrailWeb/
├── .github/
│   └── workflows/
│       └── pages.yml             # Repository-level deployment configuration
├── web/                         # Entire GitHub Pages site / deploy artifact
│   ├── index.html
│   ├── assets/                  # Images, audio, and fonts used by the game
│   ├── css/
│   └── js/
├── tasks/
│   └── implemented/
├── AGENTS.md
└── CLAUDE.md
```

Do not move `web/index.html`, `web/css/`, `web/js/`, or `web/assets/` into the repository root. Keeping the application boundary at `web/` prevents task plans, logs, agent instructions, and other repository files from becoming part of the published site. The Pages workflow under `.github/workflows/` is the only web-deployment file that belongs outside `web/`.

The workflow will upload the **contents** of `web/` as the Pages artifact. Therefore, `web/index.html` becomes the artifact's top-level `index.html`; the source-directory name does not appear in the public URL. The game will be available at:

```text
https://<organization>.github.io/<repository>/
```

Browser code should use document-relative paths such as `assets/introscreen.jpg`, `css/style.css`, and `js/screens.js`. Do not use site-root paths such as `/assets/introscreen.jpg`, because a leading slash omits the repository-name portion of a GitHub Pages project-site URL. Relative paths avoid hard-coded organization/repository names and work in GitHub Pages, forks, and a local server whose document root is `web/`.

## Publishing Decision

Use a GitHub Actions Pages workflow with `web/` as the artifact path. This preserves a clear source/deployment boundary without introducing a build step: the directory is uploaded unchanged.

GitHub's branch-based Pages publishing supports only a branch root or `/docs`, not an arbitrary `/web` directory. If the project later decides to avoid a custom workflow, the acceptable fallback is to rename `web/` to `docs/` and publish `/docs` from the selected branch. Moving the application into the repository root is not recommended because this repository also contains non-site operational files.

## Implementation Steps

1. Inventory web dependencies.
   - Search the browser files for `src/assets`, `../`, direct asset names, and case-sensitive filename mismatches.
   - Keep a list of every JPG, WAV, and font needed by the browser application.

2. Move browser assets into `web/assets/`.
   - Move the contents of `src/assets/` into `web/assets/`, preserving names and binary files exactly.
   - Update `web/js/screens.js`, `web/js/sounds.js`, and any direct asset URLs to use `assets/<filename>`.
   - Confirm all filename capitalization matches the actual files; Pages runs on Linux.

3. Remove desktop-only material after web verification.
   - Once the browser app loads all assets from `web/assets/`, remove `src/`, Python dependency files, and other desktop-only artifacts that have no purpose in this standalone web repository.
   - Retain the existing JavaScript port as the browser implementation; do not retain Python only to support the web deployment.
   - If desktop-source history is useful, rely on the original desktop repository or Git history rather than maintaining a duplicate here.

4. Publish `web/` with GitHub Pages Actions.
   - Add `.github/workflows/pages.yml` using the official GitHub Pages artifact and deployment actions.
   - Configure the artifact upload path as `web/`; do not copy or stage the site elsewhere.
   - Confirm the uploaded artifact has `index.html`, `assets/`, `css/`, and `js/` at its top level, with no enclosing `web/` directory in the artifact.
   - Add `.nojekyll` to the published site if needed.
   - Configure repository Settings → Pages to use **GitHub Actions** as the source.
   - Do not add a frontend framework, backend, or browser build step; the deployment should publish the static `web/` directory unchanged.

5. Simplify local testing.
   - Serve `web/` as the document root and open `http://localhost:8001/`.
   - Update any local-server instructions that currently require serving the repository root or opening `/web/`.

6. Verify the published app.
   - Confirm no browser network requests return 404 for local images, audio, JavaScript, CSS, Chart.js, or html2canvas.
   - Exercise the intro, zoom, management actions, achievements, random events, loss states, analysis charts, CSV export, certificate workflow, and win screens.
   - Validate the deployed Pages URL, not only the local server.

7. Update project guidance after the migration works.
   - Update `README.md` with the live Pages URL, web-only project structure, and local test command.
   - Replace the outdated desktop-port assumptions in `context/webplan.md`.
   - Update both `AGENTS.md` and `CLAUDE.md` together: remove the desktop-source-of-truth and Python instructions, identify `web/` as the complete application and Pages deploy root, identify `web/assets/` as the asset directory, and set local testing to `http://localhost:8001/`.

## Completion Criteria

- `web/` contains every file required to run the game in a browser.
- Website source files remain under `web/`; only the Pages workflow and repository-level metadata live outside it.
- No deployed browser URL reaches into `src/` or another unpublished directory.
- The Pages artifact contains `index.html` at its top level and serves the game from the project-site root without `/web/` in the public URL.
- Browser asset paths remain valid under the GitHub Pages project-site repository prefix.
- Desktop-only code and dependencies are removed from this separate web repository after verification.
- `README.md`, `AGENTS.md`, and `CLAUDE.md` accurately describe the final web-only structure.
