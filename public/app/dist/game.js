import { DOMHelper } from "./domhelper.js";
import PlayerList from "./views/playerlist.js";
import { FormManager } from "./FormManager.js";
import { Player } from "./player.js";
import { t } from "./translate.js";
export class ServiceContainer {
    domhelper;
    formManager;
    constructor() {
        this.domhelper = new DOMHelper;
        this.formManager = new FormManager(this);
    }
}
export class GameWindow {
    element;
    constructor(element) {
        this.element = element;
        document.body.appendChild(element);
    }
    clear() {
        this.element.innerHTML = "";
    }
    appendElement(parent) {
        this.element.appendChild(parent);
        // this.element.innerHTML = html;
    }
    addEventListener(type, callback) {
        this.element.addEventListener(type, callback);
    }
    dispatchEvent(event) {
        this.element.dispatchEvent(event);
    }
}
export class Game {
    gamewindow;
    formManager;
    static instance;
    socket;
    clientIsGameHost = false;
    player = null;
    components; // @todo sure this can be improved!?
    services;
    socketOpened = false;
    availableQuizzes = null;
    constructor(gamewindow, serviceContainer) {
        this.services = serviceContainer;
        this.gamewindow = gamewindow;
        this.formManager = this.services.formManager;
        this.formManager.forms.connectForm.setSubmitCallback(this.createServerConnection.bind(this));
        this.formManager.forms.configForm.setSubmitCallback(this.startGame.bind(this));
        this.components = {
            playerList: new PlayerList(this)
        };
        Game.instance = this;
    }
    static getInstance(gamewindow, serviceContainer) {
        if (Game.instance) {
            return Game.instance;
        }
        else {
            return new Game(gamewindow, serviceContainer);
        }
    }
    window() {
        return this.gamewindow;
    }
    service(service) {
        return this.services[service];
    }
    createServerConnection() {
        let game = this;
        let form = this.formManager.forms.connectForm;
        form.setConnectingStatus();
        let host = form.getFieldValue("host");
        let port = form.getFieldValue("port");
        let username = form.getFieldValue("username");
        let icon = form.getFieldValue("icon");
        let rememberMe = form.getFieldValue("rememberMe");
        this.socket = new WebSocket(`ws://${host}:${port}`);
        this.socket.onopen = function () {
            game.socketOpened = true;
            // Show either waiting for game to start or game options
            game.socket.send(`{ "action": "player_connected", "username": "${username}", "icon": "${icon}" }`);
            if (rememberMe) {
                window.localStorage.setItem("last_server_connection", JSON.stringify({
                    host: host,
                    port: port,
                    username: username,
                    icon: icon
                }));
            }
            else {
                window.localStorage.removeItem("last_server_connection");
            }
        };
        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onclose = (event) => {
            if (!game.socketOpened) {
                let form = game.formManager.forms.connectForm;
                form.setConnectionFailedError();
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
        let game = this;
        switch (data.type) {
            case "connected_game_status":
                const connectForm = game.formManager.forms.connectForm;
                const username = connectForm.getFieldValue("username");
                this.player = new Player(game, `${username}`);
                this.availableQuizzes = data.quiz_options;
                switch (data.game_status) {
                    // Awaiting game start
                    case 0:
                        if (data.host === null || data.host.username === this.player.username) {
                            this.showGameConfigForm();
                        }
                        else {
                            game.loadAwaitGameStart();
                        }
                        break;
                }
                break;
            case "player_connected":
                // Check if the player that connected is local player test
                // If they are game host then enable buttons
                if (data.host) {
                    game.clientIsGameHost = true;
                }
                break;
            case "round_start":
                if (data.previousquestion) {
                    game.showPreviousRoundSummary(data);
                    setTimeout(() => {
                        game.showQuestionScreen(data);
                    }, 3000);
                }
                else {
                    game.showQuestionScreen(data);
                }
                break;
            case "game_end":
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
        this.gamewindow.appendElement(this.services.formManager.forms.connectForm.generate());
    }
    /**
     * Show the game config form.
     *
     * Requires this.availableQuizzes to be populated.
     */
    showGameConfigForm() {
        this.gamewindow.clear();
        const configForm = this.formManager.forms.configForm;
        this.gamewindow.appendElement(configForm.generate(this.availableQuizzes || []));
        this.components.playerList?.redraw();
    }
    /**
     * Called for users that are NOT the host when joining
     * the server before the game has started
     *
     * Shows a "waiting for game to start" screen
     */
    loadAwaitGameStart() {
        this.gamewindow.clear();
        let helper = this.services.domhelper;
        let wrapper = helper.element({ tag: "div", id: "awaiting_game_start" });
        let lhs = helper.element({ tag: "div", class: "waiting_panel", parent: wrapper });
        helper.element({ tag: "h2", text: t("Waiting for host to start the game..."), parent: lhs });
        helper.element({ tag: "img", src: "/images/waiting.gif", alt: t("Humorous animation of a person waiting"), parent: lhs });
        // let connectedUsers = helper.element({ tag:"div", class:"connected-players", parent:wrapper });
        // this.components.playerList = new PlayerList(this);
        this.gamewindow.appendElement(wrapper);
    }
    /**
     * Run from host computer
     * Sends message to server to start the game
     *
     * @param event Click event from start button
     */
    startGame() {
        let configForm = this.services.formManager.forms.configForm;
        let config = JSON.stringify({
            action: "start_game",
            quiz: configForm.quizSelect.value,
            numberOfQuestions: configForm.questionCount.value,
            timeLimit: configForm.timeLimit.value
        });
        this.socket.send(config);
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
        let helper = this.services.domhelper;
        let question = data.question;
        let game = this;
        this.gamewindow.clear();
        let questionWrapper = helper.element({ tag: "div", class: "question-wrapper" });
        // Question text
        helper.element({ tag: "p", text: t("Question") + " " + data.questionNumber, parent: questionWrapper });
        helper.element({ tag: "h1", html: question.text, parent: questionWrapper });
        // Timer
        if (parseInt(data.roundTime) > 0) {
            helper.element({ tag: "div", id: "round_timer", data: { "round-end-UTC": data.roundEndTimeUTC }, parent: questionWrapper });
            window.setInterval(function () {
                let roundTimerElem = document.getElementById("round_timer");
                if (!roundTimerElem) {
                    return;
                }
                // End date
                let endDate = parseInt(roundTimerElem.dataset.roundEndUtc || "");
                let now = Date.now() / 1000; // convert to seconds
                // Round to 2dp
                let remaining = Math.round((endDate - now) * 100) / 100;
                // Update time remaining
                roundTimerElem.innerText = "Time remaining: " + remaining.toString();
            }, 10);
        }
        // Buttons
        for (let opt = 0; opt < question.options.length; opt++) {
            let optionText = question.options[opt];
            // Convert value to string as otherwise no value is added for 0.
            let button = helper.button({ value: opt.toString(), html: optionText, parent: questionWrapper, type: "button" });
            button.addEventListener("click", function (event) {
                game.submitAnswer(this);
                event.preventDefault();
            });
        }
        this.gamewindow.appendElement(questionWrapper);
    }
    /**
     * Select an answer and submit to server
     */
    submitAnswer(button) {
        let helper = new DOMHelper;
        let answer = JSON.stringify({
            action: "answer_submit",
            answer: button.value
        });
        this.socket.send(answer);
        // Clear question from screen
        let questionWrapper = document.querySelector(".question-wrapper");
        questionWrapper.innerHTML = "";
        helper.element({ tag: "h1", text: t("Waiting for other players to submit answers..."), parent: questionWrapper });
    }
    showPreviousRoundSummary(data) {
        this.gamewindow.clear();
        const previousQuestion = data.previousquestion;
        const dom = this.services.domhelper;
        const wrapper = dom.div({});
        dom.element({ tag: "h1", text: `Results from question ${data.questionNumber - 1}`, parent: wrapper });
        dom.element({ tag: "h2", text: previousQuestion.text, parent: wrapper });
        dom.element({ tag: "p", text: `Correct answer: ${previousQuestion.options[previousQuestion.correct_option_index]}`, parent: wrapper });
        for (let p = 0; p < data.players.length; p++) {
            const player = data.players[p];
            const correct = player.roundScores[player.roundScores.length - 1] > 0 ? "Correct" : "Incorrect";
            dom.element({ tag: "p", text: `${player.username}: ${correct}`, parent: wrapper });
        }
        this.gamewindow.appendElement(wrapper);
    }
    /**
     * Show the scores at the end of the game
     *
     * @param data Array of data passed from websocket response
     */
    showGameEndedScreen(data) {
        this.gamewindow.clear();
        let helper = new DOMHelper;
        let wrapper = helper.element({ tag: "div", id: "game_ended" });
        helper.element({ tag: "h1", text: t("Game ended"), parent: wrapper });
        helper.element({ tag: "h2", text: t("Thank you for playing"), parent: wrapper });
        data.players.sort((first, second) => {
            if (first.score === second.score) {
                return 0;
            }
            return first.score > second.score ? -1 : 1;
        });
        for (let p = 0; p < data.players.length; p++) {
            let playerWrapper = helper.element({ tag: "div", class: "player-score", parent: wrapper });
            helper.element({ tag: "p", class: "player-name", text: data.players[p].username, parent: playerWrapper });
            helper.element({ tag: "p", class: "player-score", text: data.players[p].score, parent: playerWrapper });
        }
        if (this.clientIsGameHost) {
            const newRoundButton = helper.element({ tag: "button", id: "new_round", text: t("Start a new game, keeping current scores"), parent: wrapper });
            newRoundButton.addEventListener("click", this.showGameConfigForm.bind(this));
            helper.element({ tag: "button", id: "new_round_reset", text: t("Start a new game and reset scores"), parent: wrapper });
        }
        this.gamewindow.appendElement(wrapper);
    }
}
//# sourceMappingURL=game.js.map