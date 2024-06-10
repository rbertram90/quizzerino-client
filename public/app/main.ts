import { ServiceContainer, Game, GameWindow } from "./game.js";

let container = new ServiceContainer;
let helper = container.domhelper;

let game = Game.getInstance(
    new GameWindow(helper.element({ tag:'div', id:'quiz_game' })),
    container
);

game.showLogin();

export {
    container
};