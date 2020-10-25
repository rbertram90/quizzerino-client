function t(string) {
    // Ignoring warnings on this variable not being set as is done so
    // in game.php but the compiler does not pick up.
    // @ts-ignore
    if (typeof translations[string] === 'undefined') {
        // Helpful for spotting missed translations
        console.warn('Notice: no translation entry for ' + string);
        return string;
    }
    else {
        // @ts-ignore
        return translations[string];
    }
}
