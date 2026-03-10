set dotenv-load

default: build

build:
    cd docs && npm run build

dev:
    cd docs && npm run dev -- --host

preview:
    cd docs && npm run preview -- --host
