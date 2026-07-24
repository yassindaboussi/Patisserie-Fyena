@echo off
title Fyena - Serveur local
echo ============================================
echo   Demarrage du serveur local pour Fyena...
echo ============================================
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    echo Ouverture du site dans votre navigateur...
    start "" http://localhost:8000
    python -m http.server 8000
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    echo Ouverture du site dans votre navigateur...
    start "" http://localhost:8000
    py -m http.server 8000
    goto :eof
)

echo Python n'a pas ete trouve sur cet ordinateur.
echo.
echo Solution : installez Python depuis https://www.python.org/downloads/
echo ( cochez "Add python.exe to PATH" pendant l'installation )
echo puis relancez ce fichier.
echo.
pause
