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
}
