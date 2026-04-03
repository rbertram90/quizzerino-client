class DOMHelperDataBase {
    text = "";
    html = "";
    class = "";
    id = "";
    src = "";
    alt = "";
    name = "";
    value;
    buttonType;
    /** Data attributes */
    data;
    parent;
    checked;
}
export class DOMHelperData extends DOMHelperDataBase {
    tag;
}
export class DOMHelperInputData extends DOMHelperDataBase {
    label;
    type = "text";
    placeholder;
}
export class DOMHelperNumberInputData extends DOMHelperInputData {
    min;
    max;
}
export class DOMHelperInputLabelData extends DOMHelperDataBase {
    for;
}
export class DOMHelperSelectData extends DOMHelperDataBase {
    label;
    options;
}
export class DOMHelperButtonData extends DOMHelperDataBase {
    type = "button";
    click;
}
export class DOMHelperDivData extends DOMHelperDataBase {
}
export class DOMHelper {
    element(data) {
        let element;
        switch (data.tag) {
            case "input":
                let inputElement = document.createElement(data.tag);
                if (data.value)
                    inputElement.value = data.value.toString();
                if (data.name)
                    inputElement.name = data.name;
                element = inputElement;
                break;
            case "img":
                let imageElement = document.createElement(data.tag);
                if (data.src)
                    imageElement.src = data.src;
                if (data.alt)
                    imageElement.alt = data.alt;
                element = imageElement;
                break;
            case "button":
                let buttonElement = document.createElement(data.tag);
                if (data.value)
                    buttonElement.value = data.value.toString();
                if (data.buttonType)
                    buttonElement.type = data.buttonType;
                element = buttonElement;
                break;
            case "option":
                let optionElement = document.createElement(data.tag);
                if (data.value)
                    optionElement.value = data.value.toString();
                element = optionElement;
                break;
            default:
                element = document.createElement(data.tag);
                break;
        }
        // Inner content
        if (data.text)
            element.innerText = data.text;
        else if (data.html)
            element.innerHTML = data.html;
        // Attributes
        if (data.class)
            element.className = data.class;
        if (data.id)
            element.id = data.id;
        const dataAttributes = data.data || {};
        for (const [key, value] of Object.entries(dataAttributes)) {
            element.setAttribute("data-" + key, value);
        }
        if (data.parent) {
            data.parent.appendChild(element);
        }
        return element;
    }
    label(data) {
        let element = this.element({ tag: "label", ...data });
        element.setAttribute("for", data.for);
        return element;
    }
    numberInput(data) {
        let element = this.input(data);
        element.type = "number";
        if (data.min) {
            element.min = data.min.toString();
        }
        if (data.max) {
            element.max = data.max.toString();
        }
        return element;
    }
    input(data) {
        let element = this.element({ tag: "input", ...data });
        element.type = data.type || "text";
        if (data.placeholder) {
            element.placeholder = data.placeholder;
        }
        if (data.label && data.parent && data.id) {
            const label = this.label({ for: data.id, html: data.label });
            data.parent.appendChild(label);
        }
        return element;
    }
    dropdown(data) {
        const element = this.element({ tag: "select", ...data });
        if (data.label && data.parent && data.id) {
            const label = this.label({ for: data.id, html: data.label });
            data.parent.appendChild(label);
        }
        if (Array.isArray(data.options)) {
            for (let i = 0; i < data.options.length; i++) {
                const option = this.element({ tag: "option", text: data.options[i], value: i });
                element.appendChild(option);
            }
        }
        if (typeof data.options === "function") {
            const options = data.options(element); // @todo work out if this function should return values, or add options directly.
            for (let i = 0; i < data.options.length; i++) {
                const option = this.element({ tag: "option", text: options[i], value: i });
                element.appendChild(option);
            }
        }
        return element;
    }
    checkbox(data) {
        // Generate element first, append label after
        const element = this.input(data);
        element.type = "checkbox";
        if (data.label && data.parent && data.id) {
            const label = this.label({ for: data.id, html: data.label });
            data.parent.appendChild(label);
        }
        return element;
    }
    button(data) {
        const element = this.element({ tag: "button", ...data });
        element.type = data.type;
        if (typeof data.click === "function") {
            element.addEventListener("click", data.click);
        }
        return element;
    }
    div(data) {
        return this.element({ tag: "div", ...data });
    }
}
//# sourceMappingURL=domhelper.js.map