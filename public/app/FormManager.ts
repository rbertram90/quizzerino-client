import { GameConfigForm } from "./views/gameconfigform.js";
import { ConnectForm } from "./views/connectform.js";
import { ServiceContainer, Game } from "./game.js";

class FormManager {
    public forms: { connectForm: ConnectForm, configForm: GameConfigForm };

    public constructor(services: ServiceContainer) {
        this.forms = {
            connectForm: new ConnectForm(services.domhelper),
            configForm: new GameConfigForm(services.domhelper),
        };
    }
}

export {
    FormManager
};