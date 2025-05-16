Write-Host "Testing MindBuddy API connection..." -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://localhost:8000/chat"
$body = @{
    msg = "Hello from PowerShell API test"
} | ConvertTo-Json

Write-Host "Sending request to $apiUrl..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Body:" -ForegroundColor Green
    $responseContent = $response.Content | ConvertFrom-Json
    Write-Host $responseContent.reply -ForegroundColor White
} 
catch {
    Write-Host "Error connecting to API: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the backend API is running with:" -ForegroundColor Yellow
    Write-Host "uvicorn backend.api:app --reload --port 8000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 