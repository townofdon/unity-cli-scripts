# Unity CLI Scripts

This is a collection of CLI commands I've cobbled together over the years to do more advance stuff within Unity. This is borne out of the desire to automate more stuff and spend less time fighting with the tool.

**NOTE:** All commands below assume that your command line shell is currently pointed to the _same directory_ as this Readme.

## Setup

```
npm install
```

Add an `.env` file to the root directory of this repo - see `.env.example` as a reference.

## Commands

All commands are invoked like so:

```
./bin/cli.js <command>
# example
./bin/cli.js version
./bin/cli.js --help
```

### [CMD] Version Bump

```
# major version bump
version --major

# minor version bump
version --minor

# patch version bump
version --patch

# set version manually
version --set 1.2.3
```

### [CMD] Auto Deploy - Itch.io using Butler

```
cd ./shell
./deploy.sh
```

### [CMD] Testing Locally

A docker setup is used to run a unity webgl build locally. This copies the files from the Unity build you designated in the `.env` file to a temp dir.

```
cd ./shell
./test.sh
# then point browser to: localhost://8080
```

Manual testing process:

```
# copy Build contents to ./test/webgl (make sure the folder contains an index.html file)

# start an instance
docker-compose up

# then point browser to: localhost://8080

# stop an instance
docker-compose down
```

### Links

- https://dev.to/tomowatt/running-an-unity-webgl-game-within-docker-5039


