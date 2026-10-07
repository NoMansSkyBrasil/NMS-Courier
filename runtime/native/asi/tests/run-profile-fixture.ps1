param(
    [Parameter(Mandatory = $true)][string]$Compiler,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
if (Test-Path -LiteralPath $OutputDirectory) { throw 'Fixture output must be a new directory' }
$compilerPath = (Resolve-Path -LiteralPath $Compiler).Path
$source = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$vendor = Join-Path $source '..\vendor\minhook'
New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$common = @('-std=c11', '-O2', '-Wall', '-Wextra', '-Werror')
$dll = Join-Path $outputPath 'xinput9_1_0.dll'
$arguments = $common + @('-shared', '-DCOURIER_XINPUT_PROXY_BUILD',
    '-DCOURIER_NATIVE_CALLBACK_PROBE', '-DCOURIER_BUILD_180836',
    '-DCOURIER_NATIVE_CALLBACK_FIXTURE', '-I', (Join-Path $vendor 'include'),
    '-o', $dll)
foreach ($file in @('startup_probe.c', 'xinput_proxy.c', 'profile_180836\profile_core.c', 'xinput_proxy.def')) {
    $arguments += Join-Path $source $file
}
foreach ($file in @('src\buffer.c', 'src\hook.c', 'src\trampoline.c', 'src\hde\hde64.c')) {
    $arguments += Join-Path $vendor $file
}
$arguments += '-lbcrypt'
& $compilerPath @arguments
if ($LASTEXITCODE -ne 0) { throw 'Profile fixture DLL compilation failed' }
& $compilerPath @common '-Wl,--export-all-symbols' '-o' (Join-Path $outputPath 'NMS.exe') (Join-Path $PSScriptRoot 'profile_fixture.c')
if ($LASTEXITCODE -ne 0) { throw 'Profile fixture host compilation failed' }
Push-Location -LiteralPath $outputPath
try {
    & (Join-Path $outputPath 'NMS.exe')
    if ($LASTEXITCODE -ne 0) { throw "Profile fixture failed: $LASTEXITCODE" }
} finally { Pop-Location }
# This bypasses executable verification deliberately; never install this fixture DLL.
Get-FileHash -LiteralPath $dll -Algorithm SHA256
