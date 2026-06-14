@echo off
REM FinAdvisor one-command launcher. Runs dev.ps1 without execution-policy prompts.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev.ps1" %*
