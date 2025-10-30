$bytes = [System.IO.File]::ReadAllBytes('create-categories.js')
if ($bytes.Length -gt 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    [System.IO.File]::WriteAllBytes('create-categories.js', $bytes[3..($bytes.Length-1)])
}