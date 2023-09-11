# Unity CLI Scripts

A growing collection of CLI commands used for the Unity engine. The aim is to automate tasks such as bumping the version number, fixing duplicate saveable-entity uuids, deploying, starting a webgl server locally, etc.

## Setup

Steps to get up and running:

- Run `npm install`
- Add an `.env` file to the root directory of this repo - see [.env.example](./.env.example) as a reference.

## Commands

Commands can be invoked like so:

```
./bin/cli.js <command> [<args>]
# or
npm start <command> [-- <args>]
```

To see full list of commands, you can run:

```
./bin/cli.js --help
```

&nbsp;

### ⚡ `init`

Start setup wizard to capture preferences for easy-to-forget Unity settings, like company name, version, and WebGL compression.

This modifies the Unity `ProjectSettings.asset` file.

```
./bin/cli.js init
```

**Options**

| Flag           | Desc                                                          | Type           |
|-------------------|------------------------------------------------------------|----------------|
| `--dry`           | perform a dry run - preview changes                        | Boolean        |

&nbsp;

### ⚡ `version`

Bump the version in the Unity build. This modifies the Unity `ProjectSettings.asset` file.

```
./bin/cli.js version --major
```

```
./bin/cli.js version --minor
```

```
./bin/cli.js version --patch
```

```
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

&nbsp;

### ⚡ `uniq-uuid`

Find and auto-fix duplicate UUID fields in entire project. Useful for custom save systems.

NOTE - this will not affect internal Unity Guids (e.g. those defined in `.meta` files).

```
./bin/cli.js uniq-uuid
```

**Options**

| Flag           | Desc                                                          | Default        |
|-------------------|------------------------------------------------------------|----------------|
| `--uuidfield`     | name of the uuid field to make unique                      | _uuid          |
| `--searchdir`     | directory where to search for project assets               | Assets         |
| `--dry`           | perform a dry run                                          | false          |
| `--verbose`       | verbose printout - (mainly for debugging)                  | false          |

&nbsp;
### ⚡ `deploy`

Deploy a build to Itch.io using [Butler](https://itch.io/board/24575/butler).

**Steps:**

1. [Create a build in Unity](https://docs.unity3d.com/Manual/PublishingBuilds.html)
1. Ensure `UNITY_WEBGL_BUILD_DIR` is set correctly in `.env` ([example](./.env.example#L4C1-L4C22))
1. Run:

```
./bin/cli.js deploy
```

&nbsp;

### ⚡ `webgl`

Run a local webgl server. Requires [Docker](https://docs.docker.com/desktop/install/mac-install/).

This is a great way to quickly test a local build independent of the Unity interface to make sure everything is set up correctly.

**Steps:**

1. Ensure `UNITY_WEBGL_BUILD_DIR` is set correctly in `.env` ([example](./.env.example#L4C1-L4C22))
1. Run:

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


