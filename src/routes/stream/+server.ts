import type {RequestHandler} from './$types';
import {motionEvents, motionChannel} from '#lib/events.ts';

export const GET: RequestHandler = async () => {
    let onCreate: (forum: unknown) => void;

    const stream = new ReadableStream({
        start(controller) {
            onCreate = (forum) => controller.enqueue(`data: ${JSON.stringify(forum)}\n\n`);
            motionEvents.on(motionChannel, onCreate);
        },
        cancel() {
            motionEvents.off(motionChannel, onCreate);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
};
