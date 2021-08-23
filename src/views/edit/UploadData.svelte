<script>
    import { chart, data } from './stores';

    let uploadMethods = [
        {
            icon: 'fa fa-clipboard',
            title: 'Copy & paste data table'
        }
    ];
</script>

<div class="container">
    <div class="columns">
        <div class="column is-two-fifths content">
            <h4>How do you want to upload your data?</h4>
            <!-- {#each uploadMethods as um}

            {/each} -->

            <h5>Copy & paste your data</h5>
            <p>
                Select your data (including header row/column) in Excel or LibreOffice and paste it
                in the text field on the right. You can also upload a CSV or Excel file from your
                computer.
            </p>
        </div>
        <div class="column">
            <textarea
                class="input is-family-monospace"
                style="width:100%; height: 14rem; padding: 1rem"
                bind:value={$data}
            />
        </div>
    </div>
</div>
