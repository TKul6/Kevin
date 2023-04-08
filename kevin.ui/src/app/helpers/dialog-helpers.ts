export type DialogState = 'start' | 'server-in-progress' | 'server-failed' | 'idle';


const VISIBLE_STATES = ['server-in-progress', 'server-failed', 'start']

export function isModalVisible(state: DialogState): boolean {

   return  VISIBLE_STATES.includes(state);
}