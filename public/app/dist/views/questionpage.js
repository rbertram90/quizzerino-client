class QuestionPage {
    /**
     * Called when new question has been initiated
     *
     * @param data Array of data passed from websocket response
     *
     * Example data:
     * {
     *     "type":"round_start",
     *     "question":{
     *         "text":"What was the name of the WWF professional wrestling tag team made up of the wrestlers Ax and Smash?",
     *         "options":["The Dream Team","Demolition","The Bushwhackers","The British Bulldogs"],
     *         "correct_option_index":1
     *     },
     *     "questionNumber":1,
     *     "roundTime":30,
     *     "roundEndTimeUTC":"16039491630",
     *     "players":[
     *         {"username":"player8913","ip":"127.0.0.1","isGameHost":true,"isActive":true,"status":"Thinking...","score":0,"icon":"7"}
     *     ]
     * }
     */
    showQuestionScreen(data) {
        let helper = new DOMHelper;
        let question = data.question;
        // Clear screen
        this.parentElement.innerHTML = '';
        let questionWrapper = helper.element({ tag: 'div', class: 'question-wrapper', parent: this.parentElement });
        // Question text
        helper.element({ tag: 'p', text: t('Question') + ' ' + data.questionNumber, parent: questionWrapper });
        helper.element({ tag: 'h1', html: question.text, parent: questionWrapper });
        // Timer
        if (parseInt(data.roundTime) > 0) {
            helper.element({ tag: 'div', id: 'round_timer', data: { 'round-end-UTC': data.roundEndTimeUTC }, parent: questionWrapper });
            window.setInterval(function () {
                let roundTimerElem = document.getElementById('round_timer');
                // End date
                let endDate = parseInt(roundTimerElem.dataset.roundEndUtc);
                let now = Date.now() / 1000; // convert to seconds
                // Round to 2dp
                let remaining = Math.round((endDate - now) * 100) / 100;
                // Update time remaining
                document.getElementById('round_timer').innerText = 'Time remaining: ' + remaining.toString();
            }, 10);
        }
        // Buttons
        for (let opt = 0; opt < question.options.length; opt++) {
            let optionText = question.options[opt];
            let button = helper.element({ tag: 'button', value: opt, html: optionText, parent: questionWrapper, type: 'button' });
            button.addEventListener('click', function (event) {
                let game = Game.getInstance();
                game.submitAnswer(this);
                event.preventDefault();
            });
        }
        // Connected players display
        // let connectedUsers = helper.element({ tag:'div', class:'connected-players', parent:this.parentElement });
        t; // this.components.playerList = new PlayerList(this, connectedUsers);
    }
}
//# sourceMappingURL=questionpage.js.map