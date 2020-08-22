import * as fs from "fs";
import * as child from "child_process";
import * as core from "@actions/core";
import { XcodeSelector, XcodeVersion } from "../src/xcode-selector";

jest.mock("fs");
jest.mock("child_process");
jest.mock("@actions/core");

const buildFsDirentItem = (name: string, opt: { isSymbolicLink: boolean; isDirectory: boolean }): fs.Dirent => {
    return {
        name,
        isSymbolicLink: () => opt.isSymbolicLink,
        isDirectory: () => opt.isDirectory
    } as fs.Dirent;
};

const fakeReadDirResults = [
    buildFsDirentItem("Xcode.app", { isSymbolicLink: true, isDirectory: false }),
    buildFsDirentItem("Xcode.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.1.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.1_beta.app", { isSymbolicLink: true, isDirectory: false }),
    buildFsDirentItem("Xcode_11.2.1.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.4.app", { isSymbolicLink: true, isDirectory: false }),
    buildFsDirentItem("Xcode_11.4_beta.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_12_beta.app", { isSymbolicLink: false, isDirectory: true}),
    buildFsDirentItem("third_party_folder", { isSymbolicLink: false, isDirectory: true }),
];

const fakeGetVersionsResult: XcodeVersion[] = [
    { version: "12.0.0", path: "", stable: false },
    { version: "11.4.0", path: "", stable: true },
    { version: "11.2.1", path: "", stable: true },
    { version: "11.2.0", path: "", stable: true },
    { version: "11.0.0", path: "", stable: true },
    { version: "10.3.0", path: "", stable: true }
];

describe("XcodeSelector", () => {
    describe("getXcodeVersionFromAppPath", () => {
        it.each([
            ["/temp/Xcode_11.app", { version: "11.0.0", path: "/temp/Xcode_11.app", stable: true }],
            ["/temp/Xcode_11.2.app", { version: "11.2.0", path: "/temp/Xcode_11.2.app", stable: true }],
            ["/temp/Xcode_11.2.1.app", { version: "11.2.1", path: "/temp/Xcode_11.2.1.app", stable: true }],
            ["/temp/Xcode_11.2.1_beta.app", { version: "11.2.1", path: "/temp/Xcode_11.2.1_beta.app", stable: false }],
            ["/temp/Xcode.app", null],
            ["/temp/Xcode_11.2", null],
            ["/temp/Xcode.11.2.app", null]
        ])("'%s' -> '%s'", (input: string, expected: XcodeVersion | null) => {
            // test private method
            const actual = new XcodeSelector()["getXcodeVersionFromAppPath"](input);
            expect(actual).toEqual(expected);
        });

    });

    describe("getAllVersions", () => {
        beforeEach(() => {
            jest.spyOn(fs, "readdirSync").mockImplementation(() => fakeReadDirResults);
        });

        afterEach(() => {
            jest.resetAllMocks();
            jest.clearAllMocks();
        });

        it("versions are filtered correctly", () => {
            const sel = new XcodeSelector();
            const expectedVersions: XcodeVersion[] = [
                { version: "12.0.0", path: "/Applications/Xcode_12_beta.app", stable: false},
                { version: "11.4.0", path: "/Applications/Xcode_11.4_beta.app", stable: false },
                { version: "11.2.1", path: "/Applications/Xcode_11.2.1.app", stable: true },
                { version: "11.1.0", path: "/Applications/Xcode_11.1.app", stable: true },
                { version: "11.0.0", path: "/Applications/Xcode_11.app", stable: true },
            ];
            expect(sel.getAllVersions()).toEqual(expectedVersions);
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
            sel.getAllVersions = (): XcodeVersion[] => fakeGetVersionsResult;
            const matchedVersion = sel.findVersion(versionSpec)?.version ?? null;
            expect(matchedVersion).toBe(expected);
        });
    });

    describe("setVersion", () => {
        let coreExportVariableSpy: jest.SpyInstance;
        let fsExistsSpy: jest.SpyInstance;
        let fsSpawnSpy: jest.SpyInstance;
        const xcodeVersion: XcodeVersion = {
            version: "11.4",
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