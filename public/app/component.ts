import { Game } from "./game.js";
import { Message } from "./messages.js";

export class Component {

    protected game: Game;

    constructor (game: Game) {
        this.game = game;
    }

    public sendMessage(message: Message) {
        // todo be implemented by sub-classes
    }

}
