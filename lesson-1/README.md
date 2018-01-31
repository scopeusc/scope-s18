# Lesson 1 - Setup

Welcome to Scope - Spring 2018!

We're excited to get started teaching you about back-end, routes, and modern server side development!

Before we get started, we want to make sure everyone is on the same page regarding their environment and set up.

# Software

## Required

* Node (v9.x) (Check with `node -v`, [Update instructions][1])
* NPM (v5.x) (Check with `npm -v`)
* Browser (Chrome recommended)

Additionally, make sure you apply for the [GitHub Education Pack](https://education.github.com/pack), as it'll provide a lot of tools we'll use in deployment throughout the semester.
## Recommended

Having a customized environment is one of the first steps to improving your workflow. We won't tell you exactly what you need to use, but these are some recommendations.

* WebStorm IDE - get through [JetBrains Student](https://www.jetbrains.com/student/)
* Text Editor: Sublime Text, VS Code, or Atom
* Yarn (Facebook's replacement for NPM)
* Zsh (A bit more extendable than Bash, especially paired with Oh-My-Zsh)

# Getting Started

## Steps
1. Before opening the project, switch to ES6. In the top level of WebStorm, go to Preferences -> Languages and Frameworks -> JavaScript. Switch to ECMAScript6.

1. If you're using WebStorm, simply open it and click "Import Project", and select the root of this folder (lesson-1). It should automatically get everything set up for you.
1. If you choose to use a different IDE, simply open the project folder in that IDE.
1. Open a shell and navigate to the folder `lesson-1`

1. Depending on your package manager, type `yarn install` or `npm install`. This will install all required modules and dependencies.

1. Go to the top right next to the start button and click "Edit Configurations". Next click the plus sign in the top left window that pops up and select Node.js. 

For js file, type "bin/www" and make sure that working directory is set to your lesson-1 folder. 

1. Run the server with `npm start` or with the green start button in the top right of WebStorm.

(Webstorm Only)


1. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
    1. Test the debugger in WebStorm - go to `routes/index.js` and add a breakpoint on line 5 ( click the line number on the left)

1. Next, stop your app with the red square in the top right, and run it in debug mode (click the bug to the right of the start button)

1. Navigate to [http://localhost:3000](http://localhost:3000) again - this time, it should switch over to the debug menu of WebStorm, where you can step over lines and inspect variables.

## Getting to know your editor
### Webstorm
Get acquainted with WebStorm! If you've ever used a JetBrains IDE (IDEA, PyCharm, CLion, etc), you'll be familiar with a lot of the commands.

Go through the options and look at what you're able to do. Some of the coolest ones are:

* Command (or Win) + Alt + L - Reformat all code in the current file according to your style preferences (found in Settings -> Languages & Frameworks -> JavaScript)

* Command (or Win) + Shift + D (when over a function or variable) - Rename all instances of that variable or function for a quick refactor (intelligent replacement will change it in all found occurences, even in the global scope!)

* Code Menu Bar -> Inspect Code - Will analyze your code and show you possible bugs, issues, style issues, or spelling errors!

* Command (or Win) + Alt + T - Surround selected code with a conditional (if, while, func, etc)

### Sublime Text
Sublime Text is known for being an incredibly light-weight text editor and can handle processing a large amount of code at a time (which is useful if you accidentally open up minified JavaScript bundles). Although it lacks many of the useful features that Webstorm provides, it makes up in its speed and customizability.

* Install Package Control (https://packagecontrol.io/) - an **essential** package manager for Sublime
* Syntax Highlighter for ES6/ES7 https://packagecontrol.io/packages/Babel. After installing, go to the bottom right and change the syntax highlighting so it looks like this:
![](https://i.imgur.com/5xjTn0x.png)
* GitGutter (allows you to see git diffs within the editor) https://packagecontrol.io/packages/GitGutter
* Trim Trailing Whitespaces on save: https://github.com/SublimeText/TrailingSpaces
* SublimeCodeIntel (smart autocomplete) https://packagecontrol.io/packages/SublimeCodeIntel



[1]: https://www.solarianprogrammer.com/2016/04/29/how-to-upgrade-nodejs-mac-os-x/

