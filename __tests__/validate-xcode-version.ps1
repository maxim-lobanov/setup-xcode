param ([string]$XcodeVersion)

$XcodeVersion = $XcodeVersion.TrimStart("^", "~")
$ExpectedOutput = "Xcode $XcodeVersion"

[string]$ActualOutput = Invoke-Expression "xcodebuild -version"
Write-Host "Actual Xcode version: $ActualOutput"
Write-Host "Expected Xcode version: $ExpectedOutput"
if (!$ActualOutput.StartsWith($ExpectedOutput)) {
    Write-Error "Incorrect Xcode selected"
    exit 1
}