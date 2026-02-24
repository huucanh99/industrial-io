@echo off
title Industrial IO Control System

echo =====================================
echo   Industrial IO Control System
echo =====================================

echo.
echo Checking Node...
node -v
echo.

echo Starting server...
echo.

cd /d %~dp0

node server.js

pause