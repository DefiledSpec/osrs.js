import { commandActionHandler } from '@engine/world/action/player-command.action';
import { world } from '@engine/game-server';
import { logger } from '@runejs/core';

const quadtreeAction: commandActionHandler = (details) => {
    const { player } = details;

    const values = world.playerTree.colliding({
        x: player.position.x - 2,
        y: player.position.y - 2,
        width: 5,
        height: 5
    });

    logger.info(values);
};

const trackedPlayersAction: commandActionHandler = (details) => {
    const { player } = details;
    player.sendLogMessage(`Tracked players: ${player.trackedPlayers.length}`, details.isConsole);

};

const trackedNpcsAction: commandActionHandler = (details) => {
    const { player } = details;
    player.sendLogMessage(`Tracked npcs: ${player.trackedNpcs.length}`, details.isConsole);

};

export default [{
    type: 'player_command',
    commands: 'quadtree',
    handler: quadtreeAction
}, {
    type: 'player_command',
    commands: 'trackedplayers',
    handler: trackedPlayersAction
}, {
    type: 'player_command',
    commands: 'trackednpcs',
    handler: trackedNpcsAction
}];
