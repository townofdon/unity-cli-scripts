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
./bin/cli.js deploy
# etc.
```

To see full list of commands, you can also run:

```
./bin/cli.js --help
```

Alternatively, you can run commands using the Node binary:

```
npm start <command> -- <args>
# example
npm start version -- --major
```

### [CMD] Version Bump

Bump the version in the Unity build. This updates the Unity `ProjectSettings.asset` file.

You can specify `--major`, `--minor`, or `--patch`. Alternatively you can supply the version manually via `--set <version>`

```
version --major
version --minor
version --patch
version --set 1.2.3
```

Other options:

- `--dry` - perform a dry run with no changes
- `--verbose` - use in conjunction with `--dry` - print out the full contents of `ProjectSettings.asset` to see what the changes will be.

### [CMD] Auto Deploy - Itch.io using Butler

This command utilizes [Butler](https://itch.io/board/24575/butler) to automatically upload builds to Itch.io.

It reads the current Unity project version in `ProjectSettings.asset`, prompts you to make sure all is well, and then zips up the
build contents and sends them off to their new home on Itch.io.

```
deploy
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


