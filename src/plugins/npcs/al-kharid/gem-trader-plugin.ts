import { npcInteractionActionHandler } from '@engine/world/action/npc-interaction.action';
import { dialogueAction, DialogueEmote } from '@engine/world/actor/player/dialogue-action';
import { findShop } from '@engine/config';


const tradeAction: npcInteractionActionHandler = ({ player }) =>
    findShop('rs:alkharid_gem_trader')?.open(player);

const talkToAction : npcInteractionActionHandler = (details) => {
    const { player, npc } = details;
    dialogueAction(player)
        .then(async d => d.npc(npc, DialogueEmote.CALM_TALK_1, [ 'Good day to you, traveller.', 'Would you be interested in buying some gems?']))
        .then(async d => d.options('Would you be interested in buying some gems?', ['Yes, please.', 'No, thank you.']))
        .then(async d => {
            switch (d.handler) {
                case 1:
                    return d.player(DialogueEmote.JOYFUL, [ 'Yes, please!' ])
                        .then(d => {
                            tradeAction(details);
                            return d;
                        });
                case 2:
                    return d.player(DialogueEmote.CALM_TALK_1, ['No, thank you.'])
                        .then(async d => d.npc(npc, DialogueEmote.ANNOYED, ['Eh, suit yourself.']))
                        .then(d => {
                            d.close();
                            return d;
                        });

            }
        });
};

export default [
    { type: 'np_action', npcs: 'rs:alkharid_gem_trader', options: 'trade', walkTo: true, handler: tradeAction },
    { type: 'npc_action', npcs: 'rs:alkharid_gem_trader', options: 'talk-to', walkTo: true, handler: talkToAction }
];
