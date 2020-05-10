class Component {

    protected game: Game = null;

    constructor (game: Game) {
        this.game = game;
    }

    public sendMessage(message) {
        // todo be implemented by sub-classes
    }

}