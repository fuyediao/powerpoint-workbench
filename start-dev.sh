#!/bin/bash
# PPT Workbench 開發環境啟動腳本

echo "正在啟動 PPT Workbench 開發環境..."

# 啟動後端
echo ""
echo "啟動後端服務器 (端口 3000)..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# 等待 2 秒
sleep 2

# 啟動前端
echo "啟動前端開發服務器 (端口 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ 服務器已啟動！"
echo "前端: http://localhost:5173"
echo "後端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服務"

# 等待用戶中斷
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

