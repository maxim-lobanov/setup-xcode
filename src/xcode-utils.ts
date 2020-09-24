import * as path from "path";
import * as fs from "fs";
import * as core from "@actions/core";
import * as plist from "plist";

export enum XcodeReleaseType {
    GM = "GM",
    Beta = "Beta",
    Unknown = "Unknown"
}

export const getXcodeReleaseType = (xcodeRootPath: string): XcodeReleaseType => {
    const licenseInfoPlistPath = path.join(xcodeRootPath, "Contents", "Resources", "LicenseInfo.plist");
    if (!fs.existsSync(licenseInfoPlistPath)) {
        // Every Xcode should contain license plist but it can be changed in future
        core.warning("Unable to determine Xcode version type based on license plist");
        core.warning(`Xcode License plist doesn't on exist on path '${licenseInfoPlistPath}'`);
        return XcodeReleaseType.Unknown;
    }

    const licenseInfoRawContent = fs.readFileSync(licenseInfoPlistPath, "utf8");
    const licenseInfo = plist.parse(licenseInfoRawContent) as plist.PlistObject;
    if (!licenseInfo.licenseType) {
        core.warning("Unable to determine Xcode version type based on license plist");
        core.warning("Xcode License plist doesn't contain 'licenseType' property");
        return XcodeReleaseType.Unknown;
    }

    const licenseType = licenseInfo.licenseType.toString().toLowerCase();

    if (licenseType.includes("beta")) {
        return XcodeReleaseType.Beta;
    }
    
    return XcodeReleaseType.GM;
};
