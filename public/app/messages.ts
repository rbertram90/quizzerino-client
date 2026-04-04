import { DOMHelperInputData } from "./domhelper.js";
import { Player } from "./player.js";

export interface Message {
    type: string;
}

export interface MessageWithPlayers extends Message {
    players: Player[];
}

export class PlayerConnectedMessage implements MessageWithPlayers {
    type: string;
    players: Player[];
}

export class PlayerDisconnectedMessage implements MessageWithPlayers {
    type: string;
    players: Player[];
}

export class PlayerSubmittedMessage implements MessageWithPlayers {
    type: string;
    players: Player[];
}

export class RoundStartMessage implements MessageWithPlayers {
    type: string;
    players: Player[];
    previousquestion: Question;
    questionNumber: number;
    question: Question;
    roundTime: string;
    roundEndTimeUTC: string;
}

export class GameEndMessage implements MessageWithPlayers {
    type: string;
    players: Player[];
}

export class ConnectedGameStatusMessage implements Message {
    type: string;
    quiz_options: QuizDefinition[];
}

export class QuizDefinition {
    title: string;
    description: string;
    id: string;
    config: (QuizSetting|QuizMultipleChoiceSetting)[];
    controller: string;
}

export class QuizSetting extends DOMHelperInputData {
    datatype:("select"|"text"|"number");
}
export class QuizMultipleChoiceSetting extends QuizSetting {
    options: string[];
}
export class QuizSettingValue {
    id: string;
    value: string;
}

export class Question {
    text: string;
    options: string[];
    correct_option_index: number;
}
