# GitHub Pages Deployment Instructions

Pitch Pine Trail is deployed as a static GitHub Pages site from the `web/` directory.

## One-Time Repository Setup

1. Open the repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.

The workflow at `.github/workflows/pages.yml` deploys automatically when changes are pushed to `main`. It also supports manual runs from the GitHub Actions tab.

## What Is Published

The workflow uploads `web/` unchanged. Its contents become the published site root:

```text
web/index.html       → https://<organization>.github.io/<repository>/
web/assets/          → https://<organization>.github.io/<repository>/assets/
web/css/             → https://<organization>.github.io/<repository>/css/
web/js/              → https://<organization>.github.io/<repository>/js/
```

Use document-relative asset paths such as `assets/introscreen.jpg`. Do not use `/assets/...`, because a GitHub Pages project site includes the repository name in its URL path.

## Local Verification

From the repository root:

```powershell
& 'C:\Users\n2ubx\anaconda3\python.exe' -m http.server 8001 --directory web
```

Open `http://localhost:8001/`. Press `Ctrl+C` in the serving terminal to stop the server.

## Deployment Verification

After a `main` branch push:

1. Open the **Actions** tab and confirm the `Deploy GitHub Pages` workflow succeeds.
2. Open the workflow's published URL, or visit `https://<organization>.github.io/<repository>/`.
3. Check browser developer tools for failed image, audio, JavaScript, or CSS requests.
