<script lang="ts">
    import type {PageProps} from './$types';
    import {allVotes, find} from "../../api/motioner.remote.ts";

    let {params}: PageProps = $props();

    const id = $derived(params.slug);
    const motion = $derived(await find(id));

    const saved = $derived(await allVotes(id));

    let liveVotes = $state<any[]>([]);
    const votes = $derived([...saved, ...liveVotes.filter((vote) => !saved.some((s) => s.userId === vote.userId))]);

    $effect(() => {
        liveVotes = [];
        const events = new EventSource(`/motioner/${id}/stream`);
        events.onmessage = (event) => {
            liveVotes = [...liveVotes, JSON.parse(event.data)];
        };
        return () => events.close();
    });

</script>

<div class="flex flex-col w-full min-h-screen bg-white">
    <div class="flex flex-col antialiased px-8 pb-8 mx-auto max-w-2xl w-full">
        <div class="flex flex-col p-8 border border-neutral-200 rounded-xl">
            <h1 class="text-3xl font-semibold text-black my-auto">{motion.text}</h1>
            <div class="flex flex-col w-full">
            </div>
        </div>
        <div class="flex justify-between">
        <div class="flex flex-col p-2">
            <p class="text-black font-semibold text-xl">Röstade Ja</p>
        {#each votes.filter(value => value.yes === true) as vote (vote.userId)}
            <p>- {vote.user.name}</p>
        {/each}
        </div>
        <div class="flex flex-col text-right p-2">
            <p class="text-black font-semibold text-xl">Röstade Nej</p>
            {#each votes.filter(value => value.yes === false) as vote}
                <p>{vote.user.name} -</p>
            {/each}
        </div>
            </div>
    </div>
</div>