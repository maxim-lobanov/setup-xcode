# Spordle/setup-xcode GitHub action

This action is intended to switch between pre-installed versions of Xcode for macOS images in GitHub Actions.

The list of all available versions can be found in [runner-images](https://github.com/actions/runner-images/blob/master/images/macos/macos-13-Readme.md#xcode) repository.

## Available parameters

| Argument        | Description                      | Format                                                                                                     |
| --------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `xcode-version` | Specify the Xcode version to use | - `latest` or<br> - `latest-stable` or<br> - [SemVer](https://semver.org/) string or<br> - `<semver>-beta` |

**Notes:**

- `latest-stable` points to the latest stable version of Xcode
- `latest` _includes_ beta releases that GitHub actions has installed
- SemVer examples: `14`, `14.1`, `14.3.1`, `^14.3.0` (find more examples in [SemVer cheatsheet](https://devhints.io/semver))
- `-beta` suffix after SemVer will only select among beta releases that GitHub actions has installed
- If sets a specific version, wraps it to single quotes in YAML like `'12.0'` to pass it as string because GitHub trimmes trailing `.0` from numbers

## Usage

Set the latest stable Xcode version:

```yaml
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: Spordle/setup-xcode@v1
        with:
          xcode-version: latest-stable
```

Set the latest Xcode version including beta releases:

```yaml
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: Spordle/setup-xcode@v1
        with:
          xcode-version: latest
```

Set the specific stable version of Xcode:

```yaml
jobs:
  build:
    runs-on: macos-13
    steps:
      - uses: Spordle/setup-xcode@v1
        with:
          xcode-version: "14.3.1"
```

Set the specific beta version of Xcode:

```yaml
jobs:
  build:
    runs-on: macos-13
    steps:
      - uses: Spordle/setup-xcode@v1
        with:
          xcode-version: "15.0-beta"
```

## Versioning and Releases

- Tagging Strategy: Use SemVer tags like `v1.2.0`. Maintain a moving major tag (e.g., `v1`) that always points to the latest non-breaking `v1.x.y`.

- Pinning for Consumers: Recommend `uses: Spordle/setup-xcode@v1` for stable updates, or pin to an exact tag for deterministic builds (e.g., `@v1.2.0`).

- Build Artifacts: Always build and commit the compiled action before tagging. The runner executes `index.js` referenced by `action.yml`.

- Release Process: Update code, run tests, build, commit `dist`, tag the version, push, and update the moving `v1` tag.

  ```sh
  # Ensure clean install and tests pass
  npm ci
  npm test

  # Build the bundled action
  npm run build

  # Commit changes (use your prefered way)
  git add .
  git commit -m "<commitMessage>"

  # Tag and push the release
  git tag v1.2.0
  git push origin v1.2.0
  ```

- Breaking Changes: Ship breaking changes under a new major (e.g., `v2.x.y`) and move `v2` to track the latest compatible release. Do not repoint `v1` to breaking changes.

#### Update the moving major tag

```sh
git tag -f v1 v1.2.0
git push -f origin v1
```

#### Rollback the moving major tag

```sh
git tag -f v1 v1.1.3
git push -f origin v1
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
