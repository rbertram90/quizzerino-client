import { DOMHelperInputData } from "./domhelper.js";
export class PlayerConnectedMessage {
    type;
    players;
}
export class PlayerDisconnectedMessage {
    type;
    players;
}
export class PlayerSubmittedMessage {
    type;
    players;
}
export class RoundStartMessage {
    type;
    players;
    previousquestion;
    questionNumber;
    question;
    roundTime;
    roundEndTimeUTC;
}
export class GameEndMessage {
    type;
    players;
}
export class ConnectedGameStatusMessage {
    type;
    quiz_options;
}
export class QuizDefinition {
    title;
    description;
    id;
    config;
    controller;
}
export class QuizSetting extends DOMHelperInputData {
    datatype;
}
export class QuizMultipleChoiceSetting extends QuizSetting {
    options;
}
export class QuizSettingValue {
    id;
    value;
}
export class Question {
    text;
    options;
    correct_option_index;
}
//# sourceMappingURL=messages.js.map