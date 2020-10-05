# setup-xcode
This action is intended to switch between pre-installed versions of Xcode for macOS images in GitHub Actions.  

The list of all available versions can be found in [virtual-environments](https://github.com/actions/virtual-environments/blob/master/images/macos/macos-10.15-Readme.md#xcode) repository.

# Available parameters
| Argument                | Description              | Format    |
|-------------------------|--------------------------|--------------------|
| `xcode-version`           | Specify the Xcode version to use | - `latest` or<br> - `latest-stable` or<br> - [SemVer](https://semver.org/) string |

**Notes:**
- `latest-stable` points to the latest stable version of Xcode
- `latest` *includes* beta releases that GitHub actions has installed
- SemVer examples: `10`, `11.4`, `12.0`, `11.7.0`, `^11.7.0` (find more examples in [SemVer cheatsheet](https://devhints.io/semver))
- If sets a specific version, wraps it to single quotes in YAML like `'12.0'` to pass it as string because GitHub trimmes trailing `.0` from numbers

# Usage
Set the latest stable Xcode version:
```
jobs:
  build:
    runs-on: macos-latest
    steps:
    - uses: maxim-lobanov/setup-xcode@v1.1
      with:
        xcode-version: latest-stable
```

Set the latest Xcode version including beta releases:
```
jobs:
  build:
    runs-on: macos-latest
    steps:
    - uses: maxim-lobanov/setup-xcode@v1.1
      with:
        xcode-version: latest
```

Set the specific version of Xcode:
```
jobs:
  build:
    runs-on: macos-latest
    steps:
    - uses: maxim-lobanov/setup-xcode@v1.1
      with:
        xcode-version: '12.0'
```
# License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
