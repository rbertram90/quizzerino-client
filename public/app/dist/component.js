var Component = /** @class */ (function () {
    function Component(game) {
        this.game = null;
        this.game = game;
    }
    Component.prototype.sendMessage = function (message) {
        // todo be implemented by sub-classes
    };
    return Component;
}());
