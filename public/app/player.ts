class Player {

    public username;
    public icon;
    public score;
    public status;
    public isActive: boolean;

    protected game;

    public constructor(game, username) {
        this.username = username;
        this.game = game;
    }

}