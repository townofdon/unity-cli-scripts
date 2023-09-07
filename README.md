# Unity CLI Scripts

This is a collection of CLI commands I've cobbled together to make life easier for future-me. Hopefully you can find these useful, too.

## Setup

Steps to get up and running:

- Run `npm install`
- Add an `.env` file to the root directory of this repo - see `.env.example` as a reference.

## Commands

All available commands can be invoked like so:

```
./bin/cli.js <command>

# example
./bin/cli.js version
./bin/cli.js deploy
# etc.
```

To see full list of commands, you can run:

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
./bin/cli.js version --major
./bin/cli.js version --minor
./bin/cli.js version --patch
./bin/cli.js version --set 1.2.3
```

Other options:

- `--dry` - perform a dry run with no changes
- `--verbose` - use in conjunction with `--dry` - print out the full contents of `ProjectSettings.asset` to see what the changes will be.

### [CMD] Deploy

This command utilizes [Butler](https://itch.io/board/24575/butler) to automatically upload builds to Itch.io.

It reads the current Unity project version in `ProjectSettings.asset`, prompts you to make sure all is well, and then zips up the
build contents and sends them off to their new home on Itch.io.

```
./bin/cli.js deploy
```

### [CMD] Testing Locally

A docker setup is used to run a unity webgl build locally. This copies the files from the Unity build you designated in the `.env` file to a temp dir.
Then, a server starts up at `localhost://8080` where you can run your webgl build.

This is a great way to quickly test a local build independent of the Unity interface to make sure everything is set up correctly.

```
./bin/cli.js test

# or, alternatively:
npm test
```

Here's the manual testing process if you ever should need it:

- Copy contents of a build to `./test/webgl` (make sure this folder contains an index.html file)
- `cd ./test`
- `docker-compose up`
- Point browser to `localhost://8080`
- `docker-compose down` to cleanup processes

## Contributing

Feel free to submit a PR, fork this repo, or just steal it for your own usage. If it helps you in any way, I'm glad 😄

## Links

- https://dev.to/tomowatt/running-an-unity-webgl-game-within-docker-5039


