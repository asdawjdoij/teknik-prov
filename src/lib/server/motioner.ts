import {db} from '../../prisma/db';

export async function getYes(motionId: string) {
    const motion = await db.orm.public.Motion.where({id: motionId}).first();

    if (!motion) return 0;

    const votes = motion.votes

    return votes.filter(vote => vote.for == true).length;
}