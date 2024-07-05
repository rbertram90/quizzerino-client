import { DOMHelper } from "../domhelper";

class GameConfigFormData {
    public quizChoice: HTMLSelectElement;
    public numberOfQuestions: HTMLInputElement;
    public timeLimit: HTMLSelectElement;
}

class GameConfigForm {

    protected helper: DOMHelper;
    protected callback: CallableFunction

    // These are populated when form generated
    public quizSelect: HTMLSelectElement;
    public questionCount: HTMLInputElement;
    public timeLimit: HTMLSelectElement;

    constructor(domhelper: DOMHelper) {
        this.helper = domhelper;
    }

    public setSubmitCallback(callback: CallableFunction) {
        this.callback = callback;

        return this;
    }

    /**
     * Generate the game config form.
     * 
     * @param data Data from server for the config form
     * 
     * Only thing that is used from data is quiz_options!
     */
    public generate(quizOptions): HTMLDivElement {
        let optionsWrapper = <HTMLDivElement> this.helper.div({ id:'game_options' });

        this.helper.element({ tag:'h2', text:t('Game settings'), parent:optionsWrapper });

        this.helper.label({ text:t('Question set'), for:'question_set', parent:optionsWrapper });

        let quizSelect = <HTMLSelectElement> this.helper.element({ tag:'select', id:'question_set', parent:optionsWrapper });

        for (let q = 0; q < quizOptions.length; q++) {
            this.helper.element({ tag:'option', value:quizOptions[q].id, text:quizOptions[q].title, parent:quizSelect });
        }

        // Number of Questions
        this.helper.element({ tag:'label', text:t('Number of questions'), parent:optionsWrapper });
        let questionCount = <HTMLInputElement> this.helper.element({ tag:'input', type:'number', min:5, max:100, value:'20', parent:optionsWrapper });

        // Round timer
        this.helper.element({ tag:'label', text:t('Time limit per question'), for:'time_limit', parent:optionsWrapper });
        let timeLimit = <HTMLSelectElement> this.helper.dropdown({ tag:'select', parent:optionsWrapper, id:'time_limit', options:[
            t('No time limit'),
            '10 ' + t('seconds'),
            '20 ' + t('seconds'),
            '30 ' + t('seconds')
        ] });

        // Submit button
        let submitButton = this.helper.element({ tag:'button', type:'button', text:t('Start game'), parent:optionsWrapper });
        submitButton.addEventListener('click', this.submit.bind(this));

        // Return object with all the fields that will be referenced when starting game
        // todo: put these in class variables
        // let returnData = new GameConfigFormData;
        // returnData.quizChoice = quizSelect;
        // returnData.numberOfQuestions = questionCount;
        // returnData.timeLimit = timeLimit;
        this.timeLimit = timeLimit;
        this.questionCount = questionCount;
        this.quizSelect = quizSelect;

        return optionsWrapper;
    }

    protected submit() {
        // Validate?
        // console.log(this);

        this.callback();
    }
}

export {
    GameConfigFormData,
    GameConfigForm
};