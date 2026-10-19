import type {RequestHandler} from './$types';
import {appEvents, changeChannel, kickChannel, type ChangeEvent} from '#lib/events.ts';
import {hashSessionToken} from '#lib/server/auth.ts';

export const GET: RequestHandler = async ({cookies}) => {
    const token = cookies.get('session');
    const sessionId = token ? hashSessionToken(token) : null;
    const encoder = new TextEncoder();

    let cleanup = () => {};

    const stream = new ReadableStream({
        start(controller) {
            const send = (event: string, data: unknown) =>
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

            const onChange = (e: ChangeEvent) => send('change', e);
            const onKick = (ids: string[]) => {
                if (sessionId && ids.includes(sessionId)) {
                    send('kicked', {});
                    cleanup();
                    controller.close();
                }
            };
            const ping = setInterval(() => controller.enqueue(encoder.encode(': ping\n\n')), 25000);

            cleanup = () => {
                appEvents.off(changeChannel, onChange);
                appEvents.off(kickChannel, onKick);
                clearInterval(ping);
            };

            appEvents.on(changeChannel, onChange);
            appEvents.on(kickChannel, onKick);
            controller.enqueue(encoder.encode('retry: 2000\n\n'));
        },
        cancel() {
            cleanup();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
};
