# Pitch Pine Trail

Pitch Pine Trail is a retro-style, browser-based forest-management game. It is a static vanilla JavaScript application designed to run locally or on GitHub Pages.

## Project Structure

```text
web/                       # Complete browser application and Pages artifact
├── index.html
├── assets/                # Game images and audio
├── css/
└── js/
.github/workflows/pages.yml # GitHub Pages deployment workflow
```

Repository planning, logs, and agent instructions remain outside `web/` and are not part of the published site.

## Run Locally

From the repository root, serve `web/` as the document root:

```powershell
& 'C:\Users\n2ubx\anaconda3\python.exe' -m http.server 8001 --directory web
```

Then open [http://localhost:8001/](http://localhost:8001/).

From an Anaconda Prompt in the repository root, the equivalent is:

```cmd
python -m http.server 8001 --directory web
```

Press `Ctrl+C` in the serving terminal to stop the server.

## Deployment

The GitHub Pages workflow deploys the contents of `web/` unchanged, making `web/index.html` the public site root. Configure the repository Pages source to **GitHub Actions**. The site will be available at:

```text
https://<organization>.github.io/<repository>/
```

## License

This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt).
