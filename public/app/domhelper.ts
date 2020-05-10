class DOMHelperData {
    public tag: string;
    public text?: string = '';
    public html?: string = '';
    public class?: string = '';
    public id?: string = '';
    public src?: string = '';
    public alt?: string = '';
    public for?: string = '';
    public name?: string = '';
    public value?: string|number;
    public type?: string;
    public placeholder?: string;
    public data?: object;
    public parent?: HTMLElement;
    public options?: string[];
    public checked?: boolean;
}

class DOMHelper {

    public element(data: DOMHelperData) {

        let element: HTMLElement;

        switch (data.tag) {
            case 'input':
                let inputElement = <HTMLInputElement> document.createElement(data.tag);
                if (data.placeholder) inputElement.placeholder = data.placeholder;
                if (data.value) inputElement.value = data.value.toString();
                if (data.name) inputElement.name = data.name;
                if (data.type) inputElement.type = data.type;
                element = inputElement;
                break;
            case 'img':
                let imageElement = <HTMLImageElement> document.createElement(data.tag);
                if (data.src) imageElement.src = data.src;
                if (data.alt) imageElement.alt = data.alt;
                element = imageElement;
                break;
            case 'button':
                let buttonElement = <HTMLButtonElement> document.createElement(data.tag);
                if (data.value) buttonElement.value = data.value.toString();
                if (data.type) buttonElement.type = data.type;
                element = buttonElement;
                break;
            case 'option':
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
        if (data.for) element.setAttribute('for', data.for);        

        if (data.data) {
            Object.keys(data.data).forEach(function(key,index) {
                element.setAttribute('data-' + key, data.data[key]);
            });
        }

        if (data.parent) {
            data.parent.appendChild(element);
        }

        return element;
    }

    public label(data: DOMHelperData) {
        data.tag = 'label';
        return this.element(data);
    }

    public dropdown(data: DOMHelperData) {
        data.tag = 'select';
        var elem = this.element(data);
    
        for (var i=0; i<data.options.length; i++) {
            var option = this.element({ tag:'option', text:data.options[i], value:i });
            elem.appendChild(option);
        }
    
        return elem;
    }

}