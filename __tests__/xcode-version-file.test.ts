import fs from "fs";
import os from "os";
import path from "path";
import * as xcodeVersionFile from "../src/xcode-version-file";

describe("getXcodeVersionFromDotFile", () => {
    let tmpDirPath: string

    beforeEach(() => {
        tmpDirPath = fs.mkdtempSync(path.join(os.tmpdir(), "test-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDirPath, { recursive: true, force: true });
    });

    it("reads the version from .xcode-version file at root of workspace", () => {
        const envMock = {
            'GITHUB_WORKSPACE': tmpDirPath
        };
        const version = "1.0";
        fs.writeFileSync(path.join(tmpDirPath, ".xcode-version"), version);
        const xcodeVersion = xcodeVersionFile.getXcodeVersionFromDotFile(envMock);
        expect(xcodeVersion).toBe(version);
    });

    it("returns undefined if the .xcode-version file does not exist", () => {
        const envMock = {
            'GITHUB_WORKSPACE': path.join(tmpDirPath, "non-existing-directory")
        };
        const xcodeVersion = xcodeVersionFile.getXcodeVersionFromDotFile(envMock);
        expect(xcodeVersion).toBeUndefined();
    });
});