del /f /q metamorphose.js
tsc && browserify --debug ./dist/index.js -o metamorphose.js
