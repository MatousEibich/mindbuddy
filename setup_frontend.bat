@echo off
cd frontend
echo Installing node modules...
call npm install
echo Creating .env.example file...
echo API_URL=http://192.168.x.x:8000 > .env.example
echo Done!
echo.
echo To start the app, run:
echo cd frontend
echo npm start
pause 