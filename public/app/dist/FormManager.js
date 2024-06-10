import { GameConfigForm } from "./views/gameconfigform.js";
import { ConnectForm } from "./views/connectform.js";
class FormManager {
    constructor(services) {
        this.forms = {
            connectForm: new ConnectForm(services.domhelper),
            configForm: new GameConfigForm(services.domhelper),
        };
    }
}
export { FormManager };
//# sourceMappingURL=FormManager.js.map