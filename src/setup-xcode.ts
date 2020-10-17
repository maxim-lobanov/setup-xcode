import * as core from "@actions/core";
import { XcodeSelector } from "./xcode-selector";
import { EOL } from "os";

const run = (): void => {
    try {
        if (process.platform !== "darwin") {
            throw new Error(`This task is intended only for macOS platform. It can't be run on '${process.platform}' platform`);
        }

        const versionSpec = core.getInput("xcode-version", { required: false });
        core.info(`Switching Xcode to version '${versionSpec}'...`);

        const selector = new XcodeSelector();
        if (core.isDebug()) {
            core.startGroup("Available Xcode versions:");
            core.debug(JSON.stringify(selector.getAllVersions(), null, 2));
            core.endGroup();
        }
        const targetVersion = selector.findVersion(versionSpec);

        if (!targetVersion) {
            throw new Error(
                [
                    `Could not find Xcode version that satisfied version spec: '${versionSpec}'`,
                    "Available versions:",
                    ...selector.getAllVersions().map(ver => `- ${ver.version} (${ver.path})`)
                ].join(EOL)
            );
        }

        core.debug(`Xcode ${targetVersion.version} (${targetVersion.buildNumber}) (${targetVersion.path}) will be set`);
        selector.setVersion(targetVersion);
        core.info(`Xcode is set to ${targetVersion.version} (${targetVersion.buildNumber})`);
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
