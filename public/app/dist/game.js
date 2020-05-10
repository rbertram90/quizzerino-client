var ConnectionData = /** @class */ (function () {
    function ConnectionData() {
    }
    return ConnectionData;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.parentElement = null;
        this.connectForm = null;
        this.configForm = null;
        this.socket = null;
        this.clientIsGameHost = false;
        this.player = null;
        this.components = {
            playerList: null
        };
        var helper = new DOMHelper();
        this.parentElement = helper.element({ tag: 'div', id: 'quiz_game' });
        document.body.appendChild(this.parentElement);
        Game.instance = this;
    }
    Game.getInstance = function () {
        if (Game.instance) {
            return Game.instance;
        }
        else {
            return new Game();
        }
    };
    Game.prototype.showLogin = function () {
        var username;
        var host;
        var port;
        var default_icon;
        var remember_me;
        var lastConnection;
        var helper = new DOMHelper();
        // Get last values
        if (lastConnection = window.localStorage.getItem('last_server_connection')) {
            this.lastConnection = JSON.parse(lastConnection);
            host = this.lastConnection.host;
            port = this.lastConnection.port;
            username = this.lastConnection.username;
            default_icon = this.lastConnection.icon;
            remember_me = true;
        }
        else {
            // Defaults
            host = '127.0.0.1';
            port = 8080;
            username = 'player' + Date.now().toString().substr(-4);
            remember_me = false;
        }
        // Check if the host/port has been provided in URL
        if (window.location.search) {
            var searchParts = window.location.search.substring(1).split('&');
            for (var p = 0; p < searchParts.length; p++) {
                var varParts = searchParts[p].split('=');
                if (varParts[0] == 'host') {
                    host = varParts[1];
                }
                if (varParts[0] == 'port') {
                    port = varParts[1];
                }
            }
        }
        if (!default_icon) {
            default_icon = (Math.floor(Math.random() * 20) + 1).toString();
        }
        // Form
        var connectForm = document.createElement('form');
        connectForm.id = 'connect_form';
        // Heading
        var title = helper.element({ tag: 'h2', text: t('Connect to game server') });
        connectForm.appendChild(title);
        // Placeholder for errors
        var errorWrapper = helper.element({ tag: 'div', "class": 'errors' });
        connectForm.appendChild(errorWrapper);
        // Host
        var hostWrapper = helper.element({ tag: 'div', "class": 'field', id: 'field_host' });
        connectForm.appendChild(hostWrapper);
        var hostLabel = helper.element({ tag: 'label', "for": 'connect_host', text: t('Host') });
        hostWrapper.appendChild(hostLabel);
        var hostField = helper.element({ tag: 'input', type: 'text', id: 'connect_host', value: host });
        hostField.setAttribute('required', 'required');
        hostWrapper.appendChild(hostField);
        // Port
        var portWrapper = helper.element({ tag: 'div', "class": 'field', id: 'field_port' });
        connectForm.appendChild(portWrapper);
        var portLabel = helper.element({ tag: 'label', "for": 'connect_port', text: t('Port') });
        portWrapper.appendChild(portLabel);
        var portField = helper.element({ tag: 'input', type: 'text', id: 'connect_port', value: port });
        portField.setAttribute('required', 'required');
        portField.setAttribute('size', '4');
        portWrapper.appendChild(portField);
        // Username
        var usernameWrapper = helper.element({ tag: 'div', "class": 'field', id: 'field_username' });
        connectForm.appendChild(usernameWrapper);
        var usernameLabel = helper.element({ tag: 'label', "for": 'username', text: t('Username') });
        usernameWrapper.appendChild(usernameLabel);
        var usernameField = helper.element({ tag: 'input', type: 'text', id: 'username', value: username });
        usernameField.setAttribute('required', 'required');
        usernameWrapper.appendChild(usernameField);
        var rememberMeWrapper = helper.element({ tag: 'div', "class": 'field', id: 'field_remember' });
        var rememberMe = helper.element({ tag: 'input', id: 'remember_me', type: 'checkbox' });
        var rememberMeLabel = helper.element({ tag: 'label', "for": 'remember_me', text: t('Remember these details') });
        if (remember_me) {
            rememberMe.checked = true;
        }
        rememberMeWrapper.appendChild(rememberMe);
        rememberMeWrapper.appendChild(rememberMeLabel);
        connectForm.appendChild(rememberMeWrapper);
        // Icon
        var iconWrapper = helper.element({ tag: 'div', "class": 'field', id: 'field_icon' });
        var iconLabel = helper.element({ tag: 'label', "for": 'icon', text: t('Player face') });
        var iconField = helper.element({ tag: 'input', type: 'hidden', name: 'icon', value: default_icon });
        iconWrapper.appendChild(iconLabel);
        iconWrapper.appendChild(iconField);
        for (var i = 1; i <= 28; i++) {
            var icon = helper.element({ tag: 'img', src: '/images/player-icons/' + i + '.png', "class": 'player-icon',
                alt: 'Player icon ' + i, data: { index: i } });
            if (i.toString() == default_icon)
                icon.className = 'player-icon selected';
            icon.addEventListener('click', function () {
                iconField.value = this.dataset.index;
                var elements = document.querySelectorAll('#field_icon img.player-icon');
                for (var e = 0; e < elements.length; e++) {
                    elements[e].className = 'player-icon';
                }
                this.className = 'player-icon selected';
            });
            iconWrapper.appendChild(icon);
        }
        connectForm.appendChild(iconWrapper);
        // Actions
        var actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'actions';
        connectForm.appendChild(actionsWrapper);
        var submitButton = document.createElement('button');
        submitButton.id = 'connect_button';
        submitButton.type = 'button';
        submitButton.innerText = t('Connect');
        actionsWrapper.appendChild(submitButton);
        submitButton.addEventListener('click', this.openConnection);
        this.parentElement.appendChild(connectForm);
        this.connectForm = {
            form: connectForm,
            errors: errorWrapper,
            host: hostField,
            port: portField,
            username: usernameField,
            rememberMe: rememberMe,
            icon: iconField,
            submitButton: submitButton
        };
    };
    Game.prototype.openConnection = function (event) {
        var game = Game.getInstance();
        var form = game.connectForm;
        // Validate form
        if (form.username.value.length == 0) {
            form.errors.innerHTML = '<p class="error">' + t('Please enter a username') + '</p>';
            return;
        }
        if (form.host.value.length == 0) {
            form.errors.innerHTML = '<p class="error">' + t('Please enter the hosts IP address') + '</p>';
            return;
        }
        if (form.port.value.length == 0) {
            form.errors.innerHTML = '<p class="error">' + t('Please enter the hosts port number (8080 by default)') + '</p>';
            return;
        }
        form.username.disabled = true;
        form.submitButton.disabled = true;
        form.host.disabled = true;
        form.port.disabled = true;
        game.createServerConnection();
        event.preventDefault();
    };
    Game.prototype.createServerConnection = function () {
        var game = this;
        var form = game.connectForm;
        form.errors.innerHTML = '<p class="info loader"><img src="/images/ajax-loader.gif">' + t('Connecting to server') + '</p>';
        var host = form.host.value;
        var port = form.port.value;
        var username = form.username.value;
        var icon = form.icon.value;
        var rememberMe = form.rememberMe.checked;
        game.socket = new WebSocket('ws://' + host + ':' + port);
        game.socket.onopen = function (e) {
            // Show either waiting for game to start or game options
            game.socket.send('{ "action": "player_connected", "username": "' + username + '", "icon": "' + icon + '" }');
            if (rememberMe) {
                window.localStorage.setItem('last_server_connection', JSON.stringify({
                    host: host,
                    port: port,
                    username: username,
                    icon: icon
                }));
            }
            else {
                window.localStorage.removeItem('last_server_connection');
            }
        };
        game.socket.onmessage = game.handleMessage;
        game.socket.onclose = function (event) {
            var form = Game.getInstance().connectForm;
            if (form) {
                form.errors.innerHTML = '<p class="error">' + t('Connection to server failed') + "</p>";
                form.username.disabled = false;
                form.submitButton.disabled = false;
                form.host.disabled = false;
                form.port.disabled = false;
            }
            else {
                // Lazy way to reset everything...
                // Ideally would show an error message saying connection lost
                window.location.reload();
            }
        };
    };
    Game.prototype.handleMessage = function (message) {
        var data = JSON.parse(message.data);
        var game = Game.getInstance();
        switch (data.type) {
            case 'connected_game_status':
                var username = game.connectForm.username.value;
                // Remove connect form from DOM
                game.connectForm.form.parentElement.removeChild(game.connectForm.form);
                game.connectForm = null;
                // Create player
                game.player = new Player(game, username);
                switch (data.game_status) {
                    // Awaiting game start
                    case 0:
                        if (data.host == null || data.host.username == username) {
                            // Show configure game options screen
                            game.configForm = game.loadConfigForm(data);
                        }
                        else {
                            // Show awaiting game start screen
                            game.loadAwaitGameStart();
                        }
                        break;
                }
                break;
            case 'player_connected':
                // Check if the player that connected is local player
                // If they are game host then enable buttons
                if (data.host) {
                    game.clientIsGameHost = true;
                }
                break;
            case 'round_start':
                game.showQuestionScreen(data);
                break;
        }
        game.updateComponents(data);
    };
    /**
     * Farm out responsibility of updating screen to any individual
     * components on screen.
     *
     * @param message Message direct from WebSocket server
     */
    Game.prototype.updateComponents = function (message) {
        for (var i in this.components) {
            if (this.components[i]) {
                this.components[i].sendMessage(message);
            }
        }
    };
    /**
     * Generate the game config form
     * Fields:
     * - Which question set should be used?
     * - @todo Time limit
     * - @tood Winning score
     *
     * @param data Data from server for the config form
     */
    Game.prototype.loadConfigForm = function (data) {
        var helper = new DOMHelper;
        var optionsWrapper = helper.element({ tag: 'div', id: 'game_options', parent: this.parentElement });
        // data is passed back in connected_game_status message - we don't have an easy
        // way to make a seperate ajax call to this WS server!
        var options = data.quiz_options;
        var quizSelect = helper.element({ tag: 'select', parent: optionsWrapper });
        for (var q = 0; q < options.length; q++) {
            helper.element({ tag: 'option', value: options[q].id, text: options[q].title, parent: quizSelect });
        }
        var submitButton = helper.element({ tag: 'button', type: 'button', text: t('Start game'), parent: optionsWrapper });
        submitButton.addEventListener('click', this.startGame);
        var connectedUsers = helper.element({ tag: 'div', "class": 'connected-players', parent: this.parentElement });
        this.components.playerList = new PlayerList(this, connectedUsers);
        // Return object with all the fields that will be referenced when starting game
        return {
            quizChoice: quizSelect
        };
    };
    /**
     * Called for users that are NOT the host when joining
     * the server before the game has started
     *
     * Shows a 'waiting for game to start' screen
     */
    Game.prototype.loadAwaitGameStart = function () {
        var helper = new DOMHelper;
        var wrapper = helper.element({ tag: 'div', id: 'awaiting_game_start', parent: this.parentElement });
        var lhs = helper.element({ tag: 'div', "class": 'waiting_panel', parent: wrapper });
        helper.element({ tag: 'h2', text: t('Waiting for host to start the game...'), parent: lhs });
        helper.element({ tag: 'img', src: '/images/waiting.gif', alt: t('Humorous animation of a person waiting'), parent: lhs });
        var connectedUsers = helper.element({ tag: 'div', "class": 'connected-players', parent: wrapper });
        this.components.playerList = new PlayerList(this, connectedUsers);
    };
    /**
     * Run from host computer
     * Sends message to server to start the game
     *
     * @param event Click event from start button
     */
    Game.prototype.startGame = function (event) {
        var game = Game.getInstance();
        var config = JSON.stringify({
            action: "start_game",
            quiz: game.configForm.quizChoice.value
            // winningScore: 10,
            // roundTime: 30
        });
        game.socket.send(config);
        event.preventDefault();
    };
    /**
     * Called when new question has been initiated
     *
     * @param data Array of data passed from websocket response
     */
    Game.prototype.showQuestionScreen = function (data) {
        var helper = new DOMHelper;
        var question = data.question;
        // Clear screen
        this.parentElement.innerHTML = '';
        var questionWrapper = helper.element({ tag: 'div', "class": 'question-wrapper', parent: this.parentElement });
        helper.element({ tag: 'p', text: t('Question') + ' ' + data.questionNumber, parent: questionWrapper });
        helper.element({ tag: 'h1', html: question.text, parent: questionWrapper });
        for (var opt = 0; opt < question.options.length; opt++) {
            var optionText = question.options[opt];
            var button = helper.element({ tag: 'button', value: opt, html: optionText, parent: questionWrapper, type: 'button' });
            button.addEventListener('click', function (event) {
                var game = Game.getInstance();
                game.submitAnswer(this);
                event.preventDefault();
            });
        }
        var connectedUsers = helper.element({ tag: 'div', "class": 'connected-players', parent: this.parentElement });
        this.components.playerList = new PlayerList(this, connectedUsers);
    };
    /**
     * Select an answer and submit to server
     */
    Game.prototype.submitAnswer = function (button) {
        var helper = new DOMHelper;
        var answer = JSON.stringify({
            action: "answer_submit",
            answer: button.value
            // winningScore: 10,
            // roundTime: 30
        });
        game.socket.send(answer);
        // Clear question from screen
        var questionWrapper = document.querySelector('.question-wrapper');
        questionWrapper.innerHTML = '';
        helper.element({ tag: 'h1', text: t('Waiting for other players to submit answers...'), parent: questionWrapper });
    };
    Game.instance = null;
    return Game;
}());
