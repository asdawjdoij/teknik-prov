import type {RequestHandler} from './$types';
import {motionEvents, votesChannel} from '#lib/events.ts';

export const GET: RequestHandler = async ({params}) => {
    const channel = votesChannel(params.slug);

    let onPost: (post: unknown) => void;

    const stream = new ReadableStream({
        start(controller) {
            onPost = (post) => controller.enqueue(`data: ${JSON.stringify(post)}\n\n`);
            motionEvents.on(channel, onPost);
        },
        cancel() {
            motionEvents.off(channel, onPost);
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
