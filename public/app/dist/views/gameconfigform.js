import { t } from "../translate.js";
class GameConfigFormData {
    quizChoice;
    numberOfQuestions;
    timeLimit;
}
class GameConfigForm {
    helper;
    callback;
    quizCatalogue;
    // These are populated when form generated
    quizSelect;
    questionCount;
    timeLimit;
    constructor(domhelper) {
        this.helper = domhelper;
    }
    setSubmitCallback(callback) {
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
    generate(quizOptions) {
        let optionsWrapper = this.helper.div({ id: "game_options" });
        this.helper.element({ tag: "h2", text: t("Game settings"), parent: optionsWrapper });
        this.helper.label({ text: t("Question set"), for: "question_set", parent: optionsWrapper });
        let quizSelect = this.helper.element({ tag: "select", id: "question_set", parent: optionsWrapper });
        for (let q = 0; q < quizOptions.length; q++) {
            this.helper.element({ tag: "option", value: quizOptions[q].id, text: quizOptions[q].title, parent: quizSelect });
        }
        // Number of Questions
        let questionCount = this.helper.numberInput({ label: t("Number of questions"), min: 5, max: 100, value: "20", parent: optionsWrapper });
        // Round timer
        let timeLimit = this.helper.dropdown({ parent: optionsWrapper, id: "time_limit", options: [
                t("No time limit"),
                "10 " + t("seconds"),
                "20 " + t("seconds"),
                "30 " + t("seconds")
            ], label: t("Time limit per question") });
        // Submit button
        this.helper.button({ type: "button", text: t("Start game"), parent: optionsWrapper, click: this.submit.bind(this) });
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
    submit() {
        // Validate?
        // console.log(this);
        this.callback();
    }
}
export { GameConfigFormData, GameConfigForm };
//# sourceMappingURL=gameconfigform.js.map