class ConnectForm {
    constructor(gameObject, parentElement, lastConnection) {
        this.game = gameObject;
        this.parent = parentElement;
        this.lastConnection = lastConnection;
    }
    generate() {
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
            default_icon = (Math.floor(Math.random() * 20) + 1).toString();
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
        // Form
        let connectForm = document.createElement('form');
        connectForm.id = 'connect_form';
        // Form heading
        helper.element({ tag: 'h2', text: t('Connect to game server'), parent: connectForm });
        // Placeholder element for errors
        let errorWrapper = helper.div({ class: 'errors', parent: connectForm });
        // Host
        let hostWrapper = helper.div({ class: 'field', id: 'field_host', parent: connectForm });
        let hostField = helper.textField({ id: 'connect_host', label: t('Host'), value: host, parent: hostWrapper });
        hostField.setAttribute('required', 'required');
        // Port
        let portWrapper = helper.div({ class: 'field', id: 'field_port', parent: connectForm });
        let portField = helper.textField({ id: 'connect_port', label: t('Port'), value: port, parent: portWrapper });
        portField.setAttribute('required', 'required');
        portField.setAttribute('size', '4');
        // Username
        let usernameWrapper = helper.div({ class: 'field', id: 'field_username', parent: connectForm });
        let usernameField = helper.textField({ id: 'username', label: t('Username'), value: username, parent: usernameWrapper });
        usernameField.setAttribute('required', 'required');
        // Remember my details?
        let rememberMeWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_remember', parent: connectForm });
        let rememberMe = helper.checkbox({ id: 'remember_me', parent: rememberMeWrapper, label: t('Remember these details') });
        if (remember_me) {
            rememberMe.checked = true;
        }
        // Icon
        let iconWrapper = helper.element({ tag: 'div', class: 'field', id: 'field_icon' });
        helper.element({ tag: 'label', for: 'icon', text: t('Player face'), parent: iconWrapper });
        let iconField = helper.element({ tag: 'input', type: 'hidden', name: 'icon', value: default_icon, parent: iconWrapper });
        for (let i = 1; i <= 28; i++) {
            let icon = helper.element({ tag: 'img', src: `/images/player-icons/${i}.png`, class: 'player-icon',
                alt: 'Player icon ' + i, data: { index: i } });
            if (i.toString() == default_icon)
                icon.className = 'player-icon selected';
            icon.addEventListener('click', function () {
                iconField.value = this.dataset.index;
                let elements = document.querySelectorAll('#field_icon img.player-icon');
                for (let e = 0; e < elements.length; e++) {
                    elements[e].className = 'player-icon';
                }
                this.className = 'player-icon selected';
            });
            iconWrapper.appendChild(icon);
        }
        connectForm.appendChild(iconWrapper);
        // Actions
        let actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'actions';
        connectForm.appendChild(actionsWrapper);
        let submitButton = document.createElement('button');
        submitButton.id = 'connect_button';
        submitButton.type = 'button';
        submitButton.innerText = t('Connect');
        actionsWrapper.appendChild(submitButton);
        submitButton.addEventListener('click', game.openConnection);
        this.parent.appendChild(connectForm);
        return {
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
}
