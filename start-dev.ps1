# PPT Workbench 開發環境啟動腳本

Write-Host "正在啟動 PPT Workbench 開發環境..." -ForegroundColor Cyan

# 啟動後端
Write-Host "`n啟動後端服務器 (端口 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"

# 等待 2 秒
Start-Sleep -Seconds 2

# 啟動前端
Write-Host "啟動前端開發服務器 (端口 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n✓ 服務器已啟動！" -ForegroundColor Green
Write-Host "前端: http://localhost:5173" -ForegroundColor Cyan
Write-Host "後端: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n按任意鍵退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

