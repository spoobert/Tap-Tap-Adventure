var Combat = require('../../js/game/entity/character/combat/combat'),
    Utils = require('../../js/util/utils'),
    Messages = require('../../js/network/messages'),
    Modules = require('../../js/util/modules');

module.exports = PirateCaptain = Combat.extend({

    init: function(character) {
        var self = this;

        self._super(character);
        self.character = character;

        character.spawnDistance = 20;

        self.teleportLocations = [];

        self.lastTeleportIndex = 0;
        self.lastTeleport = 0;

        self.location = {
            x: self.character.x,
            y: self.character.y
        };

        self.load();
    },

    load: function() {
        var self = this,
            south = { x: 251, y: 574 },
            west = { x: 243, y: 569 },
            east = { x: 258, y: 568 },
            north = { x: 251, y: 563 };

        self.teleportLocations.push(north, south, west, east);
    },

    hit: function(character, target, hitInfo) {
        var self = this;
        if (self.canTeleport())
            self.teleport();
        else
            self._super(character, target, hitInfo);
    },

    teleport: function() {
        var self = this,
            position = self.getRandomPosition();

        if (!position)
            return;

        self.stop();

        self.lastTeleport = new Date().getTime();
        self.lastTeleportIndex = position.index;

        self.character.setPosition(position.x, position.y);

        if (self.world)
            self.world.pushToGroup(self.character.group, new Messages.Teleport(self.character.instance, self.character.x, self.character.y, true));

        self.forEachAttacker(function(attacker) {
            attacker.removeTarget();
        });

        if (self.character.hasTarget())
            self.begin(self.character.target);
    },

    getRandomPosition: function() {
        var self = this,
            random = Utils.randomInt(0, self.teleportLocations.length - 1),
            position = self.teleportLocations[random];

        if (!position || random === self.lastTeleportIndex)
            return null;

        return {
            x: position.x,
            y: position.y,
            index: random
        }
    },

    canTeleport: function() {
        //Just randomize the teleportation for shits and giggles.
        return new Date().getTime() - this.lastTeleport > 10000 && Utils.randomInt(0, 4) === 2;
    },

    getHealthPercentage: function() {
        //Floor it to avoid random floats
        return Math.floor((this.character.hitPoints / self.character.maxHitPoints) * 100);
    }

});