class DOMHelperDataBase {
    public text?: string = "";
    public html?: string = "";
    public class?: string = "";
    public id?: string = "";
    public src?: string = "";
    public alt?: string = "";
    public name?: string = "";
    public value?: string|number;
    public buttonType?: "button"|"submit"|"reset"

    /** Data attributes */
    public data?: object;
    public parent?: HTMLElement;
    public checked?: boolean;
}

export class DOMHelperData extends DOMHelperDataBase {
    public tag: string;
}

export class DOMHelperInputData extends DOMHelperDataBase {
    public label?: string;
    public type?: string = "text";
    public placeholder?: string;
}

export class DOMHelperNumberInputData extends DOMHelperInputData {
    public min?: number;
    public max?: number;
}

export class DOMHelperInputLabelData extends DOMHelperDataBase {
    public for: string;
}

export class DOMHelperSelectData extends DOMHelperDataBase {
    public label?: string;
    public options: string[]|CallableFunction;
}

export class DOMHelperButtonData extends DOMHelperDataBase {
    public type: "button" | "submit" | "reset" = "button";
    public click?: (this: HTMLButtonElement, ev: PointerEvent) => any;
}

export class DOMHelperDivData extends DOMHelperDataBase {}

export class DOMHelper {

    public element(data: DOMHelperData): HTMLElement {
        let element: HTMLElement;

        switch (data.tag) {
            case "input":
                let inputElement = <HTMLInputElement> document.createElement(data.tag);
                if (data.value) inputElement.value = data.value.toString();
                if (data.name) inputElement.name = data.name;
                element = inputElement;
                break;

            case "img":
                let imageElement = <HTMLImageElement> document.createElement(data.tag);
                if (data.src) imageElement.src = data.src;
                if (data.alt) imageElement.alt = data.alt;
                element = imageElement;
                break;

            case "button":
                let buttonElement = <HTMLButtonElement> document.createElement(data.tag);
                if (data.value) buttonElement.value = data.value.toString();
                if (data.buttonType) buttonElement.type = data.buttonType;
                element = buttonElement;
                break;

            case "option":
                let optionElement = <HTMLOptionElement> document.createElement(data.tag);
                if (data.value) optionElement.value = data.value.toString();
                element = optionElement;
                break;

            default:
                element = document.createElement(data.tag);
                break;
        }

        // Inner content
        if (data.text) element.innerText = data.text;
        else if (data.html) element.innerHTML = data.html;

        // Attributes
        if (data.class)  element.className = data.class;
        if (data.id) element.id = data.id;

        const dataAttributes = data.data || {};
        for (const [key, value] of Object.entries(dataAttributes)) {
            element.setAttribute("data-" + key, value);
        }

        if (data.parent) {
            data.parent.appendChild(element);
        }

        return element;
    }

    public label(data: DOMHelperInputLabelData): HTMLLabelElement {
        let element = this.element({ tag: "label", ...data }) as HTMLLabelElement;

        element.setAttribute("for", data.for);

        return element;
    }

    public numberInput(data: DOMHelperNumberInputData): HTMLInputElement {
        let element = this.input(data) as HTMLInputElement;

        element.type = "number";

        if (data.min) {
            element.min = data.min.toString();
        }
        if (data.max) {
            element.max = data.max.toString();
        }

        return element;
    }

    public input(data: DOMHelperInputData): HTMLInputElement {
        let element = this.element({ tag: "input", ...data }) as HTMLInputElement;

        element.type = data.type || "text";

        if (data.placeholder) {
            element.placeholder = data.placeholder;
        }
   
        if (data.label && data.parent && data.id) {
            const label = this.label({ for:data.id, html:data.label } as DOMHelperInputLabelData);

            data.parent.appendChild(label);
        }
    
        return element;
    }

    public dropdown(data: DOMHelperSelectData) {
        const element = this.element({ tag: "select", ...data });

        if (data.label && data.parent && data.id) {
            const label = this.label({ for:data.id, html:data.label } as DOMHelperInputLabelData);

            data.parent.appendChild(label);
        }

        if (Array.isArray(data.options)) {
            for (let i = 0; i < data.options.length; i++) {
                const option = this.element({ tag:"option", text:data.options[i], value:i });

                element.appendChild(option);
            }
        }

        if (typeof data.options === "function") {
            const options = data.options(element); // @todo work out if this function should return values, or add options directly.

            for (let i = 0; i < data.options.length; i++) {
                const option = this.element({ tag:"option", text:options[i], value:i });

                element.appendChild(option);
            }
        }
    
        return element;
    }

    public checkbox(data: DOMHelperInputData): HTMLInputElement {
        // Generate element first, append label after
        const element = this.input(data);

        element.type = "checkbox";

        if (data.label && data.parent && data.id) {
            const label = this.label({ for:data.id, html:data.label } as DOMHelperInputLabelData);

            data.parent.appendChild(label);
        }

        return element
    }

    public button(data: DOMHelperButtonData): HTMLButtonElement {
        const element = this.element({ tag: "button", ...data }) as HTMLButtonElement;

        element.type = data.type;

        if (typeof data.click === "function") {
            element.addEventListener("click", data.click);
        }

        return element;
    }

    public div(data: DOMHelperDivData): HTMLDivElement {
        return this.element({ tag: "div", ...data }) as HTMLDivElement;
    }

}
