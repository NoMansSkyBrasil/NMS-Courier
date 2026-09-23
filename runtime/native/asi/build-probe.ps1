param(
    [Parameter(Mandatory = $true)]
    [string]$Compiler,
    [Parameter(Mandatory = $true)]
    [string]$Output,
    [ValidateSet('Startup', 'Callback', 'DeliveryTest', 'CurrencyTest')]
    [string]$Mode = 'Startup'
)

$ErrorActionPreference = 'Stop'
$compilerPath = (Resolve-Path -LiteralPath $Compiler).Path
$directory = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$vendor = Join-Path $directory '..\vendor\minhook'
$arguments = @('-std=c11', '-O2', '-Wall', '-Wextra', '-Werror',
    '-DCOURIER_XINPUT_PROXY_BUILD', '-shared')

if ($Mode -ne 'Startup') {
    $arguments += '-DCOURIER_NATIVE_CALLBACK_PROBE'
    $arguments += @('-I', (Join-Path $vendor 'include'))
}

if ($Mode -eq 'DeliveryTest') {
    $arguments += '-DCOURIER_TEST_DELIVER_CARBON'
}
if ($Mode -eq 'CurrencyTest') {
    $arguments += '-DCOURIER_TEST_CURRENCY_REWARDS'
}

$arguments += @('-o', $Output,
    (Join-Path $directory 'startup_probe.c'),
    (Join-Path $directory 'xinput_proxy.c'))

if ($Mode -ne 'Startup') {
    $arguments += (Join-Path $directory 'native_callback_probe.c')
    $arguments += (Join-Path $directory 'inventory_snapshot_179666.c')
    $arguments += @(
        (Join-Path $vendor 'src\buffer.c'),
        (Join-Path $vendor 'src\hook.c'),
        (Join-Path $vendor 'src\trampoline.c'),
        (Join-Path $vendor 'src\hde\hde64.c')
    )
}

if ($Mode -eq 'DeliveryTest') {
    $arguments += (Join-Path $directory 'carbon_delivery_179666.c')
}
if ($Mode -eq 'CurrencyTest') {
    $arguments += (Join-Path $directory 'currency_reward_179666.c')
}

$arguments += @((Join-Path $directory 'xinput_proxy.def'), '-lbcrypt')
& $compilerPath @arguments
if ($LASTEXITCODE -ne 0) {
    throw "Native probe compilation failed with exit code $LASTEXITCODE"
}
Get-FileHash -Algorithm SHA256 -LiteralPath $Output
