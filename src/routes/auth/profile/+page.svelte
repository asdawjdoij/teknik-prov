<script lang="ts">
	import {devices, logoutOthers, logout, me} from '../../api/auth.remote.ts';
	import {formatTime} from '#lib/time.ts';

	const list = $derived(await devices());
	const user = $derived(await me());
</script>

{#if user}
	<div class="mb-8 flex items-center gap-4">
		<div class="flex-1">
			<h1 class="heading">{user.name}</h1>
		</div>
		<form {...logout}>
			<button class="btn-outline">Logga ut</button>
		</form>
	</div>
{/if}

{#if list.length === 0}
	<p class="text-muted-sm">Du är inte inloggad. <a href="/auth/login" class="link">Logga in</a></p>
{:else}
	<div class="grid gap-2">
		{#each list as device}
			<div class="card">
				<p class="font-semibold">{device.current ? 'Den här enheten' : 'Annan enhet'}</p>
				<p class="text-muted-sm">Inloggad {formatTime(device.createdAt)}</p>
				<p class="text-xs break-all">{device.userAgent ?? ''}</p>
			</div>
		{/each}
	</div>
{/if}
