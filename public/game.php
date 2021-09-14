<?php
    session_start();

    include __DIR__ .'/../Translate.php';

    if (isset($_GET['lang'])) {
        $_SESSION['user_lang'] = $_GET['lang'];
    }
    $lang = isset($_SESSION['user_lang']) ? $_SESSION['user_lang'] : 'en';

    if (file_exists(__DIR__ .'/../lang/'. $lang .'.php')) {
        Translate::$language = $lang;
    }
?><!DOCTYPE html>
<html lang="<?php print $lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Quizzerino - Game client</title>
    <link rel="stylesheet" type="text/css" href="/css/dist/game.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css">
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro" rel="stylesheet">
    <link href="/images/favicon.png" type="image/png" rel="icon">
    <!-- https://www.dafont.com/karmatic-arcade.font -->
</head>
<body>
    <script>
    <?php if ($lang == 'en'): ?>
        let translations = {};
    <?php else: ?>
        let translations = <?php print json_encode(Translate::getTranslations()); ?>;
    <?php endif; ?>

    <?php if (file_exists(__DIR__ .'/../config.json')): ?>
        let config = <?php include (__DIR__ .'/../config.json') ?>;
    <?php else: ?>
        let config = {};
    <?php endif; ?>
    </script>

<!--
    <script src="/lib/jquery-3.4.1.min.js"></script>
    <script src="/lib/jquery-ui.min.js"></script>
    <script src="/lib/jquery-ui-touch-punch.min.js"></script>
    <script src="/app/helpers/DOMHelper.js"></script>
    <script src="/app/translate.js"></script>
    <script src="/app/Player.js"></script>
    <script src="/app/Component.js"></script>
    <script src="/app/components/PlayerList.js"></script>
    <script src="/app/components/RoundSubmissions.js"></script>
    <script src="/app/components/PlayerDeck.js"></script>
-->
    <script src="/app/dist/domhelper.js"></script>
    <script src="/app/dist/translate.js"></script>
    <script src="/app/dist/component.js"></script>
    <script src="/app/dist/player.js"></script>
    <script src="/app/dist/playerlist.js"></script>
    <script src="/app/dist/gameconfigform.js"></script>
    <script src="/app/dist/connectform.js"></script>
    <script src="/app/dist/game.js"></script>
    <script src="/app/dist/main.js"></script>

</body>
</html>