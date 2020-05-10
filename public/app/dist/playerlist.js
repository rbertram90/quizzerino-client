var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PlayerList = /** @class */ (function (_super) {
    __extends(PlayerList, _super);
    /**
     * PlayerList component
     *
     * @param game Game object
     * @param parent Element to attach player list to
     */
    function PlayerList(game, parent) {
        var _this = _super.call(this, game) || this;
        _this.game = null;
        _this.parentElement = null;
        _this.players = [];
        _this.parentElement = parent;
        return _this;
    }
    PlayerList.prototype.sendMessage = function (message) {
        switch (message.type) {
            case 'player_connected':
            case 'player_disconnected':
            case 'round_start':
            case 'player_submitted':
                this.triggerRedraw(message);
                break;
        }
    };
    PlayerList.prototype.triggerRedraw = function (message) {
        this.players = message.players;
        this.redraw();
    };
    ;
    PlayerList.prototype.redraw = function () {
        var helper = new DOMHelper;
        this.parentElement.innerHTML = '';
        helper.element({ tag: 'h2', text: t('Players'), parent: this.parentElement });
        for (var p = 0; p < this.players.length; p++) {
            var player = this.players[p];
            if (!player.isActive)
                continue;
            var playerWrapper = helper.element({ tag: 'div', "class": 'player-card', parent: this.parentElement });
            // if (player.status == 'Card(s) submitted' || player.status == 'Card czar') playerWrapper.className = 'player-card player-ready';
            if (!player.score)
                player.score = '0';
            helper.element({ tag: 'img', src: '/images/player-icons/' + player.icon + '.png', alt: t('Player icon'), parent: playerWrapper });
            helper.element({ tag: 'span', text: player.score, "class": 'score', parent: playerWrapper });
            helper.element({ tag: 'h4', text: player.username, parent: playerWrapper });
            helper.element({ tag: 'p', text: t(player.status), parent: playerWrapper });
        }
    };
    return PlayerList;
}(Component));
