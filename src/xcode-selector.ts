import * as child from "child_process";
import * as core from "@actions/core";
import * as fs from "fs";
import * as semver from "semver";
import { getInstalledXcodeApps, getXcodeVersionInfo, XcodeVersion } from "./xcode-utils";

export class XcodeSelector {
    public getAllVersions(): XcodeVersion[] {
        const potentialXcodeApps = getInstalledXcodeApps().map(appPath =>
            getXcodeVersionInfo(appPath),
        );
        const xcodeVersions = potentialXcodeApps.filter((app): app is XcodeVersion => !!app);

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

        const betaSuffix = "-beta";
        let isStable = true;
        if (versionSpec.endsWith(betaSuffix)) {
            isStable = false;
            versionSpec = versionSpec.slice(0, -betaSuffix.length);
        }

        return (
            availableVersions
                .filter(ver => ver.stable === isStable)
                .find(ver => semver.satisfies(ver.version, versionSpec)) ?? null
        );
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
