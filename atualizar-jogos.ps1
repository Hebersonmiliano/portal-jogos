# Copia a versao atual de cada jogo para a pasta jogos/ do site.
# Rode sempre que atualizar um jogo:  powershell -ExecutionPolicy Bypass -File atualizar-jogos.ps1
#
# Os jogos continuam sendo desenvolvidos nas pastas originais;
# o site recebe so uma copia (sem .git e sem arquivos de desenvolvimento).
# (Arquivo sem acentos de proposito: o PowerShell 5.1 nao le UTF-8 sem BOM.)

$origens = @{
  "security-test" = (Join-Path $PSScriptRoot "..\teste-de-seguranca\builds\web")
  "crepusculo"    = "C:\Users\teste\crepusculo-dos-reinos"
  "reino-colonos" = "C:\Users\teste\reino-colonos"
  "brasa-eterna"  = "C:\Users\teste\brasa-eterna"
  "brasa-eterna-2" = "C:\Users\teste\brasa-eterna-2"
  "imperio-industrial" = "C:\Users\adm\OneDrive\Documentos\JOGO DA YASMIN 2? ANO TECNICO\DoZeroAoImperio3D"   # "?" no lugar do simbolo de grau
  # "foxaventura" = "C:\Users\teste\FoxAventura\export\web"   # export Web do Godot
}

$destinoBase = Join-Path $PSScriptRoot "jogos"

foreach ($id in $origens.Keys) {
  # Resolve-Path aceita curingas (? e *) no caminho
  $origem = (Resolve-Path $origens[$id] -ErrorAction SilentlyContinue | Select-Object -First 1).Path
  if (-not $origem) { Write-Warning "$id : pasta nao encontrada em $($origens[$id]) - pulando"; continue }
  $destino = Join-Path $destinoBase $id
  if (-not (Test-Path (Join-Path $origem "index.html"))) {
    Write-Warning "$id : index.html nao encontrado em $origem - pulando"
    continue
  }
  # /MIR espelha a pasta (remove do site o que foi apagado no jogo)
  robocopy $origem $destino /MIR /XD .git .github node_modules /XF *.md *.import .gitignore /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($id -eq "security-test") {
    $capa = Join-Path $origem "..\..\art\previews\inicio_responsivo_desktop.png"
    if (Test-Path -LiteralPath $capa) { Copy-Item -LiteralPath $capa -Destination (Join-Path $destino "capa.png") }
  }
  Write-Host "OK  $id  (de $origem)"
}
