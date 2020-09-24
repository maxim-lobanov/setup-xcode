import * as path from "path";
import { getXcodeReleaseType, XcodeReleaseType } from "../src/xcode-utils";

jest.mock("path");

describe("getXcodeReleaseType", () => {
    const buildPlistPath = (plistName: string) => {
        return `${__dirname}/data/${plistName}`;
    };

    let pathJoinSpy: jest.SpyInstance;

    beforeEach(() => {
        pathJoinSpy = jest.spyOn(path, "join");
    });

    it("stable release", () => {
        const plistPath = buildPlistPath("xcode-stable.plist");
        pathJoinSpy.mockImplementation(() => plistPath);
        const releaseType = getXcodeReleaseType("");
        expect(releaseType).toBe(XcodeReleaseType.GM);
    });

    it("beta release", () => {
        const plistPath = buildPlistPath("xcode-beta.plist");
        pathJoinSpy.mockImplementation(() => plistPath);
        const releaseType = getXcodeReleaseType("");
        expect(releaseType).toBe(XcodeReleaseType.Beta);
    });

    it("unknown release", () => {
        const plistPath = buildPlistPath("xcode-empty-license.plist");
        pathJoinSpy.mockImplementation(() => plistPath);
        const releaseType = getXcodeReleaseType("");
        expect(releaseType).toBe(XcodeReleaseType.Unknown);
    });

    it("non-existent plist", () => {
        const plistPath = buildPlistPath("xcode-fake.plist");
        pathJoinSpy.mockImplementation(() => plistPath);
        const releaseType = getXcodeReleaseType("");
        expect(releaseType).toBe(XcodeReleaseType.Unknown);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });
});