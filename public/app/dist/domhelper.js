var DOMHelperData = /** @class */ (function () {
    function DOMHelperData() {
        this.text = '';
        this.html = '';
        this["class"] = '';
        this.id = '';
        this.src = '';
        this.alt = '';
        this["for"] = '';
        this.name = '';
    }
    return DOMHelperData;
}());
var DOMHelper = /** @class */ (function () {
    function DOMHelper() {
    }
    DOMHelper.prototype.element = function (data) {
        var element;
        switch (data.tag) {
            case 'input':
                var inputElement = document.createElement(data.tag);
                if (data.placeholder)
                    inputElement.placeholder = data.placeholder;
                if (data.value)
                    inputElement.value = data.value.toString();
                if (data.name)
                    inputElement.name = data.name;
                if (data.type)
                    inputElement.type = data.type;
                element = inputElement;
                break;
            case 'img':
                var imageElement = document.createElement(data.tag);
                if (data.src)
                    imageElement.src = data.src;
                if (data.alt)
                    imageElement.alt = data.alt;
                element = imageElement;
                break;
            case 'button':
                var buttonElement = document.createElement(data.tag);
                if (data.value)
                    buttonElement.value = data.value.toString();
                if (data.type)
                    buttonElement.type = data.type;
                element = buttonElement;
                break;
            case 'option':
                var optionElement = document.createElement(data.tag);
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
        if (data["class"])
            element.className = data["class"];
        if (data.id)
            element.id = data.id;
        if (data["for"])
            element.setAttribute('for', data["for"]);
        if (data.data) {
            Object.keys(data.data).forEach(function (key, index) {
                element.setAttribute('data-' + key, data.data[key]);
            });
        }
        if (data.parent) {
            data.parent.appendChild(element);
        }
        return element;
    };
    DOMHelper.prototype.label = function (data) {
        data.tag = 'label';
        return this.element(data);
    };
    DOMHelper.prototype.dropdown = function (data) {
        data.tag = 'select';
        var elem = this.element(data);
        for (var i = 0; i < data.options.length; i++) {
            var option = this.element({ tag: 'option', text: data.options[i], value: i });
            elem.appendChild(option);
        }
        return elem;
    };
    return DOMHelper;
}());
