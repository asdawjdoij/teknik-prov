<script lang="ts">
	import {register} from '../../api/auth.remote';

	const {name, password} = register.fields;
</script>

<div class="card-form">
	<h1 class="heading text-center">Skapa konto</h1>
	<form {...register} class="form mt-6">
		<input {...name.as('text')} class="input" placeholder="Namn" autocomplete="username" />
		<input {...password.as('password')} class="input" placeholder="Lösenord" autocomplete="new-password" />
		<button class="btn-primary btn-block">Skapa konto</button>
		{#each register.fields.allIssues() ?? [] as issue}
			<p class="error">{issue.message}</p>
		{/each}
	</form>
	<p class="text-muted-sm mt-6 text-center">
		Har du redan konto? <a href="/auth/login" class="link text-ink">Logga in</a>
	</p>
</div>
