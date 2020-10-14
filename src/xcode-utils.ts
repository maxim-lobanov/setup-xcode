import * as path from "path";
import * as fs from "fs";
import * as core from "@actions/core";
import * as plist from "plist";

export type XcodeVersionReleaseType = "GM" | "Beta" | "Unknown";

export interface XcodeVersion {
    version: string;
    buildNumber: string;
    path: string;
    releaseType: XcodeVersionReleaseType;
    stable: boolean;
}

const parsePlistFile = (plistPath: string): plist.PlistObject | null => {
    if (!fs.existsSync(plistPath)) {
        core.debug(`Unable to open plist file. File doesn't exist on path '${plistPath}'`);
        return null;
    }

    const plistRawContent = fs.readFileSync(plistPath, "utf8");
    return plist.parse(plistRawContent) as plist.PlistObject;
};

export const getInstalledXcodeApps = (): string[] => {
    const applicationsDirectory = "/Applications";
    const xcodeAppFilenameRegex = /Xcode_([\d.]+)(_beta)?\.app/;

    const allApplicationsChildItems = fs.readdirSync(applicationsDirectory, { encoding: "utf8", withFileTypes: true });
    const allApplicationsRealItems = allApplicationsChildItems.filter(child => !child.isSymbolicLink() && child.isDirectory());
    const allApplicationsFullPaths = allApplicationsRealItems.map(child => path.join(applicationsDirectory, child.name));
    return allApplicationsFullPaths.filter(appPath => xcodeAppFilenameRegex.test(appPath));
};

export const getXcodeReleaseType = (xcodeRootPath: string): XcodeVersionReleaseType => {
    const licenseInfo = parsePlistFile(path.join(xcodeRootPath, "Contents", "Resources", "LicenseInfo.plist"));
    const licenseType = licenseInfo?.licenseType?.toString()?.toLowerCase();
    if (!licenseType) {
        core.debug("Unable to determine Xcode version type based on license plist");
        core.debug("Xcode License plist doesn't contain 'licenseType' property");
        return "Unknown";
    }

    return licenseType.includes("beta") ? "Beta" : "GM";
};

export const getXcodeVersionInfo = (xcodeRootPath: string): XcodeVersion | null => {
    const versionInfo = parsePlistFile(path.join(xcodeRootPath, "Contents", "version.plist"));
    if (!versionInfo) {
        return null;
    }

    const releaseType = getXcodeReleaseType(xcodeRootPath);

    return {
        version: versionInfo.CFBundleShortVersionString?.toString(),
        buildNumber: versionInfo.ProductBuildVersion?.toString(),
        releaseType: releaseType,
        stable: releaseType === "GM",
        path: xcodeRootPath,
    } as XcodeVersion;
};

