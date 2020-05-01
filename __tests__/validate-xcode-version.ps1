param (
    [string]$XcodeVersion
)

$expectedXcodePath = "/Applications/Xcode_$XcodeVersion.app"

Write-Host "Check Xcode version"
$actualXcodePath = & xcode-select -p
if (!$actualXcodePath.StartsWith($expectedXcodePath)) {
    Write-Error "Incorrect Xcode: $actualXcodePath"
    exit 1
}

Write-Host "Correct Xcode: $XcodeVersion"