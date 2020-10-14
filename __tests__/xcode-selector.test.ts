import * as fs from "fs";
import * as child from "child_process";
import * as core from "@actions/core";
import { XcodeSelector } from "../src/xcode-selector";
import * as xcodeUtils from "../src/xcode-utils";

jest.mock("fs");
jest.mock("child_process");
jest.mock("@actions/core");
jest.mock("../src/xcode-utils");

const fakeGetXcodeVersionInfoResult: xcodeUtils.XcodeVersion[] = [
    { version: "10.3.0", buildNumber: "", path: "/Applications/Xcode_10.3.app", releaseType: "GM", stable: true },
    { version: "12.0.0", buildNumber: "", path: "/Applications/Xcode_12_beta.app", releaseType: "Beta", stable: false },
    { version: "11.2.1", buildNumber: "", path: "/Applications/Xcode_11.2.1.app", releaseType: "GM", stable: true },
    { version: "11.4.0", buildNumber: "", path: "/Applications/Xcode_11.4.app", releaseType: "GM", stable: true },
    { version: "11.0.0", buildNumber: "", path: "/Applications/Xcode_11.app", releaseType: "GM", stable: true },
    { version: "11.2.0", buildNumber: "", path: "/Applications/Xcode_11.2.app", releaseType: "GM", stable: true },
];
const fakeGetInstalledXcodeAppsResult: string[] = [
    "/Applications/Xcode_10.3.app",
    "/Applications/Xcode_12_beta.app",
    "/Applications/Xcode_11.2.1.app",
    "/Applications/Xcode_11.4.app",
    "/Applications/Xcode_11.app",
    "/Applications/Xcode_11.2.app",
    "/Applications/Xcode_fake_path.app"
];
const expectedGetAllVersionsResult: xcodeUtils.XcodeVersion[] = [
    { version: "12.0.0", buildNumber: "", path: "/Applications/Xcode_12_beta.app", releaseType: "Beta", stable: false },
    { version: "11.4.0", buildNumber: "", path: "/Applications/Xcode_11.4.app", releaseType: "GM", stable: true },
    { version: "11.2.1", buildNumber: "", path: "/Applications/Xcode_11.2.1.app", releaseType: "GM", stable: true },
    { version: "11.2.0", buildNumber: "", path: "/Applications/Xcode_11.2.app", releaseType: "GM", stable: true },
    { version: "11.0.0", buildNumber: "", path: "/Applications/Xcode_11.app", releaseType: "GM", stable: true },
    { version: "10.3.0", buildNumber: "", path: "/Applications/Xcode_10.3.app", releaseType: "GM", stable: true },
];

describe("XcodeSelector", () => {
    describe("getAllVersions", () => {
        beforeEach(() => {
            jest.spyOn(xcodeUtils, "getInstalledXcodeApps").mockImplementation(() => fakeGetInstalledXcodeAppsResult);
            jest.spyOn(xcodeUtils, "getXcodeVersionInfo").mockImplementation((path) => fakeGetXcodeVersionInfoResult.find(app => app.path === path) ?? null);
        });

        afterEach(() => {
            jest.resetAllMocks();
            jest.clearAllMocks();
        });

        it("versions are filtered correctly", () => {
            const sel = new XcodeSelector();
            expect(sel.getAllVersions()).toEqual(expectedGetAllVersionsResult);
        });
    });

    describe("findVersion", () => {
        it.each([
            ["latest", "12.0.0"],
            ["latest-stable", "11.4.0"],
            ["11", "11.4.0"],
            ["11.x", "11.4.0"],
            ["11.2.x", "11.2.1"],
            ["11.2.0", "11.2.0"],
            ["10.x", "10.3.0"],
            ["~11.2.0", "11.2.1"],
            ["^11.2.0", "11.4.0"],
            ["< 11.0", "10.3.0"],
            ["10.0.0 - 11.2.0", "11.2.0"],
            ["give me latest version", null]
        ] as [string, string | null][])("'%s' -> '%s'", (versionSpec: string, expected: string | null) => {
            const sel = new XcodeSelector();
            sel.getAllVersions = (): xcodeUtils.XcodeVersion[] => expectedGetAllVersionsResult;
            const matchedVersion = sel.findVersion(versionSpec)?.version ?? null;
            expect(matchedVersion).toBe(expected);
        });
    });

    describe("setVersion", () => {
        let coreExportVariableSpy: jest.SpyInstance;
        let fsExistsSpy: jest.SpyInstance;
        let fsSpawnSpy: jest.SpyInstance;
        const xcodeVersion: xcodeUtils.XcodeVersion = {
            version: "11.4",
            buildNumber: "12A7300",
            releaseType: "GM",
            path: "/Applications/Xcode_11.4.app",
            stable: true
        };

        beforeEach(() => {
            coreExportVariableSpy = jest.spyOn(core, "exportVariable");
            fsExistsSpy = jest.spyOn(fs, "existsSync");
            fsSpawnSpy = jest.spyOn(child, "spawnSync");
        });

        afterEach(() => {
            jest.resetAllMocks();
            jest.clearAllMocks();
        });

        it("works correctly", () => {
            fsExistsSpy.mockImplementation(() => true);
            const sel = new XcodeSelector();
            sel.setVersion(xcodeVersion);
            expect(fsSpawnSpy).toHaveBeenCalledWith("sudo", ["xcode-select", "-s", "/Applications/Xcode_11.4.app"]);
            expect(coreExportVariableSpy).toHaveBeenCalledWith("MD_APPLE_SDK_ROOT", "/Applications/Xcode_11.4.app");
        });

        it("error is thrown if version doesn't exist", () => {
            fsExistsSpy.mockImplementation(() => false);
            const sel = new XcodeSelector();
            expect(() => sel.setVersion(xcodeVersion)).toThrow();
        });
    });
    
});