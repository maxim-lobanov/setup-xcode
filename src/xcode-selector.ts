import * as child from "child_process";
import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";

export interface XcodeVersion {
    version: string;
    path: string;
    stable: boolean;
}

export class XcodeSelector {
    private xcodeRootDirectory = "/Applications";
    private xcodeFilenameRegex = /Xcode_([\d.]+)(_beta)?\.app/;

    private getXcodeVersionFromAppPath(appPath: string): XcodeVersion | null {
        const match = appPath.match(this.xcodeFilenameRegex);
        if (!match || match.length < 2) {
            return null;
        }

        const version = semver.coerce(match[1]);
        if (!semver.valid(version) || !version) {
            return null;
        }

        return {
            version: version.version,
            path: appPath,
            stable: !match[2],
        };
    }

    public getAllVersions(): XcodeVersion[] {
        const childrenAll = fs.readdirSync(this.xcodeRootDirectory, { encoding: "utf8", withFileTypes: true });
        const childrenReal = childrenAll.filter(child => !child.isSymbolicLink() && child.isDirectory()).map(child => path.join(this.xcodeRootDirectory, child.name));

        const xcodeVersions = childrenReal.map(appPath => this.getXcodeVersionFromAppPath(appPath)).filter((appItem): appItem is XcodeVersion => !!appItem);

        // sort versions array by descending to make sure that the newest version will be picked up
        return xcodeVersions.sort((first, second) => semver.compare(second.version, first.version));
    }
    

    public findVersion(versionSpec: string): XcodeVersion | null {
        const availableVersions = this.getAllVersions();
        if (availableVersions.length === 0) {
            return null;
        }

        if (versionSpec === "latest") {
            return availableVersions[0];
        }

        if (versionSpec === "latest-stable") {
            return availableVersions.filter(ver => ver.stable)[0];
        }

        return availableVersions.find(ver => semver.satisfies(ver.version, versionSpec)) ?? null;
    }

    setVersion(xcodeVersion: XcodeVersion): void {
        if (!fs.existsSync(xcodeVersion.path)) {
            throw new Error(`Invalid version: Directory '${xcodeVersion.path}' doesn't exist`);
        }

        child.spawnSync("sudo", ["xcode-select", "-s", xcodeVersion.path]);

        // set "MD_APPLE_SDK_ROOT" environment variable to specify Xcode for Mono and Xamarin
        core.exportVariable("MD_APPLE_SDK_ROOT", xcodeVersion.path);
    }
    
}
