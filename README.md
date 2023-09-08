# Unity CLI Scripts

A growing collection of CLI commands used for the Unity engine. The aim is to automate tasks such as bumping the version number, fixing duplicate saveable-entity uuids, deploying, starting a webgl server locally, etc.

## Setup

Steps to get up and running:

- Run `npm install`
- Add an `.env` file to the root directory of this repo - see `.env.example` as a reference.

## Commands

Commands can be invoked like so:

```
./bin/cli.js <command>
# or
npm start <command> -- <args>

# example
./bin/cli.js version --major
npm start version -- --major
# etc.
```

To see full list of commands, you can run:

```
./bin/cli.js --help
```

&nbsp;

### ⚡ `version`

Bump the version in the Unity build. This updates the Unity `ProjectSettings.asset` file.

```
./bin/cli.js version --major
./bin/cli.js version --minor
./bin/cli.js version --patch
./bin/cli.js version --set 1.2.3
```

**Options**

| Flag           | Desc                                                          | Type           |
|-------------------|------------------------------------------------------------|----------------|
| `--major`         | perform a major version bump                               | Boolean        |
| `--minor`         | perform a minor version bump                               | Boolean        |
| `--patch`         | perform a patch version bump                               | Boolean        |
| `--set`           | manually set the version number                            | String         |
| `--dry`           | perform a dry run                                          | Boolean        |
| `--verbose`       | verbose printout (used only with `--dry`)                  | Boolean        |

&nbsp;

### ⚡ `uniq-uuid`

Search through entire project for duplicate UUID fields, and replace duplicates with newly-generated UUIDs. Useful for custom save systems.

NOTE - this will not affect internal Unity Guids (e.g. those defined in `.meta` files).

```
./bin/cli.js uniq-uuid
```

**Options**

| Flag           | Desc                                                          | Default        |
|-------------------|------------------------------------------------------------|----------------|
| `--monobehaviour` | name of the MonoBehaviour                                  | SaveableEntity |
| `--uuidfield`     | name of the uuid field to make unique                      | _uuid          |
| `--assetsdir`     | directory where to search for project assets               | Assets         |
| `--dry`           | perform a dry run                                          | false          |
| `--verbose`       | verbose printout                                           | false          |

&nbsp;
### ⚡ `deploy`

This command utilizes [Butler](https://itch.io/board/24575/butler) to automatically upload builds to Itch.io.

It reads the current Unity project version in `ProjectSettings.asset`, zips up the
build contents, and sends them off to their new home on Itch.io.

```
./bin/cli.js deploy
```

&nbsp;

### ⚡ `webgl`

A docker setup is used to run a unity webgl build locally. This copies the files from the Unity build you designated in the `.env` file to a temp dir.
Then, a server starts up which hosts the local webgl build.

This is a great way to quickly test a local build independent of the Unity interface to make sure everything is set up correctly.

```
./bin/cli.js webgl
```

Once local server is up and running, open the following url in your browser:

```
localhost://8080
```


&nbsp;

&nbsp;
## Contributing

Feel free to submit a PR, fork this repo, or steal it for your own usage.

## Links

- https://dev.to/tomowatt/running-an-unity-webgl-game-within-docker-5039


