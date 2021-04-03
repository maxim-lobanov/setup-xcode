import fs from "fs";
import path from "path";
import * as xcodeUtils from "../src/xcode-utils";

let pathJoinSpy: jest.SpyInstance;
let readdirSyncSpy: jest.SpyInstance;
let getXcodeReleaseTypeSpy: jest.SpyInstance;
let parsePlistFileSpy: jest.SpyInstance;

const buildPlistPath = (plistName: string) => {
    return `${__dirname}/data/${plistName}`;
};

const buildFsDirentItem = (name: string, opt: { isSymbolicLink: boolean; isDirectory: boolean }): fs.Dirent => {
    return {
        name,
        isSymbolicLink: () => opt.isSymbolicLink,
        isDirectory: () => opt.isDirectory
    } as fs.Dirent;
};

const fakeReadDirResults = [
    buildFsDirentItem("Xcode_2.app", { isSymbolicLink: true, isDirectory: false }),
    buildFsDirentItem("Xcode.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode12.4.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.1.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.1_beta.app", { isSymbolicLink: true, isDirectory: false }),
    buildFsDirentItem("Xcode_11.2.1.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.4.app", { isSymbolicLink: true, isDirectory: false }),
    buildFsDirentItem("Xcode_11.4_beta.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_11.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("Xcode_12_beta.app", { isSymbolicLink: false, isDirectory: true }),
    buildFsDirentItem("third_party_folder", { isSymbolicLink: false, isDirectory: true }),
];

describe("getInstalledXcodeApps", () => {
    beforeEach(() => {
        readdirSyncSpy = jest.spyOn(fs, "readdirSync");
    });

    it("versions are filtered correctly", () => {
        readdirSyncSpy.mockImplementation(() => fakeReadDirResults);
        const expectedVersions: string[] = [
            "/Applications/Xcode.app",
            "/Applications/Xcode12.4.app",
            "/Applications/Xcode_11.1.app",
            "/Applications/Xcode_11.2.1.app",
            "/Applications/Xcode_11.4_beta.app",
            "/Applications/Xcode_11.app",
            "/Applications/Xcode_12_beta.app",
        ];

        const installedXcodeApps = xcodeUtils.getInstalledXcodeApps();
        expect(installedXcodeApps).toEqual(expectedVersions);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });
});

describe("getXcodeReleaseType", () => {
    beforeEach(() => {
        pathJoinSpy = jest.spyOn(path, "join");
    });

    it.each([
        ["xcode-stable-license.plist", "GM"],
        ["xcode-beta-license.plist", "Beta"],
        ["xcode-empty-license.plist", "Unknown"],
        ["xcode-fake.plist", "Unknown"],
    ] as [string, xcodeUtils.XcodeVersionReleaseType][])("%s -> %s", (plistName: string, expected: xcodeUtils.XcodeVersionReleaseType) => {
        const plistPath = buildPlistPath(plistName);
        pathJoinSpy.mockImplementation(() => plistPath);
        const releaseType = xcodeUtils.getXcodeReleaseType("");
        expect(releaseType).toBe(expected);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });
});

describe("getXcodeVersionInfo", () => {
    beforeEach(() => {
        pathJoinSpy = jest.spyOn(path, "join");
        getXcodeReleaseTypeSpy = jest.spyOn(xcodeUtils, "getXcodeReleaseType");
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    it("read version from plist", () => {
        const plistPath = buildPlistPath("xcode-version.plist");
        pathJoinSpy.mockImplementation(() => plistPath);
        getXcodeReleaseTypeSpy.mockImplementation(() => "GM");

        const expected: xcodeUtils.XcodeVersion = {
            version: "12.0.1",
            buildNumber: "12A7300",
            path: "fake_path",
            releaseType: "GM",
            stable: true
        };

        const xcodeInfo = xcodeUtils.getXcodeVersionInfo("fake_path");
        expect(xcodeInfo).toEqual(expected);
    });

    describe("'stable' property", () => {
        it.each([
            ["GM", true],
            ["Beta", false],
            ["Unknown", false]
        ])("%s -> %s", (releaseType: string, expected: boolean) => {
            const plistPath = buildPlistPath("xcode-version.plist");
            pathJoinSpy.mockImplementation(() => plistPath);
            getXcodeReleaseTypeSpy.mockImplementation(() => releaseType);

            const xcodeInfo = xcodeUtils.getXcodeVersionInfo("fake_path");
            expect(xcodeInfo).toBeTruthy();
            expect(xcodeInfo?.stable).toBe(expected);
        });
    });

    describe("coerce validation", () => {
        beforeEach(() => {
            parsePlistFileSpy = jest.spyOn(xcodeUtils, "parsePlistFile");
        });
    
        afterEach(() => {
            jest.resetAllMocks();
            jest.clearAllMocks();
        });

        it("full version", () => {
            parsePlistFileSpy.mockImplementation(() => {
                return {
                    CFBundleShortVersionString: "12.0.1", ProductBuildVersion: "2FF"
                };
            });
            getXcodeReleaseTypeSpy.mockImplementation(() => "GM");

            const xcodeInfo = xcodeUtils.getXcodeVersionInfo("fake_path");
            expect(xcodeInfo?.version).toBe("12.0.1");
        });

        it("partial version", () => {
            parsePlistFileSpy.mockImplementation(() => {
                return {
                    CFBundleShortVersionString: "10.3", ProductBuildVersion: "2FF"
                };
            });
            getXcodeReleaseTypeSpy.mockImplementation(() => "GM");

            const xcodeInfo = xcodeUtils.getXcodeVersionInfo("fake_path");
            expect(xcodeInfo?.version).toBe("10.3.0");
        });

        it("invalid version", () => {
            parsePlistFileSpy.mockImplementation(() => {
                return {
                    CFBundleShortVersionString: "fake_version", ProductBuildVersion: "2FF"
                };
            });
            getXcodeReleaseTypeSpy.mockImplementation(() => "GM");

            const xcodeInfo = xcodeUtils.getXcodeVersionInfo("fake_path");
            expect(xcodeInfo).toBeNull();
        });
    });
});
