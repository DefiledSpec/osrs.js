import { getFiles } from '@server/util/files';
import { logger } from '@runejs/core';
import { actionPipeline, pluginActionHooks } from '@server/game-server';
import { QuestKey } from '@server/config/quest-config';


/**
 * Content action type definitions.
 */
export type ActionType =
    'button_action'
    | 'widget_action'

    | 'npc_init_action'
    | 'npc_action'

    | 'object_action'

    | 'item_action'
    | 'item_on_object_action'
    | 'item_on_npc_action'
    | 'swap_items_action'
    | 'move_item_action'
    | 'world_item_action'
    | 'item_on_item_action'
    | 'item_action_action'
    | 'equip_action'

    | 'player_init_action'
    | 'player_command_action'
    | 'player_action'
    | 'region_change_action';


/**
 * Defines a quest requirement for an action hook.
 */
export interface QuestRequirement {
    questId: string;
    stage?: QuestKey;
    stages?: number[];
}


/**
 * Defines a generic extensible game content action hook.
 */
export interface ActionHook {
    // The type of action to perform.
    type: ActionType;
    // The action's priority over other actions.
    priority?: number;
    // [optional] Quest requirements that must be completed in order to run this hook.
    questRequirement?: QuestRequirement;
}


/**
 * Methods in which action hooks in progress may be cancelled.
 */
export type ActionCancelType = 'manual-movement' | 'pathing-movement' | 'generic' | 'keep-widgets-open' | 'button' | 'widget';


/**
 * Fetches the list of all discovered action hooks of the specified type.
 * @param actionType The Action Type to find the hook for.
 * @param filter [optional] Filter criteria to apply to the returned list.
 */
export const getActionHooks = <T>(actionType: ActionType, filter?: (actionHook: T) => boolean): T[] => {
    const hooks = pluginActionHooks[actionType] as T[];
    if(!hooks || hooks.length === 0) {
        return [];
    }

    return filter ? hooks.filter(filter) : hooks;
}


/**
 * Basic definition of a game engine action file (.action.ts exports).
 */
export type ActionPipe = [ ActionType, (...args: any[]) => void ];


/**
 * The action pipeline handler.
 * Records action pipes and distributes content actions from the game engine down to execute plugin hooks.
 */
export class ActionPipeline {

    public actionPipes = new Map<string, any>();

    public get(action: ActionType): any {
        this.actionPipes.get(action.toString());
    }

    public async send(action: ActionType, ...args: any[]): Promise<void> {
        const actionHandler = this.actionPipes.get(action.toString());
        if(actionHandler) {
            try {
                await new Promise(resolve => {
                    actionHandler(...args);
                    resolve();
                });
            } catch(error) {
                logger.error(`Error handling action ${ action.toString() }`);
                logger.error(error);
            }
        }
    }

    public register(action: ActionType, actionPipe: (...args: any[]) => void): void {
        this.actionPipes.set(action.toString(), actionPipe);
    }

}


/**
 * Finds and loads all available action pipe files (`*.pipe.ts`).
 */
export async function loadActionFiles(): Promise<void> {
    const ACTION_DIRECTORY = './dist/world/action';
    const blacklist = [];

    for await(const path of getFiles(ACTION_DIRECTORY, blacklist)) {
        if(!path.endsWith('.action.ts') && !path.endsWith('.action.js')) {
            continue;
        }

        logger.info(`Loading action file ${path}`);

        const location = '.' + path.substring(ACTION_DIRECTORY.length).replace('.js', '');

        try {
            const importedAction = (require(location)?.default || null) as ActionPipe | null;
            if(importedAction && Array.isArray(importedAction) && importedAction[0] && importedAction[1]) {
                actionPipeline.register(importedAction[0], importedAction[1]);
            }
        } catch(error) {
            logger.error(`Error loading action file at ${location}:`);
            logger.error(error);
        }
    }

    return Promise.resolve();
}
