# Build and run the technology refusal-rule fixture. It involves no game and installs nothing.
param(
    [Parameter(Mandatory = $true)][string]$Compiler,
    [Parameter(Mandatory = $true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
if (Test-Path -LiteralPath $OutputDirectory) { throw 'Fixture output must be a new directory' }
$compilerPath = (Resolve-Path -LiteralPath $Compiler).Path
New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
$program = Join-Path (Resolve-Path -LiteralPath $OutputDirectory).Path 'technology-guard-fixture.exe'
& $compilerPath '-std=c11' '-O2' '-Wall' '-Wextra' '-Werror' '-o' $program (Join-Path $PSScriptRoot 'technology_guard_fixture.c')
if ($LASTEXITCODE -ne 0) { throw 'Technology guard fixture compilation failed' }
& $program
if ($LASTEXITCODE -ne 0) { throw "Technology guard fixture failed: $LASTEXITCODE" }
