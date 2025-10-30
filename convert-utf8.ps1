$content = Get-Content 'create-categories.js' -Encoding Unicode
$content | Set-Content 'create-categories.js' -Encoding UTF8