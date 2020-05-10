<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Quiz App</title>
    <link rel="stylesheet" type="text/css" href="/css/front.css">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
    <link href="/images/favicon.png" type="image/png" rel="icon">
</head>
<body>
<header>
    <img src="/images/logo.png" class="logo" alt="Fill in the Blanks">
    <p>Client and server application for a quiz game.</p>
</header>
<main>
    <section>
        <h2>Project status</h2>

        <h3>Contributing</h3>
        <p>This project has only just begun (as of May 2020) and is open source, check it out on <a href="https://github.com/rbertram90/quizzerino-server" target="_blank">GitHub</a>. Feel free to open a ticket for a feature request/ bug report, if you want to get your hands dirty, i'm open to pull requests.</p>
    </section>
    <section>
        <h2>Client</h2>
        <p>See: <a href="https://github.com/rbertram90/quizzerino-client" target="_blank">Quizzerino client</a> - will soon be availble as a hosted website.</p>
        <!--
        <p>The latest version of the client is available for anyone to use at <a href="https://quizzerino.rbwebdesigns.co.uk/game.php">https://quiz.rbwebdesigns.co.uk/game.php</a> however it is down to individuals to host game servers as described below.</p>
        <a href="/game.php" class="big-button">Play now</a>
        -->
    </section>
    <section>
        <h2>Server</h2>

        <h3>Requirements</h3>
        <ul>
            <li>PHP >= 7.0</li>
            <li>Composer (<a href="https://getcomposer.org/" target="_blank">https://getcomposer.org/</a>)</li>
        </ul>

        <h3>Setup</h3>
        <ul>
            <li>Clone repo</li>
            <li>Add question sources</li>
            <li>Run <code><b>composer</b> install</code></li>
        </ul>

        <h3>Starting the game</h3>
        <ul>
            <li>Open a terminal</li>
            <li>Change into project root directory</li>
            <li>Run command <code><b>php</b> start-server.php <i>[port number]</i></code></li>
            <li>Port number defaults to <b>8080</b></li>
        </ul>
    </section>
    <section>
        <a href="/game.php" class="big-button">Play now</a>
    </section>
</main>
</body>
</html>