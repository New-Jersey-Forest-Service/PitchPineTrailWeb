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
Great! Can we make every image load in the same way so there is never a navy screen showing in the background as an image loads from top to bottom
the forest_sound.wav should begin one the intro screen not on the screen sfterwards
on the ending screen if the player won the pinesnake achievment I want to load the pinesnake_medal_end.png on top of the screen that is already loaded
can you please add these fixes
okay, using this I want to reqork how ending screens are done, now the background screen will be loaded based on QMD and the three options are bad_nomedal.jpg, okay_nomedal.jpg and good_nomedal.jpg. instead of choosing a background screen based on achievements different PNGs will be loaded based on what achievments are won. We alreadly did the pine snake so please do this for the remainder of the .pngs in the assest folder corresponded with the correct achievment
now I want to postion the medals, can we make it so the forst medal acheived will appear in the top left and then second achieved will appear below that and so on. There should be only a potential of 3 medals in the first collum, 3 in the second and 2 in the third if all the medals were one in a single game
can we make it so the medals are larger and the whole grid is moved up
can we make the medals even larger
I want to move the Let's Play button to 70% , 80%
I want to remove the click for definitions button from the zoom_10.jpg screen.
so I've measured and on the zoom_10.jpg between the x pixel range 714-1440 and the y pixel range 142-446 I want text popup to read, when you playing the game, clickere here for the definitions book. Can you make it so this is scaled appropriately depending on the size of the image in the browser
please make the neccesary changes
can we remove the min width and min -height to see if that fixes the issue?
it still is not in right place but I have verfied my pixel range is correct. Any suggestions?
can you make these changes?
can we make the pop up appear just to the right of the hover area and can we center the text
can we add a similar sized and formatted pop up at 299 instead of 142 and 1252 instead of 714. This one should say "When playing the game, click here for the field guide of rare plants and animals that could come live in your forest!"
now we are going to add a third with slight different postion, width and height. x: 79, y: 226, width: 250, height:237. THis pop up should say "You don't need a hint yet! You haven't even started!"
can we rework the positioning of everything on the screen throughout the whole game to be in reference to the pixel of the background image instead of relative position on the screen and that way using the scale factor it will always scale appropriately on different screens? Can you caluclate using the background image size we've discused.
Can we try the above request again. I have now made sure all the background images are the same pixel dimensions
the game is having an issue where the button and text overlays are disapearing when an turn animation plays during game. Can we make it so buttons and text always appears on top of cycling background images
there is an issue where the continue buttons after achviments and game events (e.g hurricane and out of control burn) is not return to the main play screen. Make sure the continue button removes the temporary background iamge loaded when the achviement or game event is triggered
we make the ending screen medal size smaller and set it so it scales with screen size
the button and text disappear while the huriccane animation is playing. Can we make them remain on top of that animation as well?
I want to remove the click for definitions button on the main play screen and replace it with the hover area we defined for the click here to help understand what different terms and management decisions mean. The new hover should say, "Don't know what a term means? Click here for the Glossary!" and when clicked it should direct to the screen that then click for definitions button used to direct to
now let's do the same for the field guide. Remove click for field guide button, replace with a hover and click where the click for field guide hover is on the zoom screen
Now make sure both of those return button return the background image to the play screen in the same way we just fixed the continue button for the achievments
can we replace both return buttons for both the definitions and the field guide with a click in their respective defined areas used to open those screens
Now can we make the same changes to buttons in the analysis lab for the analysis lab definitions screen
can we make the region the exact same that it was on the main play screen
can we remove the hover text in the anlysis lab definitions
can we add back the hover the says "Don't know what a term means? Click here for the Glossary!" in the analysis lab
I now want to take the click for a hint button, remove it, and transfer it's functionality to a hover and click region that was used for the "You don't need a hint yet! You haven't even started!". THe new hover should say "Stuck? Click for a hint!", the hint images should now appear directly to the right of the region
can we make the hint images a little smaller and more them a little to the right
will this change all red button text? can I seperate out the exit button so I only change that text size
can you do this for me
can we make sure the page_close.wav plays when wither anlysis screen or the field guide is closed. it should be associted with the hover and clicks that close those screens
can I control the three button inthe survey actions seperately
I want to indpendently control their location
can we make it so each of the three buttons can be placed indpendently in reference to the pixel of the background image
plase make it so the text for the survey button scales with screen size
can we change the fucntionality of the survey exit tab so it closes the tab that the game is running in
on the right next to the exit button the main play screen can we add a navy button that says "Restart" over and returns the player to the zoom_10.jpg screen restrating the game
the actions buttons should be over the hurricane screen omly the continue button
the continue button should be visiable and clickable before the animation is over. the continue button should end the animation and sound
the metrics should stay on top of the hurricane animation screen
Okay, I'll take care of the, uh, pull request then.
So when I went to run this project on GitHub Pages, it appears the project needs to be run through root. So, can we move files appropriately from the web folder and assets in a way that this site will run from the root instead of from the web folder? It appears to be having problems with that.
Can you check and let me know what branch we're working on right now?
Excellent. Can we commit and push these changes?
Okay, I switched branches. Can you see which branch we're on? We should be on WZport now.
Let's do a pull request into the branch's root.
Okay, I'll take care of the, uh, pull request then.
