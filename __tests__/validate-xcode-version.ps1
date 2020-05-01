param ([string]$XcodeVersion)

$XcodeVersion = $XcodeVersion.TrimStart("^", "~")
$ExpectedOutput = "Xcode $XcodeVersion"

[string]$ActualOutput = Invoke-Expression "xcodebuild -version"
if (!$ActualOutput.StartsWith($ExpectedOutput)) {
    Write-Error "Incorrect  selected: $actualXcodePath"
    exit 1
}