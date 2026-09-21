# Pitch Pine Trail

Pitch Pine Trail is a retro-style single player game video game inspired by classic 1980s and 1990s games. The game features a nostalgic graphical interface and engaging gameplay mechanics that immerse players in a unique forest managment experience:

    You are in charge of a Pitch Pine Forest in Southern New Jersey! for the next 100 years, you will make choices on how to best care for your forest. Your choices will impact the way your trees grow, what plants and animals may choose to call your forest home and ultimately how at risk your forest is to detrimental impacts. Your goal? Leave the forest better than you found it for a future generation of managers!

The game was designed and coded in-house featuring 100% human-made orginal artwork all created by New Jersey Forest Service employees.

## Launch the Web App

To play Pitch Pine Trail on the web go to:

https://New-Jersey-Forest-Service.github.io/PitchPineTrailWeb/

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

## Project Structure

```text
index.html                  # Browser app shell and Pages entry point
assets/                     # Game images and audio
css/
js/
.github/workflows/pages.yml # GitHub Pages deployment workflow
```

Repository planning, logs, and agent instructions remain separate from the browser app files.


## Web Deployment

The GitHub Pages workflow deploys the site files from the repository root, making `index.html` the public site root. Configure the repository Pages source to **GitHub Actions**. The site will be available at:

```text
https://<organization>.github.io/<repository>/
```

## License

This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt).

