class DOMHelperData {
    constructor() {
        this.text = '';
        this.html = '';
        this.class = '';
        this.id = '';
        this.src = '';
        this.alt = '';
        this.for = '';
        this.name = '';
    }
}
class DOMHelper {
    element(data) {
        let element;
        switch (data.tag) {
            case 'input':
                let inputElement = document.createElement(data.tag);
                if (data.placeholder)
                    inputElement.placeholder = data.placeholder;
                if (data.value)
                    inputElement.value = data.value.toString();
                if (data.name)
                    inputElement.name = data.name;
                if (data.type)
                    inputElement.type = data.type;
                if (data.type == 'number' && data.min)
                    inputElement.min = data.min.toString();
                if (data.type == 'number' && data.max)
                    inputElement.max = data.max.toString();
                element = inputElement;
                break;
            case 'img':
                let imageElement = document.createElement(data.tag);
                if (data.src)
                    imageElement.src = data.src;
                if (data.alt)
                    imageElement.alt = data.alt;
                element = imageElement;
                break;
            case 'button':
                let buttonElement = document.createElement(data.tag);
                if (data.value)
                    buttonElement.value = data.value.toString();
                if (data.buttonType)
                    buttonElement.type = data.buttonType;
                element = buttonElement;
                break;
            case 'option':
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
        if (data.for)
            element.setAttribute('for', data.for);
        if (data.data) {
            Object.keys(data.data).forEach(function (key, index) {
                element.setAttribute('data-' + key, data.data[key]);
            });
        }
        if (data.parent) {
            data.parent.appendChild(element);
        }
        return element;
    }
    label(data) {
        data.tag = 'label';
        return this.element(data);
    }
    textField(data) {
        data.tag = 'input';
        data.type = 'text';
        if (data.label && data.parent && data.id) {
            var label = this.label({ for: data.id, html: data.label });
            data.parent.appendChild(label);
        }
        return this.element(data);
    }
    dropdown(data) {
        data.tag = 'select';
        var elem = this.element(data);
        for (var i = 0; i < data.options.length; i++) {
            var option = this.element({ tag: 'option', text: data.options[i], value: i });
            elem.appendChild(option);
        }
        return elem;
    }
    checkbox(data) {
        data.tag = 'input';
        data.type = 'checkbox';
        // Generate element first, so label appended after
        let element = this.element(data);
        if (data.label && data.parent && data.id) {
            var label = this.label({ for: data.id, html: data.label });
            data.parent.appendChild(label);
        }
        return element;
    }
    div(data) {
        data.tag = 'div';
        return this.element(data);
    }
}
