@echo off
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "$cores = (Get-CimInstance -ClassName Win32_Processor | Measure-Object -Property NumberOfCores -Sum).Sum; Write-Output 'NumberOfCores'; Write-Output $cores"
