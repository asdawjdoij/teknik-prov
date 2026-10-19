import {getRequestEvent} from '$app/server';
import {createHash} from 'node:crypto';
import {db} from '../../prisma/db';

export function hashSessionToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function getSession() {
    const token = getRequestEvent().cookies.get('session');
    if (!token) return null;

    const id = hashSessionToken(token);
    const session = await db.orm.public.Session.where({id}).first();
    if (!session || session.expiresAt < Date.now()) return null;

    const user = await db.orm.public.User.where({id: session.userId}).first();
    return user ? {sessionId: id, user} : null;
}

export async function getUser() {
    return (await getSession())?.user ?? null;
}
