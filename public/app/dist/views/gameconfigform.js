class GameConfigFormData {
}
class GameConfigForm {
    constructor(domhelper) {
        this.helper = domhelper;
    }
    setSubmitCallback(callback) {
        this.callback = callback;
        return this;
    }
    /**
     * Generate the game config form
     *
     * @param data Data from server for the config form
     */
    generate(data) {
        let optionsWrapper = this.helper.element({ tag: 'div', id: 'game_options' });
        this.helper.element({ tag: 'h2', text: t('Game settings'), parent: optionsWrapper });
        this.helper.element({ tag: 'label', parent: optionsWrapper, text: t('Question set'), for: 'question_set' });
        // data is passed back in connected_game_status message - we don't have an easy
        // way to make a seperate ajax call to this WS server!
        let options = data.quiz_options;
        let quizSelect = this.helper.element({ tag: 'select', parent: optionsWrapper, id: 'question_set' });
        for (let q = 0; q < options.length; q++) {
            this.helper.element({ tag: 'option', value: options[q].id, text: options[q].title, parent: quizSelect });
        }
        // Number of Questions
        this.helper.element({ tag: 'label', text: t('Number of questions'), parent: optionsWrapper });
        let questionCount = this.helper.element({ tag: 'input', type: 'number', min: 5, max: 100, value: '20', parent: optionsWrapper });
        // Round timer
        this.helper.element({ tag: 'label', text: t('Time limit per question'), for: 'time_limit', parent: optionsWrapper });
        let timeLimit = this.helper.element({ tag: 'select', parent: optionsWrapper, id: 'time_limit' });
        let timeOptions = [
            { value: '0', text: t('No time limit') },
            { value: '1', text: '10 ' + t('seconds') },
            { value: '2', text: '20 ' + t('seconds') },
            { value: '3', text: '30 ' + t('seconds') }
        ];
        for (let a = 0; a < timeOptions.length; a++) {
            this.helper.element({ tag: 'option', value: timeOptions[a].value, text: timeOptions[a].text, parent: timeLimit });
        }
        // Submit button
        let submitButton = this.helper.element({ tag: 'button', type: 'button', text: t('Start game'), parent: optionsWrapper });
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
    submit() {
        // Validate?
        // console.log(this);
        this.callback();
    }
}
export { GameConfigFormData, GameConfigForm };
//# sourceMappingURL=gameconfigform.js.map