import * as core from "@actions/core";
import { XcodeSelector } from "./xcode-selector";

const run = (): void => {
    try {
        if (process.platform !== "darwin") {
            throw new Error(
                `This task is intended only for macOS platform. It can't be run on '${process.platform}' platform`
            );
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
            console.log("Available versions:");
            console.table(selector.getAllVersions());
            throw new Error(
                `Could not find Xcode version that satisfied version spec: '${versionSpec}'`
            );
        }

        core.debug(
            `Xcode ${targetVersion.version} (${targetVersion.buildNumber}) (${targetVersion.path}) will be set`
        );
        selector.setVersion(targetVersion);
        core.info(`Xcode is set to ${targetVersion.version} (${targetVersion.buildNumber})`);

        core.setOutput("version", targetVersion.version);
        core.setOutput("path", targetVersion.path);

        core.exportVariable('XCODE_VERSION', targetVersion.version);
    } catch (error: unknown) {
        core.setFailed((error as Error).message);
    }
};

run();
