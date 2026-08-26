@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "T20_NODE=C:\Users\DemonRider\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "T20_VITE=%~dp0node_modules\vite\bin\vite.js"

title Fichas de Ameaca T20 - Servidor de testes

if not exist "%T20_NODE%" (
  echo Nao foi possivel localizar o ambiente do Codex.
  echo Avise o Codex e informe que o arquivo node.exe nao foi encontrado.
  echo.
  pause
  exit /b 1
)

if not exist "%T20_VITE%" (
  echo As dependencias da extensao nao foram encontradas.
  echo Avise o Codex para preparar novamente o projeto.
  echo.
  pause
  exit /b 1
)

echo Iniciando Fichas de Ameaca T20...
echo.
echo Mantenha esta janela aberta durante os testes.
echo No Owlbear, use: http://localhost:5173/fichas-de-ameaca-t20/manifest.local.json
echo Para encerrar, pressione Ctrl+C.
echo.

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -Command "$ProgressPreference='SilentlyContinue'; $ours=$false; try { $manifest=(Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:5173/fichas-de-ameaca-t20/manifest.local.json' -TimeoutSec 2).Content | ConvertFrom-Json; $ours=($manifest.author -eq 'DemonRider' -and $manifest.action.popover -like 'http://localhost:5173/fichas-de-ameaca-t20/index.html*') } catch {}; if ($ours) { exit 0 }; if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 2 }; exit 1"

if "%ERRORLEVEL%"=="0" goto already_running
if "%ERRORLEVEL%"=="2" goto port_in_use

"%T20_NODE%" "%T20_VITE%"

echo.
echo O servidor de testes foi encerrado.
pause
exit /b

:already_running
echo A extensao ja esta funcionando em outra janela.
echo Nao e necessario iniciar um segundo servidor.
echo.
echo No Owlbear, use: http://localhost:5173/fichas-de-ameaca-t20/manifest.local.json
pause
exit /b 0

:port_in_use
echo A porta 5173 esta sendo usada por outro programa.
echo Feche o outro servidor ou programa e tente novamente.
echo.
pause
exit /b 1
