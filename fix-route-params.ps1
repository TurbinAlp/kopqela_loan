# Fix route parameter signatures for Next.js 15+
Write-Host "Fixing route parameter signatures..."

# Find all route.ts files
$routeFiles = Get-ChildItem -Path "app\api" -Recurse -Include "*.ts" | Where-Object { $_.FullName -like "*route.ts" }

foreach ($file in $routeFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace patterns with Promise versions
    $patterns = @{
        '{ params }: { params: { slug: string } }' = '{ params }: { params: Promise<{ slug: string }> }'
        '{ params }: { params: { id: string } }' = '{ params }: { params: Promise<{ id: string }> }'
        '{ params }: { params: { slug: string; id: string } }' = '{ params }: { params: Promise<{ slug: string; id: string }> }'
    }
    
    $modified = $false
    foreach ($pattern in $patterns.GetEnumerator()) {
        if ($content -match [regex]::Escape($pattern.Key)) {
            $content = $content -replace [regex]::Escape($pattern.Key), $pattern.Value
            $modified = $true
        }
    }
    
    # Fix param usage patterns
    $paramPatterns = @{
        'const { slug } = params' = 'const resolvedParams = await params; const { slug } = resolvedParams'
        'const { id } = params' = 'const resolvedParams = await params; const { id } = resolvedParams'
        'const { slug, id } = params' = 'const resolvedParams = await params; const { slug, id } = resolvedParams'
        'parseInt(params.id)' = 'const resolvedParams = await params; parseInt(resolvedParams.id)'
        'params.slug' = 'const resolvedParams = await params; resolvedParams.slug'
        'params.id' = 'const resolvedParams = await params; resolvedParams.id'
    }
    
    foreach ($paramPattern in $paramPatterns.GetEnumerator()) {
        if ($content -match [regex]::Escape($paramPattern.Key)) {
            $content = $content -replace [regex]::Escape($paramPattern.Key), $paramPattern.Value
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Route parameter fixing complete!" 