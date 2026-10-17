# Copia a versao atual de cada jogo para a pasta jogos/ do site.
# Rode sempre que atualizar um jogo:  powershell -ExecutionPolicy Bypass -File atualizar-jogos.ps1
#
# Os jogos continuam sendo desenvolvidos nas pastas originais;
# o site recebe so uma copia (sem .git e sem arquivos de desenvolvimento).
# (Arquivo sem acentos de proposito: o PowerShell 5.1 nao le UTF-8 sem BOM.)

$origens = @{
  "crepusculo"    = "C:\Users\teste\crepusculo-dos-reinos"
  "reino-colonos" = "C:\Users\teste\reino-colonos"
  "brasa-eterna"  = "C:\Users\teste\brasa-eterna"
  # "foxaventura" = "C:\Users\teste\FoxAventura\export\web"   # export Web do Godot
}

$destinoBase = Join-Path $PSScriptRoot "jogos"

foreach ($id in $origens.Keys) {
  $origem = $origens[$id]
  $destino = Join-Path $destinoBase $id
  if (-not (Test-Path (Join-Path $origem "index.html"))) {
    Write-Warning "$id : index.html nao encontrado em $origem - pulando"
    continue
  }
  # /MIR espelha a pasta (remove do site o que foi apagado no jogo)
  robocopy $origem $destino /MIR /XD .git .github node_modules /XF *.md .gitignore /NFL /NDL /NJH /NJS /NP | Out-Null
  Write-Host "OK  $id  (de $origem)"
}
