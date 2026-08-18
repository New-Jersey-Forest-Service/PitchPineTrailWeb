So, this game was originally a port from a Python game designed to run on the desktop, but we'd like to run it as a web app using GitHub Sites. Originally, we ran the game from the Python version and used the assets in the source folder, and ran the web app from the web folder to be able to run examples locally. But ultimately, we'd like to run this on GitHub Pages. So, let's create a plan in the tasks/ folder called PagesPortPlan.md to be able to port this over cleanly so that it would run on GitHub Pages easily. And some of that might be moving files and assets around so that they sit more cleanly in the repository. Also in the plan, let's suggest any changes that we might make to the agent's MD file too, because it references folder locations. Don't change anything else, let's just make the plan first. Also, in addition, let's add references to the tasks folder in the AGENTS.md. And also reference that implementation plans will be placed in that folder, and that there is a tasks/implemented/ folder. Plans that are finished or implemented are to be placed there. Also, AI agents, should not load any of the information in the implemented folder unless instructed to, to save on context window.

Let's also add, let's edit the AGENTS.md file and add that agents.md copy of this file will be created called CLAUDE.md, and they're to be identical copies of each other. So if one is changed, alter the other accordingly so that they match each other. And if one doesn't exist, make a copy of the other so both files exist and keep them in sync.

Can you commit and push these changes?

To make it clear, this is a new repository that was branched off as a separate project from the desktop game. So we don't have to worry about maintaining the desktop game in this repository. So that might give us some freedom. So you may want to, let's consider amending tasks/PagesPortPlan.md.

Excellent points. If they are not reflected in tasks/PagesPortPlan.md, let's amend it to reflect these elements that we discussed.

Let's commit and push these changes to this branch.

Let's create a branch off of the branch that we're currently using, because we're gonna make some changes to that and try to implement the plan. So let's make a branch first and switch branches to that new branch called...

WZPagesPortPlan

Great. Um, can you publish this branch now?

Okay, let's implement our yet-to-be-implemented plan and tasks/.

Great, yeah, I just tested it and it works. You can shut it down.

Great. Commit and push any remaining changes on this branch.
Let's do a pull request into the branch's root.
the images seem to load in such a way that they load from top to bottom over a navy screen which really just make them look like they are glirching rather than playing the zoom sequence. Is there a way to fix this?
Okay, I'll take care of the, uh, pull request then.
So when I went to run this project on GitHub Pages, it appears the project needs to be run through root. So, can we move files appropriately from the web folder and assets in a way that this site will run from the root instead of from the web folder? It appears to be having problems with that.
Can you check and let me know what branch we're working on right now?
Excellent. Can we commit and push these changes?
Okay, I switched branches. Can you see which branch we're on? We should be on WZport now.
Let's do a pull request into the branch's root.
Okay, I'll take care of the, uh, pull request then.
