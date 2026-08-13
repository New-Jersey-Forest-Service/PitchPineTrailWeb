# Web Application Architecture

Pitch Pine Trail is a static vanilla JavaScript web application. The repository is a standalone web-project fork; it does not maintain a desktop Python implementation.

## Application Boundary

The repository root contains the browser-delivered application files:

```text
index.html
assets/       # JPG, WAV, and any future browser assets
css/
js/
```

Use document-relative URLs in browser code, such as `assets/introscreen.jpg`, `css/style.css`, and `js/screens.js`. Do not use `../src/assets/` or site-root paths beginning with `/`; project-site URLs include the repository name.

## Deployment

`.github/workflows/pages.yml` uploads the repository root as the GitHub Pages artifact. The root `index.html` is published at:

```text
https://<organization>.github.io/<repository>/
```

The workflow publishes static files unchanged: no backend, framework, or build step is required.

## Local Testing

Serve the repository root and open `http://localhost:8001/`:

```powershell
& 'C:\Users\n2ubx\anaconda3\python.exe' -m http.server 8001
```

## Behavior And Visual Style

Preserve the existing retro fullscreen design, Courier typography, screen flow, animations, audio, analysis lab, certificate workflow, and CSV export behavior implemented in `js/` and `css/style.css`.
