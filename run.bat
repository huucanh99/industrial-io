@echo off
title Industrial IO (OPC UA)

start cmd /k "node opcua-server.js"
timeout /t 2 >nul
start cmd /k "node server.js"