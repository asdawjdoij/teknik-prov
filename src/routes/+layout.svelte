<script lang="ts">
    import '../app.css';
    import {refreshAll} from '$app/navigation';
    import {me, logout} from './api/auth.remote';

    let {children} = $props();

    const user = $derived(await me());
</script>

<header class="flex items-center justify-between border-b border-line px-6 py-4">
    <a href="/" class="heading">Teknikfruzz</a>
    <nav class="flex items-center gap-3">
        {#if user}
            <a href="auth/profile">Profil</a>
        {:else}
            <a href="/auth/login" class="btn-primary">Logga in</a>
        {/if}
    </nav>
</header>

<main class="mx-auto w-full max-w-2xl p-6">
    {@render children()}
</main>
