<script>
    import { getContext } from 'svelte';
    const request = getContext('request');

    export let items;
    export let title = '';
</script>

{#if title}
    <h3 class="mb-0">{@html title}</h3>
{/if}
<ul role="navigation">
    {#each items as item}
        <li class:active={$request.path === item.url}>
            <a href={item.url}>{@html item.title}</a>
        </li>
    {/each}
</ul>

<style>
    h3 {
        text-transform: uppercase;
        letter-spacing: 0;
        font-weight: 700;
        font-size: 12px;
        padding: 8px;
    }
    ul {
        display: table;
        list-style: none;
        width: 100%;
    }
    ul li {
        list-style: none;
        line-height: 20px;
        margin: 0;
    }
    ul li:first-child a {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }
    ul li:last-child a {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    ul li + li a {
        border-top: 0;
        list-style: none;
        line-height: 20px;
        margin: 0;
    }
    ul li a {
        display: block;
        padding: 1ex;
        font-size: 14px;
        border: 1px solid #ddd;
    }
    li.active {
        font-weight: bold;
        color: #222;
    }
    li.active a {
        background: #18a1cd;
        border-color: #18a1cd;
        color: #fff;
        font-weight: bold;
    }
</style>
