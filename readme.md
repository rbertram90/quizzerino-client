# Quizzerino client

Front-end for the "Quizzerino" app - a multiplayer, browser-based, quiz game. Why "quizzerino"? Because it sounds fun!

## Current feautres
- Play quizzes with multiple choice questions
- Multiplayer - everyone answers the same questions. Everyone get the chance to answer the question before the next one is shown.
- Optional, configurable question timer - avoid waiting too long!
- Configurable number of questions
- Configurable question sets

This client is available for anyone to use at: http://quizzerino.rbwebdesigns.co.uk/

However, to play this game you need to host your own quizzerino server, with a bit of port-forwarding this can be done from your local computer see: https://github.com/rbertram90/quizzerino-server

## Contributing

Contributions welcome, you will need TypeScript and Sass compliers setup to work on this app. I use VS Code which can be set-up as follows:

Typescript:
1. Make sure you have `npm` installed.
2. Make sure you have the typescript complier `tsx` installed on your machine. `npm install -g typescript`
3. Run `tsc --watch` to compile files on save

Sass:
1. Install the "Live Sass Compiler" extension.
2. Add to project configuration:

```
    "liveSassCompile.settings.formats": [
        
        {
            "format": "expanded",
            "extensionName": ".css",
            "savePath": "~/dist",
            "savePathReplacementPairs": null
        }
    ],
```

3. Press the "Watch Sass" button in the bottom of VS Code