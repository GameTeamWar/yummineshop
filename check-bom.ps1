$bytes = [System.IO.File]::ReadAllBytes('create-categories.js')
$bytes[0..10] | ForEach-Object { '0x{0:X2}' -f $_ }