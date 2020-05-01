# setup-xcode
This action is intended to switch between pre-installed versions of Xcode for macOS images in GitHub Actions.  

The list of all available versions can be found in [virtual-environments](https://github.com/actions/virtual-environments/blob/master/images/macos/macos-10.15-Readme.md#xcode) repository.

# Available parameters
| Argument                | Description              | Format    |
|-------------------------|--------------------------|--------------------|
| `xcode-version`           | Specify the Xcode version to use | `latest` keyword or any [semver](https://semver.org/) string  |

**Examples:** `latest`, `10`, `11.4`, `11.4.0`, `^11.4.0`  

# Usage
```
name: CI
on: [push]
jobs:
  build:
    name: Set 
    runs-on: macos-latest
    steps:
    - name: setup-xcode
      uses: maxim-lobanov/setup-xcode@v1.0
      with:
        xcode-version: 11.4 # set the latest available Xcode 11.4.*

    - name: setup-latest-xcode
      uses: maxim-lobanov/setup-xcode@v1.0
      with:
        xcode-version: latest # set the latest available Xcode 11.4.*
```

# License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
