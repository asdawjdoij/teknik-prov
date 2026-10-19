import {form, query} from "$app/server";
import * as v from 'valibot';
import {redirect} from "@sveltejs/kit";
import {db} from "../../prisma/db";
import {motionChannel, motionEvents, votesChannel} from "#lib/events.ts";
import {findUser} from "./auth.remote.ts";

export const all = query(async () => await db.orm.public.Motion.all());

export const allVotes = query(v.optional(v.string()), async (motionId) => {
    return db.orm.public.Vote.where({motionId: motionId})
        .include('user', (u) => u.select('name'))
        .all();
});

export const find = query(v.optional(v.string()), async (id) => {
    const motion = id === undefined ? undefined : await db.orm.public.Motion.where({id: id}).first()

    if (!motion) {
        return redirect(302, "/")
    }

    return motion
});

export const create = form(
    v.object({
        text: v.pipe(v.string(), v.nonEmpty()),
    }),
    async ({text}) => {

        const motion = await db.orm.public.Motion.create({text: text});

        motionEvents.emit(motionChannel, motion);

        return redirect(303, `/motioner/${motion.id}`)
    }
)

export const vote = form(
    v.object({
        motionId: v.pipe(v.string(), v.nonEmpty()),
        userId: v.pipe(v.string(), v.nonEmpty()),
        yes: v.pipe(v.string(), v.nonEmpty()),
    }),
    async ({motionId, userId, yes}) => {
        const vote = await db.orm.public.Vote.create({
            motionId: motionId,
            userId: userId,
            yes: yes === "ja",
        })

        const motion = await find(motionId)

        if (yes === "ja") {
            motion.votesYes += 1
        } else {
            motion.votesNo += 1
        }

        const user = await findUser(userId)

        motionEvents.emit(votesChannel(motionId), {...vote, user: user ? {name: user.name} : null});
    }
)