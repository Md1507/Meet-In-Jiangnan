# Generate only the new conversation voices. Requires an installed local Chinese SAPI voice.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$contentPath = Join-Path $projectRoot 'src/content/ambient-dialogues.json'
$content = Get-Content -LiteralPath $contentPath -Raw -Encoding utf8 | ConvertFrom-Json
$voice = New-Object -ComObject SAPI.SpVoice
$mandarin = @($voice.GetVoices() | Where-Object { $_.GetDescription() -match 'Huihui|Chinese.*Simplified' }) | Select-Object -First 1
if (-not $mandarin) { throw 'No local Simplified Chinese SAPI voice is installed. Existing audio has been kept.' }
$voice.Voice = $mandarin
$voice.Rate = -2
$outputDir = Join-Path $projectRoot 'public/audio/ambient'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
$records = @()
foreach ($npc in $content.npcs) {
    foreach ($turn in $npc.turns) {
        $prefix = $npc.id + '-' + $turn.id
        $lines = @(@{ id = $prefix + '-prompt'; line = $turn.prompt })
        foreach ($response in $turn.responses) {
            $lines += @{ id = $prefix + '-' + $response.intent + '-sample'; line = $response.sample }
            $lines += @{ id = $prefix + '-' + $response.intent + '-reply'; line = $response.reply }
        }
        foreach ($entry in $lines) {
            $target = Join-Path $outputDir ($entry.id + '.wav')
            $stream = New-Object -ComObject SAPI.SpFileStream
            try {
                $stream.Format.Type = 22 # 22.05 kHz, 16-bit mono PCM
                $stream.Open($target, 3, $false)
                $voice.AudioOutputStream = $stream
                [void]$voice.Speak([string]$entry.line[0], 0)
            } finally { $stream.Close() }
            $records += [ordered]@{
                id = $entry.id; text = $entry.line[0]; pinyin = $entry.line[1]; meaningVi = $entry.line[2]
                path = 'public/audio/ambient/' + $entry.id + '.wav'
                sha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
            }
        }
    }
}
$manifest = [ordered]@{
    schemaVersion = 1; audioKind = 'synthetic-local-sapi'; voice = $mandarin.GetDescription()
    reviewStatus = 'pending-human'; license = 'public/licenses/ambient-dialogues.txt'; lines = $records
}
[System.IO.File]::WriteAllText((Join-Path $projectRoot 'public/licenses/ambient-audio.json'), ($manifest | ConvertTo-Json -Depth 8), (New-Object System.Text.UTF8Encoding $false))
Write-Output ('Generated {0} local synthetic WAV files. Human language/audio review pending.' -f $records.Count)
