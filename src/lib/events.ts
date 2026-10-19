import {EventEmitter} from 'node:events';

export const motionEvents = new EventEmitter();

export const motionChannel = 'motion:list';
export const votesChannel = (motionId: string) => `motion:${motionId}:votes`;
