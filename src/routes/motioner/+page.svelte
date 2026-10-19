<script lang="ts">
    import {all, create, vote} from "../api/motioner.remote.ts";
    import {me} from "../api/auth.remote.ts";

    const {text} = create.fields;
    const {motionId, userId, yes} = vote.fields;

    const saved = $derived(await all());

    let liveMotioner = $state<any[]>([]);
    const motioner = $derived([...saved, ...liveMotioner.filter((forum) => !saved.some((s) => s.id === forum.id))]);

    const user = await me();

    $effect(() => {
        liveMotioner = [];
        const events = new EventSource('/stream');
        events.onmessage = (event) => {
            liveMotioner = [...liveMotioner, JSON.parse(event.data)];
        };
        return () => events.close();
    });

</script>

<div class="flex flex-col gap-4 justify-center">
    <h1 class="text-2xl font-semibold text-black">Motioner</h1>
    <form id="skapaennymotion" {...create}
          onclick={(e) => e.stopPropagation()}
          class="flex gap-4 w-full justify-center">
        <input {...text.as('text')} class="p-2 w-full border border-neutral-200 rounded-lg mr-auto text-black"
               placeholder="Text" type="text">
        <div class="flex flex-row w-full justify-between gap-2">
            <button class="bg-black w-full my-auto hover:bg-neutral-800 cursor-pointer flex duration-200 px-4 py-2 rounded-lg text-sm font-semibold text-white">
                Skapa Motion
            </button>
        </div>
    </form>

    {#await motioner}
        <p class="text-black">Laddar...</p>
    {:then pages}
        <div class="grid grid-cols-1 gap-2">
            {#each pages as page (page.id)}
                <div class="flex gap-2">
                    <a href="/motioner/{page.id}"
                       class="border border-neutral-200 hover:bg-neutral-50 duration-200 text-black p-6 rounded-xl w-full">
                        <div class="flex justify-between my-auto">
                            <p class="my-auto">{page.text}</p>
                            <div class="flex">
                                {#if user}
                                    {const voteyes = vote.for(page.id)}
                                    {const voteno = vote.for(page.id + "a")}
                                    <form id="yes" {...voteyes}
                                          onclick={(e) => e.stopPropagation()}
                                          class="flex gap-4 w-full justify-center">
                                        <input {...motionId.as('text')}
                                               class="hidden"
                                               type="text" value={page.id}/>
                                        <input {...userId.as('text')}
                                               class="hidden"
                                               type="text" value={user.id}/>
                                        <input {...yes.as('text')}
                                               class="hidden"
                                               type="text" value="ja"/>
                                        <div class="flex flex-row w-full justify-between gap-2">
                                            <button class="py-2 px-4 flex gap-2 my-auto rounded-lg text-sm border border-neutral-200">
                                                Rösta För
                                                <p class="font-semibold">{page.votesYes}</p>
                                            </button>
                                        </div>
                                    </form>

                                    <form id="no" {...voteno}
                                          onclick={(e) => e.stopPropagation()}
                                          class="flex gap-4 w-full justify-center">
                                        <input {...motionId.as('text')}
                                               class="hidden"
                                               type="text" value={page.id}/>
                                        <input {...userId.as('text')}
                                               class="hidden"
                                               type="text" value={user.id}/>
                                        <input {...yes.as('text')}
                                               class="hidden"
                                               type="text" value="nej"/>
                                            <button class="cursor-pointer py-2 px-4 flex gap-2 my-auto rounded-lg text-sm border border-neutral-200">
                                                Rösta Emot
                                                <p class="font-semibold">{page.votesNo}</p>
                                            </button>
                                    </form>
                                {:else}
                                    <a href="auth/login">Logga In</a>
                                {/if}

                            </div>
                        </div>
                    </a>
                </div>
            {/each}
        </div>
    {/await}
</div>