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
                            let configForm = new GameConfigForm(game, game.parentElement);
                            game.configForm = configForm.generate(data);
                            game.createPlayerList();
                        }
                        else {
                            // Show awaiting game start screen
                            game.loadAwaitGameStart();
                        }
                        break;
                }
                break;
            case 'player_connected':
                // Check if the player that connected is local player test
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
     * Instantiate the connect to server form
     */
    showLogin() {
        let connectForm = new ConnectForm(this, this.parentElement, this.lastConnection);
        this.connectForm = connectForm.generate();
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
     * Update the playerlist view
     */
    createPlayerList() {
        let helper = new DOMHelper;
        let connectedUsers = helper.element({ tag: 'div', class: 'connected-players', parent: this.parentElement });
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
Game.instance = null; // game object
