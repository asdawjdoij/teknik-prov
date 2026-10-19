<script lang="ts">
	import {authenticate} from '../../api/auth.remote';

	const {name, password} = authenticate.fields;
</script>

<div class="card-form">
	<h1 class="heading text-center">Logga in</h1>
	<form {...authenticate} class="form mt-6">
		<input {...name.as('text')} class="input" placeholder="Namn" autocomplete="username" />
		<input {...password.as('password')} class="input" placeholder="Lösenord" autocomplete="current-password" />
		<button class="btn-primary btn-block">Logga in</button>
		{#each authenticate.fields.allIssues() ?? [] as issue}
			<p class="error">{issue.message}</p>
		{/each}
	</form>
	<p class="text-muted-sm mt-6 text-center">
		Saknar du konto? <a href="/auth/register" class="link text-ink">Skapa konto</a>
	</p>
</div>
