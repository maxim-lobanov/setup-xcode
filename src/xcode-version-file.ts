import * as fs from "fs";
import * as core from "@actions/core";
import * as path from "path";

export const getXcodeVersionFromDotFile = (env: NodeJS.ProcessEnv): string | undefined => {
    const githubWorkspace = env.GITHUB_WORKSPACE;
    if (!githubWorkspace) {
        throw new Error("$GITHUB_WORKSPACE is not set");
    }
    const xcodeVersionFilePath = path.join(githubWorkspace, ".xcode-version");

    try {
        return fs.readFileSync(xcodeVersionFilePath).toString().trimEnd();
    } catch (err) {
        core.debug("No .xcode-version file in repository root");
        return undefined;
    }
};
