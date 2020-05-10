class ConnectionData {
    public host: string;
    public port: string|number;
    public username: string;
    public icon: string;
}

class Game {

    protected lastConnection: ConnectionData;
    protected parentElement: HTMLElement = null;
    protected static instance : Game = null;
    protected connectForm = null;
    protected configForm = null;
    protected socket: WebSocket = null;
    protected clientIsGameHost: boolean = false;
    protected player: Player = null;
    protected components = {
        playerList: null
    };

    protected constructor() {
        let helper = new DOMHelper();
        this.parentElement = helper.element({ tag:'div', id:'quiz_game' });
        document.body.appendChild(this.parentElement);
        Game.instance = this;
    }

    public static getInstance(): Game {
        if (Game.instance) {
            return Game.instance;
        }
        else {
            return new Game();
        }
    }

    public showLogin() {
        let username: string;
        let host: string;
        let port: string|number;
        let default_icon: string;
        let remember_me: boolean;
        let lastConnection : string;
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
        var errorWrapper = helper.element({ tag:'div', class:'errors' });
        connectForm.appendChild(errorWrapper);
    
        // Host
        var hostWrapper = helper.element({ tag:'div', class:'field', id:'field_host' });
        connectForm.appendChild(hostWrapper);
        var hostLabel = helper.element({ tag:'label', for:'connect_host', text: t('Host') });
        hostWrapper.appendChild(hostLabel);
        var hostField = helper.element({ tag:'input', type: 'text', id:'connect_host', value: host });
        hostField.setAttribute('required', 'required');
        hostWrapper.appendChild(hostField);
    
        // Port
        var portWrapper = helper.element({ tag:'div', class:'field', id:'field_port' });
        connectForm.appendChild(portWrapper);
        var portLabel = helper.element({ tag:'label', for:'connect_port', text: t('Port') });
        portWrapper.appendChild(portLabel);
        var portField = helper.element({ tag:'input', type: 'text', id:'connect_port', value: port });
        portField.setAttribute('required', 'required');
        portField.setAttribute('size', '4');
        portWrapper.appendChild(portField);
    
        // Username
        var usernameWrapper = helper.element({ tag:'div', class:'field', id:'field_username' });
        connectForm.appendChild(usernameWrapper);
        var usernameLabel = helper.element({ tag:'label', for:'username', text: t('Username') });
        usernameWrapper.appendChild(usernameLabel);
        var usernameField = helper.element({ tag:'input', type: 'text', id:'username', value: username });
        usernameField.setAttribute('required', 'required');
        usernameWrapper.appendChild(usernameField);
    
        var rememberMeWrapper = helper.element({ tag:'div', class: 'field', id: 'field_remember' });
        var rememberMe = <HTMLInputElement> helper.element({ tag: 'input', id: 'remember_me', type: 'checkbox' });
        var rememberMeLabel = helper.element({ tag: 'label', for: 'remember_me', text: t('Remember these details') });
        if (remember_me) {
            rememberMe.checked = true;
        }
    
        rememberMeWrapper.appendChild(rememberMe);
        rememberMeWrapper.appendChild(rememberMeLabel);
        connectForm.appendChild(rememberMeWrapper);
    
        // Icon
        var iconWrapper = helper.element({ tag:'div', class:'field', id:'field_icon' });
        var iconLabel = helper.element({ tag:'label', for:'icon', text:t('Player face') });
        var iconField = <HTMLInputElement> helper.element({ tag:'input', type:'hidden', name:'icon', value:default_icon });
        iconWrapper.appendChild(iconLabel);
        iconWrapper.appendChild(iconField);
    
        for (var i = 1; i <= 28; i++) {
            var icon = <HTMLImageElement> helper.element({ tag: 'img', src: '/images/player-icons/' + i + '.png', class: 'player-icon',
                alt: 'Player icon ' + i, data: { index:i } });
            if (i.toString() == default_icon) icon.className = 'player-icon selected';
    
            icon.addEventListener('click', function() {
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

    public openConnection(event: Event) {

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

    public createServerConnection() {
        let game = this;
        let form = game.connectForm;
        form.errors.innerHTML = '<p class="info loader"><img src="/images/ajax-loader.gif">' + t('Connecting to server') + '</p>';
        let host = form.host.value;
        let port = form.port.value;
        let username = form.username.value;
        let icon = form.icon.value;
        let rememberMe = form.rememberMe.checked;
    
        game.socket = new WebSocket('ws://' + host + ':' + port);
    
        game.socket.onopen = function(e) {
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
    
        game.socket.onclose = function(event) {
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

    public handleMessage(message: MessageEvent) {
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
            
        }

        game.updateComponents(data);
    }

    public updateComponents(message: MessageEvent) {
        for (var i in this.components) {
            if (this.components[i]) {
                this.components[i].sendMessage(message);
            }
        }
    }

    public loadConfigForm(data) {
        let helper = new DOMHelper;
        let optionsWrapper = helper.element({ tag:'div', id:'game_options', parent:this.parentElement });

        // data is passed back in connected_game_status message - we don't have an easy
        // way to make a seperate ajax call to this WS server!
        let options = data.quiz_options;
        let quizSelect = helper.element({ tag:'select', parent:optionsWrapper });

        for (var q = 0; q < options.length; q++) {
            helper.element({ tag:'option', value:options[q].id, text:options[q].title, parent:quizSelect });
        }

        let submitButton = helper.element({ tag:'button', type:'button', text:t('Start game'), parent:optionsWrapper });
        submitButton.addEventListener('click', this.startGame);

        let connectedUsers = helper.element({ tag:'div', id:'connected_users', parent:this.parentElement });
        this.components.playerList = new PlayerList(this, connectedUsers);

        // Return object with all the fields that will be referenced when starting game
        return {
            quizChoice: quizSelect
        };
    }
    
    public loadAwaitGameStart() {
        let helper = new DOMHelper;
        let wrapper = helper.element({ tag:'div', id:'awaiting_game_start', parent:this.parentElement });

        let lhs = helper.element({ tag:'div', class:'waiting_panel', parent:wrapper });
        helper.element({ tag:'h2', text:t('Waiting for host to start the game...'), parent:lhs });
        helper.element({ tag:'img', src:'/images/waiting.gif', alt:t('Humorous animation of a person waiting'), parent:lhs });
        
        let connectedUsers = helper.element({ tag:'div', id:'connected_users', parent:wrapper });
        this.components.playerList = new PlayerList(this, connectedUsers);
    }

    public startGame(event: Event) {
        let game = Game.getInstance();
        let config = JSON.stringify({
            action: "start_game",
            quiz: game.configForm.quizChoice.value
            // winningScore: 10,
            // roundTime: 30
        });
        game.socket.send(config);
        event.preventDefault();
    }

    public showQuestionScreen(data) {
        let helper = new DOMHelper;
        let question = data.question;

        // Clear screen
        this.parentElement.innerHTML = '';

        helper.element({ tag:'p', text:t('Question') + ' ' + data.questionNumber, parent:this.parentElement });
        helper.element({ tag:'h1', text:question.text, parent:this.parentElement });
        
        for (let opt = 0; opt < question.options.length; opt++) {
            let optionText = question.options[opt];
            let button = helper.element({ tag:'button', value:opt, text:optionText, parent:this.parentElement, type:'button' });

            button.addEventListener('click', function (event) {
                let thisButton = <HTMLButtonElement> this;

                let answer = JSON.stringify({
                    action: "answer_submit",
                    answer: thisButton.value
                    // winningScore: 10,
                    // roundTime: 30
                });
                game.socket.send(answer);

                event.preventDefault();
            });
        }

    }

}