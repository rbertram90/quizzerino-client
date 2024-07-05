import { DOMHelper } from "../domhelper";

class ConnectionData {
    public host: string;
    public port: string|number;
    public username: string;
    public icon: string;
}

class ConnectFormData {
    public form: HTMLFormElement;
    public errors: HTMLDivElement;
    public host: HTMLInputElement;
    public port: HTMLInputElement;
    public username: HTMLInputElement;
    public rememberMe: HTMLInputElement;
    public icon: HTMLInputElement;
    public submitButton: HTMLButtonElement;
}

class ConnectForm {

    protected helper: DOMHelper;
    protected lastConnection: ConnectionData;
    protected data: ConnectFormData;
    protected callback: CallableFunction;

    constructor(domhelper: DOMHelper) {
        this.helper = domhelper;
    }

    public setConnectingStatus() {
        this.data.errors.innerHTML = '<p class="info loader"><img src="/images/ajax-loader.gif">' + t('Connecting to server') + '</p>';
    }

    public setConnectionFailedError() {
        this.data.errors.innerHTML = '<p class="error">' + t('Connection to server failed') + "</p>";
        this.data.username.disabled = false;
        this.data.submitButton.disabled = false;
        this.data.host.disabled = false;
        this.data.port.disabled = false;
    }

    public getFieldValue(fieldName: string) {
        switch (this.data[fieldName].type) {
            case 'checkbox':
                return this.data[fieldName].checked;
            default:
                return this.data[fieldName].value;
        }
    }

    public generate(): HTMLFormElement {
        let username: string;
        let host: string;
        let port: string|number;
        let default_icon: string;
        let remember_me: boolean;
        let lastConnection : string;
    
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
        this.helper.element({ tag:'h2', text:t('Connect to game server'), parent:connectForm });
    
        // Placeholder element for errors
        let errorWrapper = <HTMLDivElement> this.helper.div({ class:'errors', parent:connectForm });
    
        // Host
        let hostWrapper = <HTMLDivElement> this.helper.div({ class:'field', id:'field_host', parent:connectForm });
        let hostField = <HTMLInputElement> this.helper.textField({ id:'connect_host', label:t('Host'), value:host, parent:hostWrapper });
        hostField.setAttribute('required', 'required');
    
        // Port
        let portWrapper = this.helper.div({ class:'field', id:'field_port', parent:connectForm });
        let portField = <HTMLInputElement> this.helper.textField({ id:'connect_port', label:t('Port'), value:port, parent:portWrapper });
        portField.setAttribute('required', 'required');
        portField.setAttribute('size', '4');
    
        // Username
        let usernameWrapper = this.helper.div({ class:'field', id:'field_username', parent:connectForm });
        let usernameField = <HTMLInputElement> this.helper.textField({ id:'username', label:t('Username'), value:username, parent:usernameWrapper });
        usernameField.setAttribute('required', 'required');
    
        // Remember my details?
        let rememberMeWrapper = this.helper.element({ tag:'div', class:'field', id:'field_remember', parent:connectForm });
        let rememberMe = <HTMLInputElement> this.helper.checkbox({ id:'remember_me', parent:rememberMeWrapper, label:t('Remember these details') });
        if (remember_me) {
            rememberMe.checked = true;
        }
    
        // Icon
        let iconWrapper = this.helper.element({ tag:'div', class:'field', id:'field_icon' });
        this.helper.element({ tag:'label', for:'icon', text:t('Player face'), parent:iconWrapper });
        let iconField = <HTMLInputElement> this.helper.element({ tag:'input', type:'hidden', name:'icon', value:default_icon, parent:iconWrapper });
    
        for (let i = 1; i <= 28; i++) {
            let icon = <HTMLImageElement> this.helper.element({ tag:'img', src:`/images/player-icons/${i}.png`, class:'player-icon',
                alt:'Player icon ' + i, data:{ index:i } });
            if (i.toString() == default_icon) icon.className = 'player-icon selected';
    
            icon.addEventListener('click', function() {
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
    
        submitButton.addEventListener('click', this.openConnection.bind(this));
    
        this.data = new ConnectFormData;
        this.data.form = connectForm;
        this.data.errors = errorWrapper;
        this.data.host = hostField;
        this.data.port = portField;
        this.data.username = usernameField;
        this.data.rememberMe = rememberMe;
        this.data.icon = iconField;
        this.data.submitButton = submitButton;

        return connectForm;
    }

    public setSubmitCallback(callback: CallableFunction) {
        this.callback = callback;

        return this;
    }

    protected openConnection(event: Event) {    
        // Validate form
        if (this.data.username.value.length == 0) {
            this.data.errors.innerHTML = '<p class="error">' + t('Please enter a username') + '</p>';
            return;
        }
        if (this.data.host.value.length == 0) {
            this.data.errors.innerHTML = '<p class="error">' + t('Please enter the hosts IP address') + '</p>';
            return;
        }
        if (this.data.port.value.length == 0) {
            this.data.errors.innerHTML = '<p class="error">' + t('Please enter the hosts port number (8080 by default)') + '</p>';
            return;
        }
    
        this.data.username.disabled = true;
        this.data.submitButton.disabled = true;
        this.data.host.disabled = true;
        this.data.port.disabled = true;
    
        this.callback();

        event.preventDefault();
    }
}

export { ConnectForm };