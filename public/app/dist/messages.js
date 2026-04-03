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
    settings;
    controller;
}
export class Question {
    text;
    options;
    correct_option_index;
}
//# sourceMappingURL=messages.js.map