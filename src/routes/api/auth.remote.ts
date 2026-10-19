import {form, getRequestEvent, query} from '$app/server';
import * as v from 'valibot';
import {invalid, redirect} from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import {randomBytes} from 'node:crypto';
import {dev} from '$app/env';
import {db} from '../../prisma/db';
import {getSession, getUser, hashSessionToken} from '#lib/server/auth.ts';

const MONTH = 60 * 60 * 24 * 30;
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

async function createSession(userId: string) {
    const {cookies, request} = getRequestEvent();
    const token = randomBytes(32).toString('base64url');

    await db.orm.public.Session.create({
        id: hashSessionToken(token),
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + MONTH * 1000,
        userAgent: request.headers.get('user-agent')?.slice(0, 200) ?? null
    });

    cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        sameSite: 'lax',
        maxAge: MONTH
    });
}

export const register = form(
    v.object({
        name: v.pipe(v.string(), v.trim(), v.minLength(2, 'Namnet måste vara minst 2 tecken'), v.maxLength(60)),
        password: v.pipe(v.string(), v.minLength(8, 'Lösenordet måste vara minst 8 tecken'))
    }),
    async ({name, password}) => {
        if (await getUser()) redirect(303, '/');
        if (await db.orm.public.User.where({name}).first()) invalid('Namnet är upptaget');

        const passwordHash = await bcrypt.hash(password, 10);

        let user;
        try {
            user = await db.orm.public.User.create({name, passwordHash});
        } catch {
            invalid('Namnet är upptaget');
        }

        await createSession(user.id);
        redirect(303, '/');
    }
);

export const authenticate = form(
    v.object({
        name: v.pipe(v.string(), v.trim(), v.nonEmpty('Ange namn')),
        password: v.pipe(v.string(), v.nonEmpty('Ange lösenord'))
    }),
    async ({name, password}) => {
        if (await getUser()) redirect(303, '/');

        const user = await db.orm.public.User.where({name}).first();
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) invalid('Fel namn eller lösenord');

        const others = (await db.orm.public.Session.where({userId: user.id}).all())
            .map((s) => s.id);

        for (const id of others) {
            await db.orm.public.Session.where({id}).delete();
        }

        await createSession(user.id);
        redirect(303, '/');
    }
);

export const logout = form(async () => {
    const {cookies} = getRequestEvent();
    const session = await getSession();

    if (session) {
        await db.orm.public.Session.where({id: session.sessionId}).delete();
    }

    cookies.delete('session', {path: '/'});
    redirect(303, '/');
});

export const findUser = query(v.optional(v.string()), async (id) => {
    return id === undefined ? undefined : await db.orm.public.User.where({id: id}).first()
});

export const me = query(async () => {
    const user = await getUser();
    return user ? {id: user.id} : null;
});

export const devices = query(async () => {
    const session = await getSession();
    if (!session) return [];

    const rows = await db.orm.public.Session
        .where({userId: session.user.id})
        .orderBy((s) => s.createdAt.desc())
        .all();

    return rows.map((s) => ({
        createdAt: s.createdAt,
        userAgent: s.userAgent,
        current: s.id === session.sessionId
    }));
});

export const logoutOthers = form(async () => {
    const session = await getSession();
    if (!session) redirect(303, '/auth/login');

    const others = (await db.orm.public.Session.where({userId: session.user.id}).all())
        .filter((s) => s.id !== session.sessionId)
        .map((s) => s.id);

    for (const id of others) {
        await db.orm.public.Session.where({id}).delete();
    }

    await devices().refresh();
});
