<script type="text/javascript">
    export let __;

    const MIN_CHARACTERS = 8;

    let zxcvbn;
    let zxcvbnLoading = false;

    function loadZxcvbn() {
        zxcvbnLoading = true;
        require(['/lib/static/js/zxcvbn/zxcvbn.js'], pkg => {
            zxcvbn = pkg;
        });
        return false;
    }

    $: passwordStrength = !zxcvbn
        ? !zxcvbnLoading && password.length > 4
            ? loadZxcvbn()
            : false
        : zxcvbn(password);
    $: passwordTooShort = password.length < MIN_CHARACTERS;

    $: pwdTooShortMsg = __('account / pwd-too-short').replace('%num', MIN_CHARACTERS);

    export let password = '';
    export let passwordHelp = '';
    export let passwordError = '';
    export let passwordSuccess = '';
    export let passwordOk = '';

    $: passwordHelp =
        password === '' || !passwordStrength
            ? pwdTooShortMsg
            : __(
                  `account / password / ${
                      ['bad', 'weak', 'ok', 'good', 'excellent'][passwordStrength.score]
                  }`
              );
    $: passwordError = !password
        ? false
        : passwordTooShort
        ? pwdTooShortMsg
        : passwordStrength && passwordStrength.score < 2
        ? passwordHelp
        : false;
    $: passwordSuccess = passwordStrength && passwordStrength.score > 2 ? passwordHelp : false;
    $: passwordOk = password && !passwordTooShort;
</script>
