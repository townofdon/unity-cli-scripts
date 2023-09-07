import semver from 'semver'

export const validateVersion = (version) => {
    if (!semver.valid(version)) {
        throw new Error(`\"${version}\" is not a valid semantic version`)
    }
}