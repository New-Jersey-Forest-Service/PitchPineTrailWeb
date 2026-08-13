# Pitch Pine Trail

Pitch Pine Trail is a retro-style, browser-based forest-management game. It is a static vanilla JavaScript application designed to run locally or on GitHub Pages.

## Project Structure

```text
index.html                  # Browser app shell and Pages entry point
assets/                     # Game images and audio
css/
js/
.github/workflows/pages.yml # GitHub Pages deployment workflow
```

Repository planning, logs, and agent instructions remain separate from the browser app files.

## Run Locally

From the repository root, serve the repository as the document root:

```powershell
& 'C:\Users\[user]\anaconda3\python.exe' -m http.server 8001
```

Then open [http://localhost:8001/](http://localhost:8001/).

From an Anaconda Prompt in the repository root, the equivalent is:

```cmd
python -m http.server 8001
```

Press `Ctrl+C` in the serving terminal to stop the server.

## Deployment

The GitHub Pages workflow deploys the site files from the repository root, making `index.html` the public site root. Configure the repository Pages source to **GitHub Actions**. The site will be available at:

```text
https://<organization>.github.io/<repository>/
```

## License

This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt).

## Web App

To access the web app go to:

https://New-Jersey-Forest-Service.github.io/PitchPineTrailWeb/