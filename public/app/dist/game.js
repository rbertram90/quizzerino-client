class ConnectionData {
}
class Game {
    constructor() {
        this.parentElement = null;
        this.connectForm = null;
        this.configForm = null;
        this.socket = null;
        this.clientIsGameHost = false;
        this.player = null;
        this.components = {
            playerList: null
        };
        let helper = new DOMHelper();
        this.parentElement = helper.element({ tag: 'div', id: 'quiz_game' });
        document.body.appendChild(this.parentElement);
        Game.instance = this;
    }
    static getInstance() {
        if (Game.instance) {
            return Game.instance;
        }
        else {
            return new Game();
        }
    }
    showLogin() {
        let username;
        let host;
        let port;
        let default_icon;
        let remember_me;
        let lastConnection;
        let helper = new DOMHelper();
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
        var errorWrapper = helper.element({ tag: 'div', class: 'errors' });
        connectForm.appendChild(errorWrapper);
        // Host
        var hostWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_host' });
        connectForm.appendChild(hostWrapper);
        var hostLabel = helper.element({ tag: 'label', for: 'connect_host', text: t('Host') });
        hostWrapper.appendChild(hostLabel);
        var hostField = helper.element({ tag: 'input', type: 'text', id: 'connect_host', value: host });
        hostField.setAttribute('required', 'required');
        hostWrapper.appendChild(hostField);
        // Port
        var portWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_port' });
        connectForm.appendChild(portWrapper);
        var portLabel = helper.element({ tag: 'label', for: 'connect_port', text: t('Port') });
        portWrapper.appendChild(portLabel);
        var portField = helper.element({ tag: 'input', type: 'text', id: 'connect_port', value: port });
        portField.setAttribute('required', 'required');
        portField.setAttribute('size', '4');
        portWrapper.appendChild(portField);
        // Username
        var usernameWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_username' });
        connectForm.appendChild(usernameWrapper);
        var usernameLabel = helper.element({ tag: 'label', for: 'username', text: t('Username') });
        usernameWrapper.appendChild(usernameLabel);
        var usernameField = helper.element({ tag: 'input', type: 'text', id: 'username', value: username });
        usernameField.setAttribute('required', 'required');
        usernameWrapper.appendChild(usernameField);
        var rememberMeWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_remember' });
        var rememberMe = helper.element({ tag: 'input', id: 'remember_me', type: 'checkbox' });
        var rememberMeLabel = helper.element({ tag: 'label', for: 'remember_me', text: t('Remember these details') });
        if (remember_me) {
            rememberMe.checked = true;
        }
        rememberMeWrapper.appendChild(rememberMe);
        rememberMeWrapper.appendChild(rememberMeLabel);
        connectForm.appendChild(rememberMeWrapper);
        // Icon
        var iconWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_icon' });
        var iconLabel = helper.element({ tag: 'label', for: 'icon', text: t('Player face') });
        var iconField = helper.element({ tag: 'input', type: 'hidden', name: 'icon', value: default_icon });
        iconWrapper.appendChild(iconLabel);
        iconWrapper.appendChild(iconField);
        for (var i = 1; i <= 28; i++) {
            var icon = helper.element({ tag: 'img', src: '/images/player-icons/' + i + '.png', class: 'player-icon',
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
    }
    openConnection(event) {
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
    }
    createServerConnection() {
        let game = this;
        let form = game.connectForm;
        form.errors.innerHTML = '<p class="info loader"><img src="/images/ajax-loader.gif">' + t('Connecting to server') + '</p>';
        let host = form.host.value;
        let port = form.port.value;
        let username = form.username.value;
        let icon = form.icon.value;
        let rememberMe = form.rememberMe.checked;
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
            let form = Game.getInstance().connectForm;
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
    }
    handleMessage(message) {
        let data = JSON.parse(message.data);
        let game = Game.getInstance();
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
            case 'game_end':
                game.showGameEndedScreen(data);
                break;
        }
        game.updateComponents(data);
    }
    /**
     * Farm out responsibility of updating screen to any individual
     * components on screen.
     *
     * @param message Message direct from WebSocket server
     */
    updateComponents(message) {
        for (var i in this.components) {
            if (this.components[i]) {
                this.components[i].sendMessage(message);
            }
        }
    }
    /**
     * Generate the game config form
     * Fields:
     * - Which question set should be used?
     * - @todo Time limit per question
     *
     * @param data Data from server for the config form
     */
    loadConfigForm(data) {
        let helper = new DOMHelper;
        let optionsWrapper = helper.element({ tag: 'div', id: 'game_options', parent: this.parentElement });
        helper.element({ tag: 'h2', text: t('Game settings'), parent: optionsWrapper });
        helper.element({ tag: 'label', parent: optionsWrapper, text: t('Question set'), for: 'question_set' });
        // data is passed back in connected_game_status message - we don't have an easy
        // way to make a seperate ajax call to this WS server!
        let options = data.quiz_options;
        let quizSelect = helper.element({ tag: 'select', parent: optionsWrapper, id: 'question_set' });
        for (let q = 0; q < options.length; q++) {
            helper.element({ tag: 'option', value: options[q].id, text: options[q].title, parent: quizSelect });
        }
        // Number of Questions
        helper.element({ tag: 'label', text: t('Number of questions'), parent: optionsWrapper });
        let questionCount = helper.element({ tag: 'input', type: 'number', min: 5, max: 100, value: '20', parent: optionsWrapper });
        // Round timer
        helper.element({ tag: 'label', text: t('Time limit per question'), for: 'time_limit', parent: optionsWrapper });
        let timeLimit = helper.element({ tag: 'select', parent: optionsWrapper, id: 'time_limit' });
        let timeOptions = [
            { value: '0', text: t('No time limit') },
            { value: '1', text: '10 ' + t('seconds') },
            { value: '2', text: '20 ' + t('seconds') },
            { value: '3', text: '30 ' + t('seconds') }
        ];
        for (let a = 0; a < timeOptions.length; a++) {
            helper.element({ tag: 'option', value: timeOptions[a].value, text: timeOptions[a].text, parent: timeLimit });
        }
        // Submit button
        let submitButton = helper.element({ tag: 'button', type: 'button', text: t('Start game'), parent: optionsWrapper });
        submitButton.addEventListener('click', this.startGame);
        let connectedUsers = helper.element({ tag: 'div', class: 'connected-players', parent: this.parentElement });
        this.components.playerList = new PlayerList(this, connectedUsers);
        // Return object with all the fields that will be referenced when starting game
        return {
            quizChoice: quizSelect,
            numberOfQuestions: questionCount,
            timeLimit: timeLimit
        };
    }
    /**
     * Called for users that are NOT the host when joining
     * the server before the game has started
     *
     * Shows a 'waiting for game to start' screen
     */
    loadAwaitGameStart() {
        let helper = new DOMHelper;
        let wrapper = helper.element({ tag: 'div', id: 'awaiting_game_start', parent: this.parentElement });
        let lhs = helper.element({ tag: 'div', class: 'waiting_panel', parent: wrapper });
        helper.element({ tag: 'h2', text: t('Waiting for host to start the game...'), parent: lhs });
        helper.element({ tag: 'img', src: '/images/waiting.gif', alt: t('Humorous animation of a person waiting'), parent: lhs });
        let connectedUsers = helper.element({ tag: 'div', class: 'connected-players', parent: wrapper });
        this.components.playerList = new PlayerList(this, connectedUsers);
    }
    /**
     * Run from host computer
     * Sends message to server to start the game
     *
     * @param event Click event from start button
     */
    startGame(event) {
        let game = Game.getInstance();
        let config = JSON.stringify({
            action: "start_game",
            quiz: game.configForm.quizChoice.value,
            numberOfQuestions: game.configForm.numberOfQuestions.value,
            timeLimit: game.configForm.timeLimit.value
        });
        game.socket.send(config);
        event.preventDefault();
    }
    /**
     * Called when new question has been initiated
     *
     * @param data Array of data passed from websocket response
     *
     * Example data:
     * {
     *     "type":"round_start",
     *     "question":{
     *         "text":"What was the name of the WWF professional wrestling tag team made up of the wrestlers Ax and Smash?",
     *         "options":["The Dream Team","Demolition","The Bushwhackers","The British Bulldogs"],
     *         "correct_option_index":1
     *     },
     *     "questionNumber":1,
     *     "roundTime":30,
     *     "roundEndTimeUTC":"16039491630",
     *     "players":[
     *         {"username":"player8913","ip":"127.0.0.1","isGameHost":true,"isActive":true,"status":"Thinking...","score":0,"icon":"7"}
     *     ]
     * }
     */
    showQuestionScreen(data) {
        let helper = new DOMHelper;
        let question = data.question;
        // Clear screen
        this.parentElement.innerHTML = '';
        let questionWrapper = helper.element({ tag: 'div', class: 'question-wrapper', parent: this.parentElement });
        // Question text
        helper.element({ tag: 'p', text: t('Question') + ' ' + data.questionNumber, parent: questionWrapper });
        helper.element({ tag: 'h1', html: question.text, parent: questionWrapper });
        // Timer
        if (parseInt(data.roundTime) > 0) {
            helper.element({ tag: 'div', id: 'round_timer', data: { 'round-end-UTC': data.roundEndTimeUTC }, parent: questionWrapper });
            window.setInterval(function () {
                let roundTimerElem = document.getElementById('round_timer');
                // End date
                let endDate = parseInt(roundTimerElem.dataset.roundEndUtc);
                let now = Date.now() / 1000; // convert to seconds
                // Round to 2dp
                let remaining = Math.round((endDate - now) * 100) / 100;
                // Update time remaining
                document.getElementById('round_timer').innerText = 'Time remaining: ' + remaining.toString();
            }, 10);
        }
        // Buttons
        for (let opt = 0; opt < question.options.length; opt++) {
            let optionText = question.options[opt];
            let button = helper.element({ tag: 'button', value: opt, html: optionText, parent: questionWrapper, type: 'button' });
            button.addEventListener('click', function (event) {
                let game = Game.getInstance();
                game.submitAnswer(this);
                event.preventDefault();
            });
        }
        // Connected players display
        let connectedUsers = helper.element({ tag: 'div', class: 'connected-players', parent: this.parentElement });
        this.components.playerList = new PlayerList(this, connectedUsers);
    }
    /**
     * Select an answer and submit to server
     */
    submitAnswer(button) {
        let helper = new DOMHelper;
        let answer = JSON.stringify({
            action: "answer_submit",
            answer: button.value
            // winningScore: 10,
            // roundTime: 30
        });
        game.socket.send(answer);
        // Clear question from screen
        let questionWrapper = document.querySelector('.question-wrapper');
        questionWrapper.innerHTML = '';
        helper.element({ tag: 'h1', text: t('Waiting for other players to submit answers...'), parent: questionWrapper });
    }
    /**
     * Show the scores at the end of the game
     *
     * @param data Array of data passed from websocket response
     */
    showGameEndedScreen(data) {
        this.parentElement.innerHTML = '';
        let helper = new DOMHelper;
        let wrapper = helper.element({ tag: 'div', id: 'game_ended', parent: this.parentElement });
        helper.element({ tag: 'h1', text: t('Game ended'), parent: wrapper });
        helper.element({ tag: 'h2', text: t('Thank you for playing'), parent: wrapper });
        for (let p = 0; p < data.players.length; p++) {
            let playerWrapper = helper.element({ tag: 'div', class: 'player-score', parent: wrapper });
            helper.element({ tag: 'p', class: 'player-name', text: data.players[p].username, parent: playerWrapper });
            helper.element({ tag: 'p', class: 'player-score', text: data.players[p].score, parent: playerWrapper });
        }
    }
}
Game.instance = null;
