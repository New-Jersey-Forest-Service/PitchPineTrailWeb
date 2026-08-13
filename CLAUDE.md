# Agent Instructions

These instructions apply to agents working in this repository.

## Start Here

Before making changes, read:

- `README.md` for the project overview and local run instructions.
- `context/webplan.md` for the browser application and GitHub Pages architecture.
- `logs/processlog.md` for the latest handoff notes from prior agents.

Treat the existing browser implementation at the repository root as the application source of truth. Preserve its game behavior, screen flow, animations, sound behavior, overlays, analysis lab, certificate workflow, and CSV export behavior unless the user asks to change them.

## Tasks And Implementation Plans

Use `tasks/` for active implementation plans and other task handoff documents. New plans belong directly in `tasks/` while they are active. When a plan has been fully implemented, move it to `tasks/implemented/` rather than deleting it.

To preserve context space, do not read files in `tasks/implemented/` unless the user explicitly asks for one, or the current task requires reviewing a completed plan.

## Mirrored Agent Instructions

`AGENTS.md` and `CLAUDE.md` must be identical copies of these repository instructions. If either file is changed, make the matching change in the other file during the same task. If either file is missing, create it by copying the existing instruction file so both files exist and remain synchronized.

## Web Application And Pages Rules

The complete browser application lives at the repository root. Keep browser-delivered HTML, CSS, JavaScript, images, audio, and fonts in `index.html`, `css/`, `js/`, and `assets/`; `assets/` is the canonical asset directory.

- Use a static vanilla JavaScript app.
- Do not add a backend, framework, or browser build step unless the user approves a change in direction.
- Use document-relative asset paths that work from the repository root, such as `assets/filename.jpg`; do not use `../src/assets/` or site-root asset paths beginning with `/`.
- Preserve the retro fullscreen visual style, Courier typography, and original game aesthetic.
- Deploy the repository root through `.github/workflows/pages.yml`; its `index.html` is the GitHub Pages site root.

## Testing And Local Servers

When testing locally, serve the repository root as the document root and open:

```text
http://localhost:8001/
```

Example:

```powershell
Start-Process -FilePath 'C:\Users\n2ubx\anaconda3\python.exe' -ArgumentList @('-m','http.server','8001') -WindowStyle Hidden
```

If you start any local web server for testing, track:

- the command used,
- the port,
- the process ID if available,
- what URL the user should open.

At the end of a session, ask the user whether they want you to shut down any local testing servers you started. Do not close servers silently unless the user has explicitly asked you to shut them down.

If the user asks you to shut down local servers, stop only the server processes you started or can clearly identify as repo testing servers.

## Process Log

Always append a concise handoff note to `logs/processlog.md` when you make a meaningful change, run important verification, discover a caveat, or leave work for a downstream agent.

Each process-log entry should include:

- date,
- summary of work,
- files changed,
- commands or tests run,
- verification results,
- known caveats or next steps.

Do not overwrite prior process-log content. Append new notes.

## Prompt Log

Always append the user prompt, verbatim, to `logs/promptlog.md`. If the log file does not exist, create it in the proper folder. Do not alter previous prompts.

## Git And File Safety

- Check existing work before editing.
- Do not revert user changes unless the user explicitly asks.
- Keep changes scoped to the user request.
- Avoid unrelated refactors.
- Use the current branch unless the user asks for branch work.
- Be clear in the final response about what changed and what was not verified.

## Useful Current Files

- `index.html`: browser app shell.
- `assets/`: game images and audio.
- `css/style.css`: web app styling.
- `js/game.js`: JavaScript game logic.
- `js/screens.js`: web screen router and turn flow.
- `js/sounds.js`: browser audio wrappers.
- `js/charts.js`: analysis lab charts and CSV export.
- `.github/workflows/pages.yml`: GitHub Pages deployment.
- `logs/processlog.md`: running handoff log.
