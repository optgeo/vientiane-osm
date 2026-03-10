set dotenv-load

default: build

build:
    if [ ! -d node_modules ]; then npm install; fi
    npm run build

dev:
    npm run dev -- --host

preview:
    npm run preview -- --host
