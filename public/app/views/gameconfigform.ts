import { DOMHelper, DOMHelperDivData } from "../domhelper.js";
import { QuizDefinition } from "../messages.js";
import { t } from "../translate.js";

class GameConfigFormData {
    public quizChoice: HTMLSelectElement;
    public numberOfQuestions: HTMLInputElement;
    public timeLimit: HTMLSelectElement;
}

class GameConfigForm {

    protected helper: DOMHelper;
    protected callback: CallableFunction;
    protected quizCatalogue: QuizDefinition[];

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
    public generate(quizOptions: QuizDefinition[]): HTMLDivElement {
        let optionsWrapper = this.helper.div({ id:"game_options" } as DOMHelperDivData);

        this.helper.element({ tag:"h2", text:t("Game settings"), parent:optionsWrapper });

        this.helper.label({ text:t("Question set"), for:"question_set", parent:optionsWrapper });

        let quizSelect = this.helper.element({ tag:"select", id:"question_set", parent:optionsWrapper }) as HTMLSelectElement;

        for (let q = 0; q < quizOptions.length; q++) {
            this.helper.element({ tag:"option", value:quizOptions[q].id, text:quizOptions[q].title, parent:quizSelect });
        }

        // Number of Questions
        let questionCount = this.helper.numberInput({ label:t("Number of questions"), min:5, max:100, value:"20", parent:optionsWrapper });

        // Round timer
        let timeLimit = <HTMLSelectElement> this.helper.dropdown({ parent:optionsWrapper, id:"time_limit", options:[
            t("No time limit"),
            "10 " + t("seconds"),
            "20 " + t("seconds"),
            "30 " + t("seconds")
        ], label:t("Time limit per question") });

        // Submit button
        this.helper.button({ type:"button", text:t("Start game"), parent:optionsWrapper, click:this.submit.bind(this) });

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