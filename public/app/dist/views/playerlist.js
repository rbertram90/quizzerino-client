import { Component } from "../component.js";
import { t } from "../translate.js";
export default class PlayerList extends Component {
    players = [];
    /**
     * PlayerList component
     *
     * @param game Game object
     */
    constructor(game) {
        super(game);
    }
    sendMessage(message) {
        switch (message.type) {
            case "player_connected":
            case "player_disconnected":
            case "round_start":
            case "player_submitted":
                this.triggerRedraw(message);
                break;
        }
    }
    triggerRedraw(message) {
        this.players = message.players;
        this.redraw();
    }
    redraw() {
        let helper = this.game.service("domhelper");
        let cardWrapper = document.querySelector(".connected-players");
        if (!cardWrapper) {
            cardWrapper = helper.div({ class: "connected-players" });
            this.game.window().appendElement(cardWrapper);
        }
        else {
            cardWrapper.innerHTML = "";
        }
        helper.element({ tag: "h2", text: t("Players"), parent: cardWrapper });
        for (var p = 0; p < this.players.length; p++) {
            var player = this.players[p];
            if (!player.isActive)
                continue;
            var playerWrapper = helper.element({ tag: "div", class: "player-card" });
            // if (player.status == "Card(s) submitted" || player.status == "Card czar") playerWrapper.className = "player-card player-ready";
            if (!player.score)
                player.score = "0";
            helper.element({ tag: "img", src: `/images/player-icons/${player.icon}.png`, alt: t("Player icon"), parent: playerWrapper });
            helper.element({ tag: "span", text: player.score, class: "score", parent: playerWrapper });
            helper.element({ tag: "h4", text: player.username, parent: playerWrapper });
            helper.element({ tag: "p", text: t(player.status), parent: playerWrapper });
            cardWrapper.appendChild(playerWrapper);
        }
    }
}
//# sourceMappingURL=playerlist.js.map