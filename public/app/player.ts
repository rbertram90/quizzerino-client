import { Game } from "./game.js";

export class Player {

    public username: string;
    public icon: string;
    public score: string;
    public status: string;
    public isActive: boolean;
    public roundScores: number[];

    protected game;

    public constructor(game: Game, username: string) {
        this.username = username;
        this.game = game;
    }

}
