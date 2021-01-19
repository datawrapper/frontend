<script type="text/javascript">
	import SignInPageLayout from './layout/SignInPageLayout.svelte';
	export let name = 'world';
	function foo() {
		name = 'Knock Knock';
	}
</script>

<SignInPageLayout title="Fooo">
	<h1 style="color:red" on:click="{foo}">Hello {name}</h1>
</SignInPageLayout>
