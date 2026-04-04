import { DOMHelper, DOMHelperDivData } from "../domhelper.js";
import { QuizDefinition, QuizMultipleChoiceSetting, QuizSettingValue } from "../messages.js";
import { t } from "../translate.js";

export class GameConfigFormData {
    quizChoice: HTMLSelectElement;
    numberOfQuestions: HTMLInputElement;
    timeLimit: HTMLSelectElement;
    quizSettings: QuizSettingValue[];
}

export class GameConfigForm {
    protected helper: DOMHelper;
    protected callback: CallableFunction;
    protected quizCatalogue: QuizDefinition[];

    // These are populated when form generated
    quizSelect: HTMLSelectElement;
    questionCount: HTMLInputElement;
    timeLimit: HTMLSelectElement;
    quizSettings: QuizSettingValue[];

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
        this.helper.element({ tag:"option", value:"", parent:quizSelect });

        for (let q = 0; q < quizOptions.length; q++) {
            this.helper.element({ tag:"option", value:quizOptions[q].id, text:quizOptions[q].title, parent:quizSelect });
        }

        let quizDescription = this.helper.div({ id:"quiz_description", parent:optionsWrapper, class:"description" });

        quizSelect.addEventListener("change", (event) => {
            const selectedQuiz = quizOptions.find((definition) => definition.id === quizSelect.value);

            if (! selectedQuiz) {
                return;
            }

            quizDescription.innerText = selectedQuiz.description || "";

            const settingsForm = this.generateQuizSettingsForm(selectedQuiz);

            if (settingsForm) {
                quizDescription.after(settingsForm);
            }
        });

        // Number of Questions
        let questionCount = this.helper.numberInput({ label:t("Number of questions"), id:"question_count", min:5, max:100, value:"20", parent:optionsWrapper });

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

    protected generateQuizSettingsForm(quiz: QuizDefinition): HTMLDivElement|null {
        let existingSettingsWrapper = document.getElementById("quiz_settings");
        if (existingSettingsWrapper) {
            existingSettingsWrapper.remove();
        }

        if (! quiz.config) {
            return null;
        }

        const settingsWrapper = this.helper.div({ id: "quiz_settings" });

        quiz.config.forEach((field) => {
            let elementData = { ...field, parent: settingsWrapper };

            if (field.datatype === "number") {
                this.helper.numberInput(elementData);
            }
            if (field.datatype === "select") {
                this.helper.dropdown(elementData as QuizMultipleChoiceSetting);
            }
            if (field.datatype === "text") {
                this.helper.input(elementData);
            }
        });

        return settingsWrapper;
    }

    protected submit() {
        // Remove any existing errors.
        document.querySelectorAll("#game_options .error").forEach((errorElement) => {
            errorElement.remove();
        });

        // Check a quiz has been selected.
        if (! this.quizSelect.value) {
            this.quizSelect.after(this.helper.div({ text:"Please select a quiz.", class:"error" } ));
            return;
        }

        let settingFields = document.querySelectorAll("#quiz_settings input, #quiz_settings select") as NodeListOf<HTMLInputElement|HTMLSelectElement>;

        if (settingFields) {
            this.quizSettings = [];

            settingFields.forEach((formElement) => {
                this.quizSettings.push({ id:formElement.id, value:formElement.value });
            });
        }

        this.callback();
    }
}
