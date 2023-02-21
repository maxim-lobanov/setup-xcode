/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 8472:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

  "use strict";

  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  const core = __importStar(__nccwpck_require__(2186));
  const xcode_selector_1 = __nccwpck_require__(8865);
  const run = () => {
      try {
          if (process.platform !== "darwin") {
              throw new Error(`This task is intended only for macOS platform. It can't be run on '${process.platform}' platform`);
          }
          const versionSpec = core.getInput("xcode-version", { required: false });
          core.info(`Switching Xcode to version '${versionSpec}'...`);
          const selector = new xcode_selector_1.XcodeSelector();
          if (core.isDebug()) {
              core.startGroup("Available Xcode versions:");
              core.debug(JSON.stringify(selector.getAllVersions(), null, 2));
              core.endGroup();
          }
          const targetVersion = selector.findVersion(versionSpec);
          if (!targetVersion) {
              console.log("Available versions:");
              console.table(selector.getAllVersions());
              throw new Error(`Could not find Xcode version that satisfied version spec: '${versionSpec}'`);
          }
          core.debug(`Xcode ${targetVersion.version} (${targetVersion.buildNumber}) (${targetVersion.path}) will be set`);
          selector.setVersion(targetVersion);
          core.info(`Xcode is set to ${targetVersion.version} (${targetVersion.buildNumber})`);
          core.setOutput("version", targetVersion.version);
          core.setOutput("path", targetVersion.path);
          core.exportVariable('XCODE_VERSION', targetVersion.version);
      }
      catch (error) {
          core.setFailed(error.message);
      }
  };
  run();
  
  
  /***/ }),
  
  /***/ 8865:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.XcodeSelector = void 0;
  const child = __importStar(__nccwpck_require__(2081));
  const core = __importStar(__nccwpck_require__(2186));
  const fs = __importStar(__nccwpck_require__(7147));
  const semver = __importStar(__nccwpck_require__(1383));
  const xcode_utils_1 = __nccwpck_require__(1752);
  class XcodeSelector {
      getAllVersions() {
          const potentialXcodeApps = (0, xcode_utils_1.getInstalledXcodeApps)().map(appPath => (0, xcode_utils_1.getXcodeVersionInfo)(appPath));
          const xcodeVersions = potentialXcodeApps.filter((app) => !!app);
          // sort versions array by descending to make sure that the newest version will be picked up
          return xcodeVersions.sort((first, second) => semver.compare(second.version, first.version));
      }
      findVersion(versionSpec) {
          var _a;
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
          return ((_a = availableVersions
              .filter(ver => ver.stable === isStable)
              .find(ver => semver.satisfies(ver.version, versionSpec))) !== null && _a !== void 0 ? _a : null);
      }
      setVersion(xcodeVersion) {
          if (!fs.existsSync(xcodeVersion.path)) {
              throw new Error(`Invalid version: Directory '${xcodeVersion.path}' doesn't exist`);
          }
          child.spawnSync("sudo", ["xcode-select", "-s", xcodeVersion.path]);
          // set "MD_APPLE_SDK_ROOT" environment variable to specify Xcode for Mono and Xamarin
          core.exportVariable("MD_APPLE_SDK_ROOT", xcodeVersion.path);
      }
  }
  exports.XcodeSelector = XcodeSelector;
  
  
  /***/ }),
  
  /***/ 1752:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.getXcodeVersionInfo = exports.getXcodeReleaseType = exports.getInstalledXcodeApps = exports.parsePlistFile = void 0;
  const path = __importStar(__nccwpck_require__(1017));
  const fs = __importStar(__nccwpck_require__(7147));
  const core = __importStar(__nccwpck_require__(2186));
  const plist = __importStar(__nccwpck_require__(1933));
  const semver = __importStar(__nccwpck_require__(1383));
  const parsePlistFile = (plistPath) => {
      if (!fs.existsSync(plistPath)) {
          core.debug(`Unable to open plist file. File doesn't exist on path '${plistPath}'`);
          return null;
      }
      const plistRawContent = fs.readFileSync(plistPath, "utf8");
      return plist.parse(plistRawContent);
  };
  exports.parsePlistFile = parsePlistFile;
  const getInstalledXcodeApps = () => {
      const applicationsDirectory = "/Applications";
      const xcodeAppFilenameRegex = /^Xcode.*\.app$/;
      const allApplicationsChildItems = fs.readdirSync(applicationsDirectory, {
          encoding: "utf8",
          withFileTypes: true,
      });
      const allApplicationsRealItems = allApplicationsChildItems.filter(child => !child.isSymbolicLink() && child.isDirectory());
      const xcodeAppsItems = allApplicationsRealItems.filter(app => xcodeAppFilenameRegex.test(app.name));
      return xcodeAppsItems.map(child => path.join(applicationsDirectory, child.name));
  };
  exports.getInstalledXcodeApps = getInstalledXcodeApps;
  const getXcodeReleaseType = (xcodeRootPath) => {
      var _a, _b;
      const licenseInfo = (0, exports.parsePlistFile)(path.join(xcodeRootPath, "Contents", "Resources", "LicenseInfo.plist"));
      const licenseType = (_b = (_a = licenseInfo === null || licenseInfo === void 0 ? void 0 : licenseInfo.licenseType) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
      if (!licenseType) {
          core.debug("Unable to determine Xcode version type based on license plist");
          core.debug("Xcode License plist doesn't contain 'licenseType' property");
          return "Unknown";
      }
      return licenseType.includes("beta") ? "Beta" : "GM";
  };
  exports.getXcodeReleaseType = getXcodeReleaseType;
  const getXcodeVersionInfo = (xcodeRootPath) => {
      var _a, _b;
      const versionInfo = (0, exports.parsePlistFile)(path.join(xcodeRootPath, "Contents", "version.plist"));
      const xcodeVersion = semver.coerce((_a = versionInfo === null || versionInfo === void 0 ? void 0 : versionInfo.CFBundleShortVersionString) === null || _a === void 0 ? void 0 : _a.toString());
      const xcodeBuildNumber = (_b = versionInfo === null || versionInfo === void 0 ? void 0 : versionInfo.ProductBuildVersion) === null || _b === void 0 ? void 0 : _b.toString();
      if (!xcodeVersion || !semver.valid(xcodeVersion)) {
          core.debug(`Unable to retrieve Xcode version info on path '${xcodeRootPath}'`);
          return null;
      }
      const releaseType = (0, exports.getXcodeReleaseType)(xcodeRootPath);
      return {
          version: xcodeVersion.version,
          buildNumber: xcodeBuildNumber,
          releaseType: releaseType,
          stable: releaseType === "GM",
          path: xcodeRootPath,
      };
  };
  exports.getXcodeVersionInfo = getXcodeVersionInfo;
  
  
  /***/ }),
  
  /***/ 7351:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.issue = exports.issueCommand = void 0;
  const os = __importStar(__nccwpck_require__(2037));
  const utils_1 = __nccwpck_require__(5278);
  /**
   * Commands
   *
   * Command Format:
   *   ::name key=value,key=value::message
   *
   * Examples:
   *   ::warning::This is the message
   *   ::set-env name=MY_VAR::some value
   */
  function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os.EOL);
  }
  exports.issueCommand = issueCommand;
  function issue(name, message = '') {
      issueCommand(name, {}, message);
  }
  exports.issue = issue;
  const CMD_STRING = '::';
  class Command {
      constructor(command, properties, message) {
          if (!command) {
              command = 'missing.command';
          }
          this.command = command;
          this.properties = properties;
          this.message = message;
      }
      toString() {
          let cmdStr = CMD_STRING + this.command;
          if (this.properties && Object.keys(this.properties).length > 0) {
              cmdStr += ' ';
              let first = true;
              for (const key in this.properties) {
                  if (this.properties.hasOwnProperty(key)) {
                      const val = this.properties[key];
                      if (val) {
                          if (first) {
                              first = false;
                          }
                          else {
                              cmdStr += ',';
                          }
                          cmdStr += `${key}=${escapeProperty(val)}`;
                      }
                  }
              }
          }
          cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
          return cmdStr;
      }
  }
  function escapeData(s) {
      return utils_1.toCommandValue(s)
          .replace(/%/g, '%25')
          .replace(/\r/g, '%0D')
          .replace(/\n/g, '%0A');
  }
  function escapeProperty(s) {
      return utils_1.toCommandValue(s)
          .replace(/%/g, '%25')
          .replace(/\r/g, '%0D')
          .replace(/\n/g, '%0A')
          .replace(/:/g, '%3A')
          .replace(/,/g, '%2C');
  }
  //# sourceMappingURL=command.js.map
  
  /***/ }),
  
  /***/ 2186:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
  const command_1 = __nccwpck_require__(7351);
  const file_command_1 = __nccwpck_require__(717);
  const utils_1 = __nccwpck_require__(5278);
  const os = __importStar(__nccwpck_require__(2037));
  const path = __importStar(__nccwpck_require__(1017));
  const oidc_utils_1 = __nccwpck_require__(8041);
  /**
   * The code to exit an action
   */
  var ExitCode;
  (function (ExitCode) {
      /**
       * A code indicating that the action was successful
       */
      ExitCode[ExitCode["Success"] = 0] = "Success";
      /**
       * A code indicating that the action was a failure
       */
      ExitCode[ExitCode["Failure"] = 1] = "Failure";
  })(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
  //-----------------------------------------------------------------------
  // Variables
  //-----------------------------------------------------------------------
  /**
   * Sets env variable for this action and future actions in the job
   * @param name the name of the variable to set
   * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function exportVariable(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env['GITHUB_ENV'] || '';
      if (filePath) {
          return file_command_1.issueFileCommand('ENV', file_command_1.prepareKeyValueMessage(name, val));
      }
      command_1.issueCommand('set-env', { name }, convertedVal);
  }
  exports.exportVariable = exportVariable;
  /**
   * Registers a secret which will get masked from logs
   * @param secret value of the secret
   */
  function setSecret(secret) {
      command_1.issueCommand('add-mask', {}, secret);
  }
  exports.setSecret = setSecret;
  /**
   * Prepends inputPath to the PATH (for this action and future actions)
   * @param inputPath
   */
  function addPath(inputPath) {
      const filePath = process.env['GITHUB_PATH'] || '';
      if (filePath) {
          file_command_1.issueFileCommand('PATH', inputPath);
      }
      else {
          command_1.issueCommand('add-path', {}, inputPath);
      }
      process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
  }
  exports.addPath = addPath;
  /**
   * Gets the value of an input.
   * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
   * Returns an empty string if the value is not defined.
   *
   * @param     name     name of the input to get
   * @param     options  optional. See InputOptions.
   * @returns   string
   */
  function getInput(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
      if (options && options.required && !val) {
          throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
          return val;
      }
      return val.trim();
  }
  exports.getInput = getInput;
  /**
   * Gets the values of an multiline input.  Each value is also trimmed.
   *
   * @param     name     name of the input to get
   * @param     options  optional. See InputOptions.
   * @returns   string[]
   *
   */
  function getMultilineInput(name, options) {
      const inputs = getInput(name, options)
          .split('\n')
          .filter(x => x !== '');
      if (options && options.trimWhitespace === false) {
          return inputs;
      }
      return inputs.map(input => input.trim());
  }
  exports.getMultilineInput = getMultilineInput;
  /**
   * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
   * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
   * The return value is also in boolean type.
   * ref: https://yaml.org/spec/1.2/spec.html#id2804923
   *
   * @param     name     name of the input to get
   * @param     options  optional. See InputOptions.
   * @returns   boolean
   */
  function getBooleanInput(name, options) {
      const trueValue = ['true', 'True', 'TRUE'];
      const falseValue = ['false', 'False', 'FALSE'];
      const val = getInput(name, options);
      if (trueValue.includes(val))
          return true;
      if (falseValue.includes(val))
          return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
          `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
  }
  exports.getBooleanInput = getBooleanInput;
  /**
   * Sets the value of an output.
   *
   * @param     name     name of the output to set
   * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setOutput(name, value) {
      const filePath = process.env['GITHUB_OUTPUT'] || '';
      if (filePath) {
          return file_command_1.issueFileCommand('OUTPUT', file_command_1.prepareKeyValueMessage(name, value));
      }
      process.stdout.write(os.EOL);
      command_1.issueCommand('set-output', { name }, utils_1.toCommandValue(value));
  }
  exports.setOutput = setOutput;
  /**
   * Enables or disables the echoing of commands into stdout for the rest of the step.
   * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
   *
   */
  function setCommandEcho(enabled) {
      command_1.issue('echo', enabled ? 'on' : 'off');
  }
  exports.setCommandEcho = setCommandEcho;
  //-----------------------------------------------------------------------
  // Results
  //-----------------------------------------------------------------------
  /**
   * Sets the action status to failed.
   * When the action exits it will be with an exit code of 1
   * @param message add error issue message
   */
  function setFailed(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
  }
  exports.setFailed = setFailed;
  //-----------------------------------------------------------------------
  // Logging Commands
  //-----------------------------------------------------------------------
  /**
   * Gets whether Actions Step Debug is on or not
   */
  function isDebug() {
      return process.env['RUNNER_DEBUG'] === '1';
  }
  exports.isDebug = isDebug;
  /**
   * Writes debug message to user log
   * @param message debug message
   */
  function debug(message) {
      command_1.issueCommand('debug', {}, message);
  }
  exports.debug = debug;
  /**
   * Adds an error issue
   * @param message error issue message. Errors will be converted to string via toString()
   * @param properties optional properties to add to the annotation.
   */
  function error(message, properties = {}) {
      command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
  }
  exports.error = error;
  /**
   * Adds a warning issue
   * @param message warning issue message. Errors will be converted to string via toString()
   * @param properties optional properties to add to the annotation.
   */
  function warning(message, properties = {}) {
      command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
  }
  exports.warning = warning;
  /**
   * Adds a notice issue
   * @param message notice issue message. Errors will be converted to string via toString()
   * @param properties optional properties to add to the annotation.
   */
  function notice(message, properties = {}) {
      command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
  }
  exports.notice = notice;
  /**
   * Writes info to log with console.log.
   * @param message info message
   */
  function info(message) {
      process.stdout.write(message + os.EOL);
  }
  exports.info = info;
  /**
   * Begin an output group.
   *
   * Output until the next `groupEnd` will be foldable in this group
   *
   * @param name The name of the output group
   */
  function startGroup(name) {
      command_1.issue('group', name);
  }
  exports.startGroup = startGroup;
  /**
   * End an output group.
   */
  function endGroup() {
      command_1.issue('endgroup');
  }
  exports.endGroup = endGroup;
  /**
   * Wrap an asynchronous function call in a group.
   *
   * Returns the same type as the function itself.
   *
   * @param name The name of the group
   * @param fn The function to wrap in the group
   */
  function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
          startGroup(name);
          let result;
          try {
              result = yield fn();
          }
          finally {
              endGroup();
          }
          return result;
      });
  }
  exports.group = group;
  //-----------------------------------------------------------------------
  // Wrapper action state
  //-----------------------------------------------------------------------
  /**
   * Saves state for current action, the state can only be retrieved by this action's post job execution.
   *
   * @param     name     name of the state to store
   * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function saveState(name, value) {
      const filePath = process.env['GITHUB_STATE'] || '';
      if (filePath) {
          return file_command_1.issueFileCommand('STATE', file_command_1.prepareKeyValueMessage(name, value));
      }
      command_1.issueCommand('save-state', { name }, utils_1.toCommandValue(value));
  }
  exports.saveState = saveState;
  /**
   * Gets the value of an state set by this action's main execution.
   *
   * @param     name     name of the state to get
   * @returns   string
   */
  function getState(name) {
      return process.env[`STATE_${name}`] || '';
  }
  exports.getState = getState;
  function getIDToken(aud) {
      return __awaiter(this, void 0, void 0, function* () {
          return yield oidc_utils_1.OidcClient.getIDToken(aud);
      });
  }
  exports.getIDToken = getIDToken;
  /**
   * Summary exports
   */
  var summary_1 = __nccwpck_require__(1327);
  Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
  /**
   * @deprecated use core.summary
   */
  var summary_2 = __nccwpck_require__(1327);
  Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
  /**
   * Path exports
   */
  var path_utils_1 = __nccwpck_require__(2981);
  Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
  Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
  Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
  //# sourceMappingURL=core.js.map
  
  /***/ }),
  
  /***/ 717:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  // For internal use, subject to change.
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
  // We use any as a valid input type
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const fs = __importStar(__nccwpck_require__(7147));
  const os = __importStar(__nccwpck_require__(2037));
  const uuid_1 = __nccwpck_require__(5840);
  const utils_1 = __nccwpck_require__(5278);
  function issueFileCommand(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
          throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs.existsSync(filePath)) {
          throw new Error(`Missing file at path: ${filePath}`);
      }
      fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
          encoding: 'utf8'
      });
  }
  exports.issueFileCommand = issueFileCommand;
  function prepareKeyValueMessage(key, value) {
      const delimiter = `ghadelimiter_${uuid_1.v4()}`;
      const convertedValue = utils_1.toCommandValue(value);
      // These should realistically never happen, but just in case someone finds a
      // way to exploit uuid generation let's not allow keys or values that contain
      // the delimiter.
      if (key.includes(delimiter)) {
          throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
      }
      if (convertedValue.includes(delimiter)) {
          throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
      }
      return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
  }
  exports.prepareKeyValueMessage = prepareKeyValueMessage;
  //# sourceMappingURL=file-command.js.map
  
  /***/ }),
  
  /***/ 8041:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.OidcClient = void 0;
  const http_client_1 = __nccwpck_require__(6255);
  const auth_1 = __nccwpck_require__(5526);
  const core_1 = __nccwpck_require__(2186);
  class OidcClient {
      static createHttpClient(allowRetry = true, maxRetry = 10) {
          const requestOptions = {
              allowRetries: allowRetry,
              maxRetries: maxRetry
          };
          return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
      }
      static getRequestToken() {
          const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
          if (!token) {
              throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
          }
          return token;
      }
      static getIDTokenUrl() {
          const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
          if (!runtimeUrl) {
              throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
          }
          return runtimeUrl;
      }
      static getCall(id_token_url) {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              const httpclient = OidcClient.createHttpClient();
              const res = yield httpclient
                  .getJson(id_token_url)
                  .catch(error => {
                  throw new Error(`Failed to get ID Token. \n 
          Error Code : ${error.statusCode}\n 
          Error Message: ${error.result.message}`);
              });
              const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
              if (!id_token) {
                  throw new Error('Response json body do not have ID Token field');
              }
              return id_token;
          });
      }
      static getIDToken(audience) {
          return __awaiter(this, void 0, void 0, function* () {
              try {
                  // New ID Token is requested from action service
                  let id_token_url = OidcClient.getIDTokenUrl();
                  if (audience) {
                      const encodedAudience = encodeURIComponent(audience);
                      id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                  }
                  core_1.debug(`ID token url is ${id_token_url}`);
                  const id_token = yield OidcClient.getCall(id_token_url);
                  core_1.setSecret(id_token);
                  return id_token;
              }
              catch (error) {
                  throw new Error(`Error message: ${error.message}`);
              }
          });
      }
  }
  exports.OidcClient = OidcClient;
  //# sourceMappingURL=oidc-utils.js.map
  
  /***/ }),
  
  /***/ 2981:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
  const path = __importStar(__nccwpck_require__(1017));
  /**
   * toPosixPath converts the given path to the posix form. On Windows, \\ will be
   * replaced with /.
   *
   * @param pth. Path to transform.
   * @return string Posix path.
   */
  function toPosixPath(pth) {
      return pth.replace(/[\\]/g, '/');
  }
  exports.toPosixPath = toPosixPath;
  /**
   * toWin32Path converts the given path to the win32 form. On Linux, / will be
   * replaced with \\.
   *
   * @param pth. Path to transform.
   * @return string Win32 path.
   */
  function toWin32Path(pth) {
      return pth.replace(/[/]/g, '\\');
  }
  exports.toWin32Path = toWin32Path;
  /**
   * toPlatformPath converts the given path to a platform-specific path. It does
   * this by replacing instances of / and \ with the platform-specific path
   * separator.
   *
   * @param pth The path to platformize.
   * @return string The platform-specific path.
   */
  function toPlatformPath(pth) {
      return pth.replace(/[/\\]/g, path.sep);
  }
  exports.toPlatformPath = toPlatformPath;
  //# sourceMappingURL=path-utils.js.map
  
  /***/ }),
  
  /***/ 1327:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
  const os_1 = __nccwpck_require__(2037);
  const fs_1 = __nccwpck_require__(7147);
  const { access, appendFile, writeFile } = fs_1.promises;
  exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
  exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
  class Summary {
      constructor() {
          this._buffer = '';
      }
      /**
       * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
       * Also checks r/w permissions.
       *
       * @returns step summary file path
       */
      filePath() {
          return __awaiter(this, void 0, void 0, function* () {
              if (this._filePath) {
                  return this._filePath;
              }
              const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
              if (!pathFromEnv) {
                  throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
              }
              try {
                  yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
              }
              catch (_a) {
                  throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
              }
              this._filePath = pathFromEnv;
              return this._filePath;
          });
      }
      /**
       * Wraps content in an HTML tag, adding any HTML attributes
       *
       * @param {string} tag HTML tag to wrap
       * @param {string | null} content content within the tag
       * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
       *
       * @returns {string} content wrapped in HTML element
       */
      wrap(tag, content, attrs = {}) {
          const htmlAttrs = Object.entries(attrs)
              .map(([key, value]) => ` ${key}="${value}"`)
              .join('');
          if (!content) {
              return `<${tag}${htmlAttrs}>`;
          }
          return `<${tag}${htmlAttrs}>${content}</${tag}>`;
      }
      /**
       * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
       *
       * @param {SummaryWriteOptions} [options] (optional) options for write operation
       *
       * @returns {Promise<Summary>} summary instance
       */
      write(options) {
          return __awaiter(this, void 0, void 0, function* () {
              const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
              const filePath = yield this.filePath();
              const writeFunc = overwrite ? writeFile : appendFile;
              yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
              return this.emptyBuffer();
          });
      }
      /**
       * Clears the summary buffer and wipes the summary file
       *
       * @returns {Summary} summary instance
       */
      clear() {
          return __awaiter(this, void 0, void 0, function* () {
              return this.emptyBuffer().write({ overwrite: true });
          });
      }
      /**
       * Returns the current summary buffer as a string
       *
       * @returns {string} string of summary buffer
       */
      stringify() {
          return this._buffer;
      }
      /**
       * If the summary buffer is empty
       *
       * @returns {boolen} true if the buffer is empty
       */
      isEmptyBuffer() {
          return this._buffer.length === 0;
      }
      /**
       * Resets the summary buffer without writing to summary file
       *
       * @returns {Summary} summary instance
       */
      emptyBuffer() {
          this._buffer = '';
          return this;
      }
      /**
       * Adds raw text to the summary buffer
       *
       * @param {string} text content to add
       * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
       *
       * @returns {Summary} summary instance
       */
      addRaw(text, addEOL = false) {
          this._buffer += text;
          return addEOL ? this.addEOL() : this;
      }
      /**
       * Adds the operating system-specific end-of-line marker to the buffer
       *
       * @returns {Summary} summary instance
       */
      addEOL() {
          return this.addRaw(os_1.EOL);
      }
      /**
       * Adds an HTML codeblock to the summary buffer
       *
       * @param {string} code content to render within fenced code block
       * @param {string} lang (optional) language to syntax highlight code
       *
       * @returns {Summary} summary instance
       */
      addCodeBlock(code, lang) {
          const attrs = Object.assign({}, (lang && { lang }));
          const element = this.wrap('pre', this.wrap('code', code), attrs);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML list to the summary buffer
       *
       * @param {string[]} items list of items to render
       * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
       *
       * @returns {Summary} summary instance
       */
      addList(items, ordered = false) {
          const tag = ordered ? 'ol' : 'ul';
          const listItems = items.map(item => this.wrap('li', item)).join('');
          const element = this.wrap(tag, listItems);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML table to the summary buffer
       *
       * @param {SummaryTableCell[]} rows table rows
       *
       * @returns {Summary} summary instance
       */
      addTable(rows) {
          const tableBody = rows
              .map(row => {
              const cells = row
                  .map(cell => {
                  if (typeof cell === 'string') {
                      return this.wrap('td', cell);
                  }
                  const { header, data, colspan, rowspan } = cell;
                  const tag = header ? 'th' : 'td';
                  const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                  return this.wrap(tag, data, attrs);
              })
                  .join('');
              return this.wrap('tr', cells);
          })
              .join('');
          const element = this.wrap('table', tableBody);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds a collapsable HTML details element to the summary buffer
       *
       * @param {string} label text for the closed state
       * @param {string} content collapsable content
       *
       * @returns {Summary} summary instance
       */
      addDetails(label, content) {
          const element = this.wrap('details', this.wrap('summary', label) + content);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML image tag to the summary buffer
       *
       * @param {string} src path to the image you to embed
       * @param {string} alt text description of the image
       * @param {SummaryImageOptions} options (optional) addition image attributes
       *
       * @returns {Summary} summary instance
       */
      addImage(src, alt, options) {
          const { width, height } = options || {};
          const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
          const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML section heading element
       *
       * @param {string} text heading text
       * @param {number | string} [level=1] (optional) the heading level, default: 1
       *
       * @returns {Summary} summary instance
       */
      addHeading(text, level) {
          const tag = `h${level}`;
          const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
              ? tag
              : 'h1';
          const element = this.wrap(allowedTag, text);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML thematic break (<hr>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addSeparator() {
          const element = this.wrap('hr', null);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML line break (<br>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addBreak() {
          const element = this.wrap('br', null);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML blockquote to the summary buffer
       *
       * @param {string} text quote text
       * @param {string} cite (optional) citation url
       *
       * @returns {Summary} summary instance
       */
      addQuote(text, cite) {
          const attrs = Object.assign({}, (cite && { cite }));
          const element = this.wrap('blockquote', text, attrs);
          return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML anchor tag to the summary buffer
       *
       * @param {string} text link text/content
       * @param {string} href hyperlink
       *
       * @returns {Summary} summary instance
       */
      addLink(text, href) {
          const element = this.wrap('a', text, { href });
          return this.addRaw(element).addEOL();
      }
  }
  const _summary = new Summary();
  /**
   * @deprecated use `core.summary`
   */
  exports.markdownSummary = _summary;
  exports.summary = _summary;
  //# sourceMappingURL=summary.js.map
  
  /***/ }),
  
  /***/ 5278:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  // We use any as a valid input type
  /* eslint-disable @typescript-eslint/no-explicit-any */
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.toCommandProperties = exports.toCommandValue = void 0;
  /**
   * Sanitizes an input into a string so it can be passed into issueCommand safely
   * @param input input to sanitize into a string
   */
  function toCommandValue(input) {
      if (input === null || input === undefined) {
          return '';
      }
      else if (typeof input === 'string' || input instanceof String) {
          return input;
      }
      return JSON.stringify(input);
  }
  exports.toCommandValue = toCommandValue;
  /**
   *
   * @param annotationProperties
   * @returns The command properties to send with the actual annotation command
   * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
   */
  function toCommandProperties(annotationProperties) {
      if (!Object.keys(annotationProperties).length) {
          return {};
      }
      return {
          title: annotationProperties.title,
          file: annotationProperties.file,
          line: annotationProperties.startLine,
          endLine: annotationProperties.endLine,
          col: annotationProperties.startColumn,
          endColumn: annotationProperties.endColumn
      };
  }
  exports.toCommandProperties = toCommandProperties;
  //# sourceMappingURL=utils.js.map
  
  /***/ }),
  
  /***/ 5526:
  /***/ (function(__unused_webpack_module, exports) {
  
  "use strict";
  
  var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
  class BasicCredentialHandler {
      constructor(username, password) {
          this.username = username;
          this.password = password;
      }
      prepareRequest(options) {
          if (!options.headers) {
              throw Error('The request has no headers');
          }
          options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
          return false;
      }
      handleAuthentication() {
          return __awaiter(this, void 0, void 0, function* () {
              throw new Error('not implemented');
          });
      }
  }
  exports.BasicCredentialHandler = BasicCredentialHandler;
  class BearerCredentialHandler {
      constructor(token) {
          this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
          if (!options.headers) {
              throw Error('The request has no headers');
          }
          options.headers['Authorization'] = `Bearer ${this.token}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
          return false;
      }
      handleAuthentication() {
          return __awaiter(this, void 0, void 0, function* () {
              throw new Error('not implemented');
          });
      }
  }
  exports.BearerCredentialHandler = BearerCredentialHandler;
  class PersonalAccessTokenCredentialHandler {
      constructor(token) {
          this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
          if (!options.headers) {
              throw Error('The request has no headers');
          }
          options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
          return false;
      }
      handleAuthentication() {
          return __awaiter(this, void 0, void 0, function* () {
              throw new Error('not implemented');
          });
      }
  }
  exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
  //# sourceMappingURL=auth.js.map
  
  /***/ }),
  
  /***/ 6255:
  /***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {
  
  "use strict";
  
  /* eslint-disable @typescript-eslint/no-explicit-any */
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
  const http = __importStar(__nccwpck_require__(3685));
  const https = __importStar(__nccwpck_require__(5687));
  const pm = __importStar(__nccwpck_require__(9835));
  const tunnel = __importStar(__nccwpck_require__(4294));
  var HttpCodes;
  (function (HttpCodes) {
      HttpCodes[HttpCodes["OK"] = 200] = "OK";
      HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
      HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
      HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
      HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
      HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
      HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
      HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
      HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
      HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
      HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
      HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
      HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
      HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
      HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
      HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
      HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
      HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
      HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
      HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
      HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
      HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
      HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
      HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
      HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
      HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
  })(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
  var Headers;
  (function (Headers) {
      Headers["Accept"] = "accept";
      Headers["ContentType"] = "content-type";
  })(Headers = exports.Headers || (exports.Headers = {}));
  var MediaTypes;
  (function (MediaTypes) {
      MediaTypes["ApplicationJson"] = "application/json";
  })(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
  /**
   * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
   * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
   */
  function getProxyUrl(serverUrl) {
      const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : '';
  }
  exports.getProxyUrl = getProxyUrl;
  const HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
  ];
  const HttpResponseRetryCodes = [
      HttpCodes.BadGateway,
      HttpCodes.ServiceUnavailable,
      HttpCodes.GatewayTimeout
  ];
  const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
  const ExponentialBackoffCeiling = 10;
  const ExponentialBackoffTimeSlice = 5;
  class HttpClientError extends Error {
      constructor(message, statusCode) {
          super(message);
          this.name = 'HttpClientError';
          this.statusCode = statusCode;
          Object.setPrototypeOf(this, HttpClientError.prototype);
      }
  }
  exports.HttpClientError = HttpClientError;
  class HttpClientResponse {
      constructor(message) {
          this.message = message;
      }
      readBody() {
          return __awaiter(this, void 0, void 0, function* () {
              return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                  let output = Buffer.alloc(0);
                  this.message.on('data', (chunk) => {
                      output = Buffer.concat([output, chunk]);
                  });
                  this.message.on('end', () => {
                      resolve(output.toString());
                  });
              }));
          });
      }
  }
  exports.HttpClientResponse = HttpClientResponse;
  function isHttps(requestUrl) {
      const parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === 'https:';
  }
  exports.isHttps = isHttps;
  class HttpClient {
      constructor(userAgent, handlers, requestOptions) {
          this._ignoreSslError = false;
          this._allowRedirects = true;
          this._allowRedirectDowngrade = false;
          this._maxRedirects = 50;
          this._allowRetries = false;
          this._maxRetries = 1;
          this._keepAlive = false;
          this._disposed = false;
          this.userAgent = userAgent;
          this.handlers = handlers || [];
          this.requestOptions = requestOptions;
          if (requestOptions) {
              if (requestOptions.ignoreSslError != null) {
                  this._ignoreSslError = requestOptions.ignoreSslError;
              }
              this._socketTimeout = requestOptions.socketTimeout;
              if (requestOptions.allowRedirects != null) {
                  this._allowRedirects = requestOptions.allowRedirects;
              }
              if (requestOptions.allowRedirectDowngrade != null) {
                  this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
              }
              if (requestOptions.maxRedirects != null) {
                  this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
              }
              if (requestOptions.keepAlive != null) {
                  this._keepAlive = requestOptions.keepAlive;
              }
              if (requestOptions.allowRetries != null) {
                  this._allowRetries = requestOptions.allowRetries;
              }
              if (requestOptions.maxRetries != null) {
                  this._maxRetries = requestOptions.maxRetries;
              }
          }
      }
      options(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
          });
      }
      get(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('GET', requestUrl, null, additionalHeaders || {});
          });
      }
      del(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('DELETE', requestUrl, null, additionalHeaders || {});
          });
      }
      post(requestUrl, data, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('POST', requestUrl, data, additionalHeaders || {});
          });
      }
      patch(requestUrl, data, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('PATCH', requestUrl, data, additionalHeaders || {});
          });
      }
      put(requestUrl, data, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('PUT', requestUrl, data, additionalHeaders || {});
          });
      }
      head(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request('HEAD', requestUrl, null, additionalHeaders || {});
          });
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
              return this.request(verb, requestUrl, stream, additionalHeaders);
          });
      }
      /**
       * Gets a typed object from an endpoint
       * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
       */
      getJson(requestUrl, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
              additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
              const res = yield this.get(requestUrl, additionalHeaders);
              return this._processResponse(res, this.requestOptions);
          });
      }
      postJson(requestUrl, obj, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
              const data = JSON.stringify(obj, null, 2);
              additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
              additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
              const res = yield this.post(requestUrl, data, additionalHeaders);
              return this._processResponse(res, this.requestOptions);
          });
      }
      putJson(requestUrl, obj, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
              const data = JSON.stringify(obj, null, 2);
              additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
              additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
              const res = yield this.put(requestUrl, data, additionalHeaders);
              return this._processResponse(res, this.requestOptions);
          });
      }
      patchJson(requestUrl, obj, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
              const data = JSON.stringify(obj, null, 2);
              additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
              additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
              const res = yield this.patch(requestUrl, data, additionalHeaders);
              return this._processResponse(res, this.requestOptions);
          });
      }
      /**
       * Makes a raw http request.
       * All other methods such as get, post, patch, and request ultimately call this.
       * Prefer get, del, post and patch
       */
      request(verb, requestUrl, data, headers) {
          return __awaiter(this, void 0, void 0, function* () {
              if (this._disposed) {
                  throw new Error('Client has already been disposed.');
              }
              const parsedUrl = new URL(requestUrl);
              let info = this._prepareRequest(verb, parsedUrl, headers);
              // Only perform retries on reads since writes may not be idempotent.
              const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                  ? this._maxRetries + 1
                  : 1;
              let numTries = 0;
              let response;
              do {
                  response = yield this.requestRaw(info, data);
                  // Check if it's an authentication challenge
                  if (response &&
                      response.message &&
                      response.message.statusCode === HttpCodes.Unauthorized) {
                      let authenticationHandler;
                      for (const handler of this.handlers) {
                          if (handler.canHandleAuthentication(response)) {
                              authenticationHandler = handler;
                              break;
                          }
                      }
                      if (authenticationHandler) {
                          return authenticationHandler.handleAuthentication(this, info, data);
                      }
                      else {
                          // We have received an unauthorized response but have no handlers to handle it.
                          // Let the response return to the caller.
                          return response;
                      }
                  }
                  let redirectsRemaining = this._maxRedirects;
                  while (response.message.statusCode &&
                      HttpRedirectCodes.includes(response.message.statusCode) &&
                      this._allowRedirects &&
                      redirectsRemaining > 0) {
                      const redirectUrl = response.message.headers['location'];
                      if (!redirectUrl) {
                          // if there's no location to redirect to, we won't
                          break;
                      }
                      const parsedRedirectUrl = new URL(redirectUrl);
                      if (parsedUrl.protocol === 'https:' &&
                          parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                          !this._allowRedirectDowngrade) {
                          throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                      }
                      // we need to finish reading the response before reassigning response
                      // which will leak the open socket.
                      yield response.readBody();
                      // strip authorization header if redirected to a different hostname
                      if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                          for (const header in headers) {
                              // header names are case insensitive
                              if (header.toLowerCase() === 'authorization') {
                                  delete headers[header];
                              }
                          }
                      }
                      // let's make the request with the new redirectUrl
                      info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                      response = yield this.requestRaw(info, data);
                      redirectsRemaining--;
                  }
                  if (!response.message.statusCode ||
                      !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                      // If not a retry code, return immediately instead of retrying
                      return response;
                  }
                  numTries += 1;
                  if (numTries < maxTries) {
                      yield response.readBody();
                      yield this._performExponentialBackoff(numTries);
                  }
              } while (numTries < maxTries);
              return response;
          });
      }
      /**
       * Needs to be called if keepAlive is set to true in request options.
       */
      dispose() {
          if (this._agent) {
              this._agent.destroy();
          }
          this._disposed = true;
      }
      /**
       * Raw request.
       * @param info
       * @param data
       */
      requestRaw(info, data) {
          return __awaiter(this, void 0, void 0, function* () {
              return new Promise((resolve, reject) => {
                  function callbackForResult(err, res) {
                      if (err) {
                          reject(err);
                      }
                      else if (!res) {
                          // If `err` is not passed, then `res` must be passed.
                          reject(new Error('Unknown error'));
                      }
                      else {
                          resolve(res);
                      }
                  }
                  this.requestRawWithCallback(info, data, callbackForResult);
              });
          });
      }
      /**
       * Raw request with callback.
       * @param info
       * @param data
       * @param onResult
       */
      requestRawWithCallback(info, data, onResult) {
          if (typeof data === 'string') {
              if (!info.options.headers) {
                  info.options.headers = {};
              }
              info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
          }
          let callbackCalled = false;
          function handleResult(err, res) {
              if (!callbackCalled) {
                  callbackCalled = true;
                  onResult(err, res);
              }
          }
          const req = info.httpModule.request(info.options, (msg) => {
              const res = new HttpClientResponse(msg);
              handleResult(undefined, res);
          });
          let socket;
          req.on('socket', sock => {
              socket = sock;
          });
          // If we ever get disconnected, we want the socket to timeout eventually
          req.setTimeout(this._socketTimeout || 3 * 60000, () => {
              if (socket) {
                  socket.end();
              }
              handleResult(new Error(`Request timeout: ${info.options.path}`));
          });
          req.on('error', function (err) {
              // err has statusCode property
              // res should have headers
              handleResult(err);
          });
          if (data && typeof data === 'string') {
              req.write(data, 'utf8');
          }
          if (data && typeof data !== 'string') {
              data.on('close', function () {
                  req.end();
              });
              data.pipe(req);
          }
          else {
              req.end();
          }
      }
      /**
       * Gets an http agent. This function is useful when you need an http agent that handles
       * routing through a proxy server - depending upon the url and proxy environment variables.
       * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
       */
      getAgent(serverUrl) {
          const parsedUrl = new URL(serverUrl);
          return this._getAgent(parsedUrl);
      }
      _prepareRequest(method, requestUrl, headers) {
          const info = {};
          info.parsedUrl = requestUrl;
          const usingSsl = info.parsedUrl.protocol === 'https:';
          info.httpModule = usingSsl ? https : http;
          const defaultPort = usingSsl ? 443 : 80;
          info.options = {};
          info.options.host = info.parsedUrl.hostname;
          info.options.port = info.parsedUrl.port
              ? parseInt(info.parsedUrl.port)
              : defaultPort;
          info.options.path =
              (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
          info.options.method = method;
          info.options.headers = this._mergeHeaders(headers);
          if (this.userAgent != null) {
              info.options.headers['user-agent'] = this.userAgent;
          }
          info.options.agent = this._getAgent(info.parsedUrl);
          // gives handlers an opportunity to participate
          if (this.handlers) {
              for (const handler of this.handlers) {
                  handler.prepareRequest(info.options);
              }
          }
          return info;
      }
      _mergeHeaders(headers) {
          if (this.requestOptions && this.requestOptions.headers) {
              return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
          }
          return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
          let clientHeader;
          if (this.requestOptions && this.requestOptions.headers) {
              clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
          }
          return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
          let agent;
          const proxyUrl = pm.getProxyUrl(parsedUrl);
          const useProxy = proxyUrl && proxyUrl.hostname;
          if (this._keepAlive && useProxy) {
              agent = this._proxyAgent;
          }
          if (this._keepAlive && !useProxy) {
              agent = this._agent;
          }
          // if agent is already assigned use that agent.
          if (agent) {
              return agent;
          }
          const usingSsl = parsedUrl.protocol === 'https:';
          let maxSockets = 100;
          if (this.requestOptions) {
              maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
          }
          // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
          if (proxyUrl && proxyUrl.hostname) {
              const agentOptions = {
                  maxSockets,
                  keepAlive: this._keepAlive,
                  proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                      proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                  })), { host: proxyUrl.hostname, port: proxyUrl.port })
              };
              let tunnelAgent;
              const overHttps = proxyUrl.protocol === 'https:';
              if (usingSsl) {
                  tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
              }
              else {
                  tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
              }
              agent = tunnelAgent(agentOptions);
              this._proxyAgent = agent;
          }
          // if reusing agent across request and tunneling agent isn't assigned create a new agent
          if (this._keepAlive && !agent) {
              const options = { keepAlive: this._keepAlive, maxSockets };
              agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
              this._agent = agent;
          }
          // if not using private agent and tunnel agent isn't setup then use global agent
          if (!agent) {
              agent = usingSsl ? https.globalAgent : http.globalAgent;
          }
          if (usingSsl && this._ignoreSslError) {
              // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
              // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
              // we have to cast it to any and change it directly
              agent.options = Object.assign(agent.options || {}, {
                  rejectUnauthorized: false
              });
          }
          return agent;
      }
      _performExponentialBackoff(retryNumber) {
          return __awaiter(this, void 0, void 0, function* () {
              retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
              const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
              return new Promise(resolve => setTimeout(() => resolve(), ms));
          });
      }
      _processResponse(res, options) {
          return __awaiter(this, void 0, void 0, function* () {
              return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                  const statusCode = res.message.statusCode || 0;
                  const response = {
                      statusCode,
                      result: null,
                      headers: {}
                  };
                  // not found leads to null obj returned
                  if (statusCode === HttpCodes.NotFound) {
                      resolve(response);
                  }
                  // get the result from the body
                  function dateTimeDeserializer(key, value) {
                      if (typeof value === 'string') {
                          const a = new Date(value);
                          if (!isNaN(a.valueOf())) {
                              return a;
                          }
                      }
                      return value;
                  }
                  let obj;
                  let contents;
                  try {
                      contents = yield res.readBody();
                      if (contents && contents.length > 0) {
                          if (options && options.deserializeDates) {
                              obj = JSON.parse(contents, dateTimeDeserializer);
                          }
                          else {
                              obj = JSON.parse(contents);
                          }
                          response.result = obj;
                      }
                      response.headers = res.message.headers;
                  }
                  catch (err) {
                      // Invalid resource (contents not json);  leaving result obj null
                  }
                  // note that 3xx redirects are handled by the http layer.
                  if (statusCode > 299) {
                      let msg;
                      // if exception/error in body, attempt to get better error
                      if (obj && obj.message) {
                          msg = obj.message;
                      }
                      else if (contents && contents.length > 0) {
                          // it may be the case that the exception is in the body message as string
                          msg = contents;
                      }
                      else {
                          msg = `Failed request: (${statusCode})`;
                      }
                      const err = new HttpClientError(msg, statusCode);
                      err.result = response.result;
                      reject(err);
                  }
                  else {
                      resolve(response);
                  }
              }));
          });
      }
  }
  exports.HttpClient = HttpClient;
  const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
  //# sourceMappingURL=index.js.map
  
  /***/ }),
  
  /***/ 9835:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  Object.defineProperty(exports, "__esModule", ({ value: true }));
  exports.checkBypass = exports.getProxyUrl = void 0;
  function getProxyUrl(reqUrl) {
      const usingSsl = reqUrl.protocol === 'https:';
      if (checkBypass(reqUrl)) {
          return undefined;
      }
      const proxyVar = (() => {
          if (usingSsl) {
              return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
          }
          else {
              return process.env['http_proxy'] || process.env['HTTP_PROXY'];
          }
      })();
      if (proxyVar) {
          return new URL(proxyVar);
      }
      else {
          return undefined;
      }
  }
  exports.getProxyUrl = getProxyUrl;
  function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
          return false;
      }
      const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
      if (!noProxy) {
          return false;
      }
      // Determine the request port
      let reqPort;
      if (reqUrl.port) {
          reqPort = Number(reqUrl.port);
      }
      else if (reqUrl.protocol === 'http:') {
          reqPort = 80;
      }
      else if (reqUrl.protocol === 'https:') {
          reqPort = 443;
      }
      // Format the request hostname and hostname with port
      const upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === 'number') {
          upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      // Compare request host against noproxy
      for (const upperNoProxyItem of noProxy
          .split(',')
          .map(x => x.trim().toUpperCase())
          .filter(x => x)) {
          if (upperReqHosts.some(x => x === upperNoProxyItem)) {
              return true;
          }
      }
      return false;
  }
  exports.checkBypass = checkBypass;
  //# sourceMappingURL=proxy.js.map
  
  /***/ }),
  
  /***/ 6463:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  exports.byteLength = byteLength
  exports.toByteArray = toByteArray
  exports.fromByteArray = fromByteArray
  
  var lookup = []
  var revLookup = []
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
  
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }
  
  // Support decoding URL-safe base64 strings, as Node.js does.
  // See: https://en.wikipedia.org/wiki/Base64#URL_applications
  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
  
  function getLens (b64) {
    var len = b64.length
  
    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }
  
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=')
    if (validLen === -1) validLen = len
  
    var placeHoldersLen = validLen === len
      ? 0
      : 4 - (validLen % 4)
  
    return [validLen, placeHoldersLen]
  }
  
  // base64 is 4/3 + up to two characters of the original data
  function byteLength (b64) {
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }
  
  function _byteLength (b64, validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }
  
  function toByteArray (b64) {
    var tmp
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
  
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
  
    var curByte = 0
  
    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0
      ? validLen - 4
      : validLen
  
    var i
    for (i = 0; i < len; i += 4) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 18) |
        (revLookup[b64.charCodeAt(i + 1)] << 12) |
        (revLookup[b64.charCodeAt(i + 2)] << 6) |
        revLookup[b64.charCodeAt(i + 3)]
      arr[curByte++] = (tmp >> 16) & 0xFF
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }
  
    if (placeHoldersLen === 2) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 2) |
        (revLookup[b64.charCodeAt(i + 1)] >> 4)
      arr[curByte++] = tmp & 0xFF
    }
  
    if (placeHoldersLen === 1) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 10) |
        (revLookup[b64.charCodeAt(i + 1)] << 4) |
        (revLookup[b64.charCodeAt(i + 2)] >> 2)
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }
  
    return arr
  }
  
  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] +
      lookup[num >> 12 & 0x3F] +
      lookup[num >> 6 & 0x3F] +
      lookup[num & 0x3F]
  }
  
  function encodeChunk (uint8, start, end) {
    var tmp
    var output = []
    for (var i = start; i < end; i += 3) {
      tmp =
        ((uint8[i] << 16) & 0xFF0000) +
        ((uint8[i + 1] << 8) & 0xFF00) +
        (uint8[i + 2] & 0xFF)
      output.push(tripletToBase64(tmp))
    }
    return output.join('')
  }
  
  function fromByteArray (uint8) {
    var tmp
    var len = uint8.length
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    var parts = []
    var maxChunkLength = 16383 // must be multiple of 3
  
    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
    }
  
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1]
      parts.push(
        lookup[tmp >> 2] +
        lookup[(tmp << 4) & 0x3F] +
        '=='
      )
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1]
      parts.push(
        lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3F] +
        lookup[(tmp << 2) & 0x3F] +
        '='
      )
    }
  
    return parts.join('')
  }
  
  
  /***/ }),
  
  /***/ 7129:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  // A linked list to keep track of recently-used-ness
  const Yallist = __nccwpck_require__(665)
  
  const MAX = Symbol('max')
  const LENGTH = Symbol('length')
  const LENGTH_CALCULATOR = Symbol('lengthCalculator')
  const ALLOW_STALE = Symbol('allowStale')
  const MAX_AGE = Symbol('maxAge')
  const DISPOSE = Symbol('dispose')
  const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
  const LRU_LIST = Symbol('lruList')
  const CACHE = Symbol('cache')
  const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')
  
  const naiveLength = () => 1
  
  // lruList is a yallist where the head is the youngest
  // item, and the tail is the oldest.  the list contains the Hit
  // objects as the entries.
  // Each Hit object has a reference to its Yallist.Node.  This
  // never changes.
  //
  // cache is a Map (or PseudoMap) that matches the keys to
  // the Yallist.Node object.
  class LRUCache {
    constructor (options) {
      if (typeof options === 'number')
        options = { max: options }
  
      if (!options)
        options = {}
  
      if (options.max && (typeof options.max !== 'number' || options.max < 0))
        throw new TypeError('max must be a non-negative number')
      // Kind of weird to have a default max of Infinity, but oh well.
      const max = this[MAX] = options.max || Infinity
  
      const lc = options.length || naiveLength
      this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
      this[ALLOW_STALE] = options.stale || false
      if (options.maxAge && typeof options.maxAge !== 'number')
        throw new TypeError('maxAge must be a number')
      this[MAX_AGE] = options.maxAge || 0
      this[DISPOSE] = options.dispose
      this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
      this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
      this.reset()
    }
  
    // resize the cache when the max changes.
    set max (mL) {
      if (typeof mL !== 'number' || mL < 0)
        throw new TypeError('max must be a non-negative number')
  
      this[MAX] = mL || Infinity
      trim(this)
    }
    get max () {
      return this[MAX]
    }
  
    set allowStale (allowStale) {
      this[ALLOW_STALE] = !!allowStale
    }
    get allowStale () {
      return this[ALLOW_STALE]
    }
  
    set maxAge (mA) {
      if (typeof mA !== 'number')
        throw new TypeError('maxAge must be a non-negative number')
  
      this[MAX_AGE] = mA
      trim(this)
    }
    get maxAge () {
      return this[MAX_AGE]
    }
  
    // resize the cache when the lengthCalculator changes.
    set lengthCalculator (lC) {
      if (typeof lC !== 'function')
        lC = naiveLength
  
      if (lC !== this[LENGTH_CALCULATOR]) {
        this[LENGTH_CALCULATOR] = lC
        this[LENGTH] = 0
        this[LRU_LIST].forEach(hit => {
          hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
          this[LENGTH] += hit.length
        })
      }
      trim(this)
    }
    get lengthCalculator () { return this[LENGTH_CALCULATOR] }
  
    get length () { return this[LENGTH] }
    get itemCount () { return this[LRU_LIST].length }
  
    rforEach (fn, thisp) {
      thisp = thisp || this
      for (let walker = this[LRU_LIST].tail; walker !== null;) {
        const prev = walker.prev
        forEachStep(this, fn, walker, thisp)
        walker = prev
      }
    }
  
    forEach (fn, thisp) {
      thisp = thisp || this
      for (let walker = this[LRU_LIST].head; walker !== null;) {
        const next = walker.next
        forEachStep(this, fn, walker, thisp)
        walker = next
      }
    }
  
    keys () {
      return this[LRU_LIST].toArray().map(k => k.key)
    }
  
    values () {
      return this[LRU_LIST].toArray().map(k => k.value)
    }
  
    reset () {
      if (this[DISPOSE] &&
          this[LRU_LIST] &&
          this[LRU_LIST].length) {
        this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
      }
  
      this[CACHE] = new Map() // hash of items by key
      this[LRU_LIST] = new Yallist() // list of items in order of use recency
      this[LENGTH] = 0 // length of items in the list
    }
  
    dump () {
      return this[LRU_LIST].map(hit =>
        isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter(h => h)
    }
  
    dumpLru () {
      return this[LRU_LIST]
    }
  
    set (key, value, maxAge) {
      maxAge = maxAge || this[MAX_AGE]
  
      if (maxAge && typeof maxAge !== 'number')
        throw new TypeError('maxAge must be a number')
  
      const now = maxAge ? Date.now() : 0
      const len = this[LENGTH_CALCULATOR](value, key)
  
      if (this[CACHE].has(key)) {
        if (len > this[MAX]) {
          del(this, this[CACHE].get(key))
          return false
        }
  
        const node = this[CACHE].get(key)
        const item = node.value
  
        // dispose of the old one before overwriting
        // split out into 2 ifs for better coverage tracking
        if (this[DISPOSE]) {
          if (!this[NO_DISPOSE_ON_SET])
            this[DISPOSE](key, item.value)
        }
  
        item.now = now
        item.maxAge = maxAge
        item.value = value
        this[LENGTH] += len - item.length
        item.length = len
        this.get(key)
        trim(this)
        return true
      }
  
      const hit = new Entry(key, value, len, now, maxAge)
  
      // oversized objects fall out of cache automatically.
      if (hit.length > this[MAX]) {
        if (this[DISPOSE])
          this[DISPOSE](key, value)
  
        return false
      }
  
      this[LENGTH] += hit.length
      this[LRU_LIST].unshift(hit)
      this[CACHE].set(key, this[LRU_LIST].head)
      trim(this)
      return true
    }
  
    has (key) {
      if (!this[CACHE].has(key)) return false
      const hit = this[CACHE].get(key).value
      return !isStale(this, hit)
    }
  
    get (key) {
      return get(this, key, true)
    }
  
    peek (key) {
      return get(this, key, false)
    }
  
    pop () {
      const node = this[LRU_LIST].tail
      if (!node)
        return null
  
      del(this, node)
      return node.value
    }
  
    del (key) {
      del(this, this[CACHE].get(key))
    }
  
    load (arr) {
      // reset the cache
      this.reset()
  
      const now = Date.now()
      // A previous serialized cache has the most recent items first
      for (let l = arr.length - 1; l >= 0; l--) {
        const hit = arr[l]
        const expiresAt = hit.e || 0
        if (expiresAt === 0)
          // the item was created without expiration in a non aged cache
          this.set(hit.k, hit.v)
        else {
          const maxAge = expiresAt - now
          // dont add already expired items
          if (maxAge > 0) {
            this.set(hit.k, hit.v, maxAge)
          }
        }
      }
    }
  
    prune () {
      this[CACHE].forEach((value, key) => get(this, key, false))
    }
  }
  
  const get = (self, key, doUse) => {
    const node = self[CACHE].get(key)
    if (node) {
      const hit = node.value
      if (isStale(self, hit)) {
        del(self, node)
        if (!self[ALLOW_STALE])
          return undefined
      } else {
        if (doUse) {
          if (self[UPDATE_AGE_ON_GET])
            node.value.now = Date.now()
          self[LRU_LIST].unshiftNode(node)
        }
      }
      return hit.value
    }
  }
  
  const isStale = (self, hit) => {
    if (!hit || (!hit.maxAge && !self[MAX_AGE]))
      return false
  
    const diff = Date.now() - hit.now
    return hit.maxAge ? diff > hit.maxAge
      : self[MAX_AGE] && (diff > self[MAX_AGE])
  }
  
  const trim = self => {
    if (self[LENGTH] > self[MAX]) {
      for (let walker = self[LRU_LIST].tail;
        self[LENGTH] > self[MAX] && walker !== null;) {
        // We know that we're about to delete this one, and also
        // what the next least recently used key will be, so just
        // go ahead and set it now.
        const prev = walker.prev
        del(self, walker)
        walker = prev
      }
    }
  }
  
  const del = (self, node) => {
    if (node) {
      const hit = node.value
      if (self[DISPOSE])
        self[DISPOSE](hit.key, hit.value)
  
      self[LENGTH] -= hit.length
      self[CACHE].delete(hit.key)
      self[LRU_LIST].removeNode(node)
    }
  }
  
  class Entry {
    constructor (key, value, length, now, maxAge) {
      this.key = key
      this.value = value
      this.length = length
      this.now = now
      this.maxAge = maxAge || 0
    }
  }
  
  const forEachStep = (self, fn, node, thisp) => {
    let hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE])
        hit = undefined
    }
    if (hit)
      fn.call(thisp, hit.value, hit.key, self)
  }
  
  module.exports = LRUCache
  
  
  /***/ }),
  
  /***/ 1933:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  /**
   * Parser functions.
   */
  
  var parserFunctions = __nccwpck_require__(8068);
  Object.keys(parserFunctions).forEach(function (k) { exports[k] = parserFunctions[k]; });
  
  /**
   * Builder functions.
   */
  
  var builderFunctions = __nccwpck_require__(9979);
  Object.keys(builderFunctions).forEach(function (k) { exports[k] = builderFunctions[k]; });
  
  
  /***/ }),
  
  /***/ 9979:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  /**
   * Module dependencies.
   */
  
  var base64 = __nccwpck_require__(6463);
  var xmlbuilder = __nccwpck_require__(2958);
  
  /**
   * Module exports.
   */
  
  exports.build = build;
  
  /**
   * Accepts a `Date` instance and returns an ISO date string.
   *
   * @param {Date} d - Date instance to serialize
   * @returns {String} ISO date string representation of `d`
   * @api private
   */
  
  function ISODateString(d){
    function pad(n){
      return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z';
  }
  
  /**
   * Returns the internal "type" of `obj` via the
   * `Object.prototype.toString()` trick.
   *
   * @param {Mixed} obj - any value
   * @returns {String} the internal "type" name
   * @api private
   */
  
  var toString = Object.prototype.toString;
  function type (obj) {
    var m = toString.call(obj).match(/\[object (.*)\]/);
    return m ? m[1] : m;
  }
  
  /**
   * Generate an XML plist string from the input object `obj`.
   *
   * @param {Object} obj - the object to convert
   * @param {Object} [opts] - optional options object
   * @returns {String} converted plist XML string
   * @api public
   */
  
  function build (obj, opts) {
    var XMLHDR = {
      version: '1.0',
      encoding: 'UTF-8'
    };
  
    var XMLDTD = {
      pubid: '-//Apple//DTD PLIST 1.0//EN',
      sysid: 'http://www.apple.com/DTDs/PropertyList-1.0.dtd'
    };
  
    var doc = xmlbuilder.create('plist');
  
    doc.dec(XMLHDR.version, XMLHDR.encoding, XMLHDR.standalone);
    doc.dtd(XMLDTD.pubid, XMLDTD.sysid);
    doc.att('version', '1.0');
  
    walk_obj(obj, doc);
  
    if (!opts) opts = {};
    // default `pretty` to `true`
    opts.pretty = opts.pretty !== false;
    return doc.end(opts);
  }
  
  /**
   * depth first, recursive traversal of a javascript object. when complete,
   * next_child contains a reference to the build XML object.
   *
   * @api private
   */
  
  function walk_obj(next, next_child) {
    var tag_type, i, prop;
    var name = type(next);
  
    if ('Undefined' == name) {
      return;
    } else if (Array.isArray(next)) {
      next_child = next_child.ele('array');
      for (i = 0; i < next.length; i++) {
        walk_obj(next[i], next_child);
      }
  
    } else if (Buffer.isBuffer(next)) {
      next_child.ele('data').raw(next.toString('base64'));
  
    } else if ('Object' == name) {
      next_child = next_child.ele('dict');
      for (prop in next) {
        if (next.hasOwnProperty(prop)) {
          next_child.ele('key').txt(prop);
          walk_obj(next[prop], next_child);
        }
      }
  
    } else if ('Number' == name) {
      // detect if this is an integer or real
      // TODO: add an ability to force one way or another via a "cast"
      tag_type = (next % 1 === 0) ? 'integer' : 'real';
      next_child.ele(tag_type).txt(next.toString());
  
    } else if ('Date' == name) {
      next_child.ele('date').txt(ISODateString(new Date(next)));
  
    } else if ('Boolean' == name) {
      next_child.ele(next ? 'true' : 'false');
  
    } else if ('String' == name) {
      next_child.ele('string').txt(next);
  
    } else if ('ArrayBuffer' == name) {
      next_child.ele('data').raw(base64.fromByteArray(next));
  
    } else if (next && next.buffer && 'ArrayBuffer' == type(next.buffer)) {
      // a typed array
      next_child.ele('data').raw(base64.fromByteArray(new Uint8Array(next.buffer), next_child));
  
    } else if ('Null' === name) {
      next_child.ele('null').txt('');
  
    }
  }
  
  
  /***/ }),
  
  /***/ 8068:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  /**
   * Module dependencies.
   */
  
  var DOMParser = (__nccwpck_require__(4399)/* .DOMParser */ .a);
  
  /**
   * Module exports.
   */
  
  exports.parse = parse;
  
  var TEXT_NODE = 3;
  var CDATA_NODE = 4;
  var COMMENT_NODE = 8;
  
  
  /**
   * We ignore raw text (usually whitespace), <!-- xml comments -->,
   * and raw CDATA nodes.
   *
   * @param {Element} node
   * @returns {Boolean}
   * @api private
   */
  
  function shouldIgnoreNode (node) {
    return node.nodeType === TEXT_NODE
      || node.nodeType === COMMENT_NODE
      || node.nodeType === CDATA_NODE;
  }
  
  /**
   * Check if the node is empty. Some plist file has such node:
   * <key />
   * this node shoud be ignored.
   *
   * @see https://github.com/TooTallNate/plist.js/issues/66
   * @param {Element} node
   * @returns {Boolean}
   * @api private
   */
  function isEmptyNode(node){
    if(!node.childNodes || node.childNodes.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  
  function invariant(test, message) {
    if (!test) {
      throw new Error(message);
    }
  }
  
  /**
   * Parses a Plist XML string. Returns an Object.
   *
   * @param {String} xml - the XML String to decode
   * @returns {Mixed} the decoded value from the Plist XML
   * @api public
   */
  
  function parse (xml) {
    var doc = new DOMParser().parseFromString(xml);
    invariant(
      doc.documentElement.nodeName === 'plist',
      'malformed document. First element should be <plist>'
    );
    var plist = parsePlistXML(doc.documentElement);
  
    // the root <plist> node gets interpreted as an Array,
    // so pull out the inner data first
    if (plist.length == 1) plist = plist[0];
  
    return plist;
  }
  
  /**
   * Convert an XML based plist document into a JSON representation.
   *
   * @param {Object} xml_node - current XML node in the plist
   * @returns {Mixed} built up JSON object
   * @api private
   */
  
  function parsePlistXML (node) {
    var i, new_obj, key, val, new_arr, res, counter, type;
  
    if (!node)
      return null;
  
    if (node.nodeName === 'plist') {
      new_arr = [];
      if (isEmptyNode(node)) {
        return new_arr;
      }
      for (i=0; i < node.childNodes.length; i++) {
        if (!shouldIgnoreNode(node.childNodes[i])) {
          new_arr.push( parsePlistXML(node.childNodes[i]));
        }
      }
      return new_arr;
    } else if (node.nodeName === 'dict') {
      new_obj = {};
      key = null;
      counter = 0;
      if (isEmptyNode(node)) {
        return new_obj;
      }
      for (i=0; i < node.childNodes.length; i++) {
        if (shouldIgnoreNode(node.childNodes[i])) continue;
        if (counter % 2 === 0) {
          invariant(
            node.childNodes[i].nodeName === 'key',
            'Missing key while parsing <dict/>.'
          );
          key = parsePlistXML(node.childNodes[i]);
        } else {
          invariant(
            node.childNodes[i].nodeName !== 'key',
            'Unexpected key "'
              + parsePlistXML(node.childNodes[i])
              + '" while parsing <dict/>.'
          );
          new_obj[key] = parsePlistXML(node.childNodes[i]);
        }
        counter += 1;
      }
      if (counter % 2 === 1) {
        new_obj[key] = '';
      }
      
      return new_obj;
  
    } else if (node.nodeName === 'array') {
      new_arr = [];
      if (isEmptyNode(node)) {
        return new_arr;
      }
      for (i=0; i < node.childNodes.length; i++) {
        if (!shouldIgnoreNode(node.childNodes[i])) {
          res = parsePlistXML(node.childNodes[i]);
          if (null != res) new_arr.push(res);
        }
      }
      return new_arr;
  
    } else if (node.nodeName === '#text') {
      // TODO: what should we do with text types? (CDATA sections)
  
    } else if (node.nodeName === 'key') {
      if (isEmptyNode(node)) {
        return '';
      }
  
      invariant(
        node.childNodes[0].nodeValue !== '__proto__',
        '__proto__ keys can lead to prototype pollution. More details on CVE-2022-22912'
      );
  
      return node.childNodes[0].nodeValue;
    } else if (node.nodeName === 'string') {
      res = '';
      if (isEmptyNode(node)) {
        return res;
      }
      for (i=0; i < node.childNodes.length; i++) {
        var type = node.childNodes[i].nodeType;
        if (type === TEXT_NODE || type === CDATA_NODE) {
          res += node.childNodes[i].nodeValue;
        }
      }
      return res;
  
    } else if (node.nodeName === 'integer') {
      invariant(
        !isEmptyNode(node),
        'Cannot parse "" as integer.'
      );
      return parseInt(node.childNodes[0].nodeValue, 10);
  
    } else if (node.nodeName === 'real') {
      invariant(
        !isEmptyNode(node),
        'Cannot parse "" as real.'
      );
      res = '';
      for (i=0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType === TEXT_NODE) {
          res += node.childNodes[i].nodeValue;
        }
      }
      return parseFloat(res);
  
    } else if (node.nodeName === 'data') {
      res = '';
      if (isEmptyNode(node)) {
        return Buffer.from(res, 'base64');
      }
      for (i=0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType === TEXT_NODE) {
          res += node.childNodes[i].nodeValue.replace(/\s+/g, '');
        }
      }
      return Buffer.from(res, 'base64');
  
    } else if (node.nodeName === 'date') {
      invariant(
        !isEmptyNode(node),
        'Cannot parse "" as Date.'
      )
      return new Date(node.childNodes[0].nodeValue);
  
    } else if (node.nodeName === 'null') {
      return null;
  
    } else if (node.nodeName === 'true') {
      return true;
  
    } else if (node.nodeName === 'false') {
      return false;
    } else {
      throw new Error('Invalid PLIST tag ' + node.nodeName);
    }
  }
  
  
  /***/ }),
  
  /***/ 4399:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  var __webpack_unused_export__;
  function DOMParser(options){
    this.options = options ||{locator:{}};
  }
  
  DOMParser.prototype.parseFromString = function(source,mimeType){
    var options = this.options;
    var sax =  new XMLReader();
    var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
    var errorHandler = options.errorHandler;
    var locator = options.locator;
    var defaultNSMap = options.xmlns||{};
    var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
      var entityMap = isHTML?htmlEntity.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
    if(locator){
      domBuilder.setDocumentLocator(locator)
    }
  
    sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
    sax.domBuilder = options.domBuilder || domBuilder;
    if(isHTML){
      defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
    }
    defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
    if(source && typeof source === 'string'){
      sax.parse(source,defaultNSMap,entityMap);
    }else{
      sax.errorHandler.error("invalid doc source");
    }
    return domBuilder.doc;
  }
  function buildErrorHandler(errorImpl,domBuilder,locator){
    if(!errorImpl){
      if(domBuilder instanceof DOMHandler){
        return domBuilder;
      }
      errorImpl = domBuilder ;
    }
    var errorHandler = {}
    var isCallback = errorImpl instanceof Function;
    locator = locator||{}
    function build(key){
      var fn = errorImpl[key];
      if(!fn && isCallback){
        fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
      }
      errorHandler[key] = fn && function(msg){
        fn('[xmldom '+key+']\t'+msg+_locator(locator));
      }||function(){};
    }
    build('warning');
    build('error');
    build('fatalError');
    return errorHandler;
  }
  
  //console.log('#\n\n\n\n\n\n\n####')
  /**
   * +ContentHandler+ErrorHandler
   * +LexicalHandler+EntityResolver2
   * -DeclHandler-DTDHandler
   *
   * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
   * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
   * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
   */
  function DOMHandler() {
      this.cdata = false;
  }
  function position(locator,node){
    node.lineNumber = locator.lineNumber;
    node.columnNumber = locator.columnNumber;
  }
  /**
   * @see org.xml.sax.ContentHandler#startDocument
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
   */
  DOMHandler.prototype = {
    startDocument : function() {
        this.doc = new DOMImplementation().createDocument(null, null, null);
        if (this.locator) {
            this.doc.documentURI = this.locator.systemId;
        }
    },
    startElement:function(namespaceURI, localName, qName, attrs) {
      var doc = this.doc;
        var el = doc.createElementNS(namespaceURI, qName||localName);
        var len = attrs.length;
        appendElement(this, el);
        this.currentElement = el;
  
      this.locator && position(this.locator,el)
        for (var i = 0 ; i < len; i++) {
            var namespaceURI = attrs.getURI(i);
            var value = attrs.getValue(i);
            var qName = attrs.getQName(i);
        var attr = doc.createAttributeNS(namespaceURI, qName);
        this.locator &&position(attrs.getLocator(i),attr);
        attr.value = attr.nodeValue = value;
        el.setAttributeNode(attr)
        }
    },
    endElement:function(namespaceURI, localName, qName) {
      var current = this.currentElement
      var tagName = current.tagName;
      this.currentElement = current.parentNode;
    },
    startPrefixMapping:function(prefix, uri) {
    },
    endPrefixMapping:function(prefix) {
    },
    processingInstruction:function(target, data) {
        var ins = this.doc.createProcessingInstruction(target, data);
        this.locator && position(this.locator,ins)
        appendElement(this, ins);
    },
    ignorableWhitespace:function(ch, start, length) {
    },
    characters:function(chars, start, length) {
      chars = _toString.apply(this,arguments)
      //console.log(chars)
      if(chars){
        if (this.cdata) {
          var charNode = this.doc.createCDATASection(chars);
        } else {
          var charNode = this.doc.createTextNode(chars);
        }
        if(this.currentElement){
          this.currentElement.appendChild(charNode);
        }else if(/^\s*$/.test(chars)){
          this.doc.appendChild(charNode);
          //process xml
        }
        this.locator && position(this.locator,charNode)
      }
    },
    skippedEntity:function(name) {
    },
    endDocument:function() {
      this.doc.normalize();
    },
    setDocumentLocator:function (locator) {
        if(this.locator = locator){// && !('lineNumber' in locator)){
          locator.lineNumber = 0;
        }
    },
    //LexicalHandler
    comment:function(chars, start, length) {
      chars = _toString.apply(this,arguments)
        var comm = this.doc.createComment(chars);
        this.locator && position(this.locator,comm)
        appendElement(this, comm);
    },
  
    startCDATA:function() {
        //used in characters() methods
        this.cdata = true;
    },
    endCDATA:function() {
        this.cdata = false;
    },
  
    startDTD:function(name, publicId, systemId) {
      var impl = this.doc.implementation;
        if (impl && impl.createDocumentType) {
            var dt = impl.createDocumentType(name, publicId, systemId);
            this.locator && position(this.locator,dt)
            appendElement(this, dt);
        }
    },
    /**
     * @see org.xml.sax.ErrorHandler
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
     */
    warning:function(error) {
      console.warn('[xmldom warning]\t'+error,_locator(this.locator));
    },
    error:function(error) {
      console.error('[xmldom error]\t'+error,_locator(this.locator));
    },
    fatalError:function(error) {
      throw new ParseError(error, this.locator);
    }
  }
  function _locator(l){
    if(l){
      return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
    }
  }
  function _toString(chars,start,length){
    if(typeof chars == 'string'){
      return chars.substr(start,length)
    }else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
      if(chars.length >= start+length || start){
        return new java.lang.String(chars,start,length)+'';
      }
      return chars;
    }
  }
  
  /*
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
   * used method of org.xml.sax.ext.LexicalHandler:
   *  #comment(chars, start, length)
   *  #startCDATA()
   *  #endCDATA()
   *  #startDTD(name, publicId, systemId)
   *
   *
   * IGNORED method of org.xml.sax.ext.LexicalHandler:
   *  #endDTD()
   *  #startEntity(name)
   *  #endEntity(name)
   *
   *
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
   * IGNORED method of org.xml.sax.ext.DeclHandler
   * 	#attributeDecl(eName, aName, type, mode, value)
   *  #elementDecl(name, model)
   *  #externalEntityDecl(name, publicId, systemId)
   *  #internalEntityDecl(name, value)
   * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
   * IGNORED method of org.xml.sax.EntityResolver2
   *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
   *  #resolveEntity(publicId, systemId)
   *  #getExternalSubset(name, baseURI)
   * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
   * IGNORED method of org.xml.sax.DTDHandler
   *  #notationDecl(name, publicId, systemId) {};
   *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
   */
  "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
    DOMHandler.prototype[key] = function(){return null}
  })
  
  /* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
  function appendElement (hander,node) {
      if (!hander.currentElement) {
          hander.doc.appendChild(node);
      } else {
          hander.currentElement.appendChild(node);
      }
  }//appendChild and setAttributeNS are preformance key
  
  //if(typeof require == 'function'){
  var htmlEntity = __nccwpck_require__(2975);
  var sax = __nccwpck_require__(7860);
  var XMLReader = sax.XMLReader;
  var ParseError = sax.ParseError;
  var DOMImplementation = /* unused reexport */ __nccwpck_require__(7009).DOMImplementation;
  /* unused reexport */ __nccwpck_require__(7009) ;
  exports.a = DOMParser;
  __webpack_unused_export__ = DOMHandler;
  //}
  
  
  /***/ }),
  
  /***/ 7009:
  /***/ ((__unused_webpack_module, exports) => {
  
  var __webpack_unused_export__;
  function copy(src,dest){
    for(var p in src){
      dest[p] = src[p];
    }
  }
  /**
  ^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
  ^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
   */
  function _extends(Class,Super){
    var pt = Class.prototype;
    if(!(pt instanceof Super)){
      function t(){};
      t.prototype = Super.prototype;
      t = new t();
      copy(pt,t);
      Class.prototype = pt = t;
    }
    if(pt.constructor != Class){
      if(typeof Class != 'function'){
        console.error("unknow Class:"+Class)
      }
      pt.constructor = Class
    }
  }
  var htmlns = 'http://www.w3.org/1999/xhtml' ;
  // Node Types
  var NodeType = {}
  var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
  var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
  var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
  var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
  var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
  var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
  var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
  var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
  var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
  var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
  var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
  var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;
  
  // ExceptionCode
  var ExceptionCode = {}
  var ExceptionMessage = {};
  var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
  var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
  var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
  var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
  var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
  var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
  var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
  var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
  var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
  var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
  //level2
  var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
  var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
  var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
  var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
  var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);
  
  /**
   * DOM Level 2
   * Object DOMException
   * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
   * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
   */
  function DOMException(code, message) {
    if(message instanceof Error){
      var error = message;
    }else{
      error = this;
      Error.call(this, ExceptionMessage[code]);
      this.message = ExceptionMessage[code];
      if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
    }
    error.code = code;
    if(message) this.message = this.message + ": " + message;
    return error;
  };
  DOMException.prototype = Error.prototype;
  copy(ExceptionCode,DOMException)
  /**
   * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
   * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
   * The items in the NodeList are accessible via an integral index, starting from 0.
   */
  function NodeList() {
  };
  NodeList.prototype = {
    /**
     * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
     * @standard level1
     */
    length:0, 
    /**
     * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
     * @standard level1
     * @param index  unsigned long 
     *   Index into the collection.
     * @return Node
     * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
     */
    item: function(index) {
      return this[index] || null;
    },
    toString:function(isHTML,nodeFilter){
      for(var buf = [], i = 0;i<this.length;i++){
        serializeToString(this[i],buf,isHTML,nodeFilter);
      }
      return buf.join('');
    }
  };
  function LiveNodeList(node,refresh){
    this._node = node;
    this._refresh = refresh
    _updateLiveList(this);
  }
  function _updateLiveList(list){
    var inc = list._node._inc || list._node.ownerDocument._inc;
    if(list._inc != inc){
      var ls = list._refresh(list._node);
      //console.log(ls.length)
      __set__(list,'length',ls.length);
      copy(ls,list);
      list._inc = inc;
    }
  }
  LiveNodeList.prototype.item = function(i){
    _updateLiveList(this);
    return this[i];
  }
  
  _extends(LiveNodeList,NodeList);
  /**
   * 
   * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
   * NamedNodeMap objects in the DOM are live.
   * used for attributes or DocumentType entities 
   */
  function NamedNodeMap() {
  };
  
  function _findNodeIndex(list,node){
    var i = list.length;
    while(i--){
      if(list[i] === node){return i}
    }
  }
  
  function _addNamedNode(el,list,newAttr,oldAttr){
    if(oldAttr){
      list[_findNodeIndex(list,oldAttr)] = newAttr;
    }else{
      list[list.length++] = newAttr;
    }
    if(el){
      newAttr.ownerElement = el;
      var doc = el.ownerDocument;
      if(doc){
        oldAttr && _onRemoveAttribute(doc,el,oldAttr);
        _onAddAttribute(doc,el,newAttr);
      }
    }
  }
  function _removeNamedNode(el,list,attr){
    //console.log('remove attr:'+attr)
    var i = _findNodeIndex(list,attr);
    if(i>=0){
      var lastIndex = list.length-1
      while(i<lastIndex){
        list[i] = list[++i]
      }
      list.length = lastIndex;
      if(el){
        var doc = el.ownerDocument;
        if(doc){
          _onRemoveAttribute(doc,el,attr);
          attr.ownerElement = null;
        }
      }
    }else{
      throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
    }
  }
  NamedNodeMap.prototype = {
    length:0,
    item:NodeList.prototype.item,
    getNamedItem: function(key) {
  //		if(key.indexOf(':')>0 || key == 'xmlns'){
  //			return null;
  //		}
      //console.log()
      var i = this.length;
      while(i--){
        var attr = this[i];
        //console.log(attr.nodeName,key)
        if(attr.nodeName == key){
          return attr;
        }
      }
    },
    setNamedItem: function(attr) {
      var el = attr.ownerElement;
      if(el && el!=this._ownerElement){
        throw new DOMException(INUSE_ATTRIBUTE_ERR);
      }
      var oldAttr = this.getNamedItem(attr.nodeName);
      _addNamedNode(this._ownerElement,this,attr,oldAttr);
      return oldAttr;
    },
    /* returns Node */
    setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
      var el = attr.ownerElement, oldAttr;
      if(el && el!=this._ownerElement){
        throw new DOMException(INUSE_ATTRIBUTE_ERR);
      }
      oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
      _addNamedNode(this._ownerElement,this,attr,oldAttr);
      return oldAttr;
    },
  
    /* returns Node */
    removeNamedItem: function(key) {
      var attr = this.getNamedItem(key);
      _removeNamedNode(this._ownerElement,this,attr);
      return attr;
      
      
    },// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
    
    //for level2
    removeNamedItemNS:function(namespaceURI,localName){
      var attr = this.getNamedItemNS(namespaceURI,localName);
      _removeNamedNode(this._ownerElement,this,attr);
      return attr;
    },
    getNamedItemNS: function(namespaceURI, localName) {
      var i = this.length;
      while(i--){
        var node = this[i];
        if(node.localName == localName && node.namespaceURI == namespaceURI){
          return node;
        }
      }
      return null;
    }
  };
  /**
   * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
   */
  function DOMImplementation(/* Object */ features) {
    this._features = {};
    if (features) {
      for (var feature in features) {
         this._features = features[feature];
      }
    }
  };
  
  DOMImplementation.prototype = {
    hasFeature: function(/* string */ feature, /* string */ version) {
      var versions = this._features[feature.toLowerCase()];
      if (versions && (!version || version in versions)) {
        return true;
      } else {
        return false;
      }
    },
    // Introduced in DOM Level 2:
    createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
      var doc = new Document();
      doc.implementation = this;
      doc.childNodes = new NodeList();
      doc.doctype = doctype;
      if(doctype){
        doc.appendChild(doctype);
      }
      if(qualifiedName){
        var root = doc.createElementNS(namespaceURI,qualifiedName);
        doc.appendChild(root);
      }
      return doc;
    },
    // Introduced in DOM Level 2:
    createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
      var node = new DocumentType();
      node.name = qualifiedName;
      node.nodeName = qualifiedName;
      node.publicId = publicId;
      node.systemId = systemId;
      // Introduced in DOM Level 2:
      //readonly attribute DOMString        internalSubset;
      
      //TODO:..
      //  readonly attribute NamedNodeMap     entities;
      //  readonly attribute NamedNodeMap     notations;
      return node;
    }
  };
  
  
  /**
   * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
   */
  
  function Node() {
  };
  
  Node.prototype = {
    firstChild : null,
    lastChild : null,
    previousSibling : null,
    nextSibling : null,
    attributes : null,
    parentNode : null,
    childNodes : null,
    ownerDocument : null,
    nodeValue : null,
    namespaceURI : null,
    prefix : null,
    localName : null,
    // Modified in DOM Level 2:
    insertBefore:function(newChild, refChild){//raises 
      return _insertBefore(this,newChild,refChild);
    },
    replaceChild:function(newChild, oldChild){//raises 
      this.insertBefore(newChild,oldChild);
      if(oldChild){
        this.removeChild(oldChild);
      }
    },
    removeChild:function(oldChild){
      return _removeChild(this,oldChild);
    },
    appendChild:function(newChild){
      return this.insertBefore(newChild,null);
    },
    hasChildNodes:function(){
      return this.firstChild != null;
    },
    cloneNode:function(deep){
      return cloneNode(this.ownerDocument||this,this,deep);
    },
    // Modified in DOM Level 2:
    normalize:function(){
      var child = this.firstChild;
      while(child){
        var next = child.nextSibling;
        if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
          this.removeChild(next);
          child.appendData(next.data);
        }else{
          child.normalize();
          child = next;
        }
      }
    },
      // Introduced in DOM Level 2:
    isSupported:function(feature, version){
      return this.ownerDocument.implementation.hasFeature(feature,version);
    },
      // Introduced in DOM Level 2:
      hasAttributes:function(){
        return this.attributes.length>0;
      },
      lookupPrefix:function(namespaceURI){
        var el = this;
        while(el){
          var map = el._nsMap;
          //console.dir(map)
          if(map){
            for(var n in map){
              if(map[n] == namespaceURI){
                return n;
              }
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
        }
        return null;
      },
      // Introduced in DOM Level 3:
      lookupNamespaceURI:function(prefix){
        var el = this;
        while(el){
          var map = el._nsMap;
          //console.dir(map)
          if(map){
            if(prefix in map){
              return map[prefix] ;
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
        }
        return null;
      },
      // Introduced in DOM Level 3:
      isDefaultNamespace:function(namespaceURI){
        var prefix = this.lookupPrefix(namespaceURI);
        return prefix == null;
      }
  };
  
  
  function _xmlEncoder(c){
    return c == '<' && '&lt;' ||
           c == '>' && '&gt;' ||
           c == '&' && '&amp;' ||
           c == '"' && '&quot;' ||
           '&#'+c.charCodeAt()+';'
  }
  
  
  copy(NodeType,Node);
  copy(NodeType,Node.prototype);
  
  /**
   * @param callback return true for continue,false for break
   * @return boolean true: break visit;
   */
  function _visitNode(node,callback){
    if(callback(node)){
      return true;
    }
    if(node = node.firstChild){
      do{
        if(_visitNode(node,callback)){return true}
          }while(node=node.nextSibling)
      }
  }
  
  
  
  function Document(){
  }
  function _onAddAttribute(doc,el,newAttr){
    doc && doc._inc++;
    var ns = newAttr.namespaceURI ;
    if(ns == 'http://www.w3.org/2000/xmlns/'){
      //update namespace
      el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
    }
  }
  function _onRemoveAttribute(doc,el,newAttr,remove){
    doc && doc._inc++;
    var ns = newAttr.namespaceURI ;
    if(ns == 'http://www.w3.org/2000/xmlns/'){
      //update namespace
      delete el._nsMap[newAttr.prefix?newAttr.localName:'']
    }
  }
  function _onUpdateChild(doc,el,newChild){
    if(doc && doc._inc){
      doc._inc++;
      //update childNodes
      var cs = el.childNodes;
      if(newChild){
        cs[cs.length++] = newChild;
      }else{
        //console.log(1)
        var child = el.firstChild;
        var i = 0;
        while(child){
          cs[i++] = child;
          child =child.nextSibling;
        }
        cs.length = i;
      }
    }
  }
  
  /**
   * attributes;
   * children;
   * 
   * writeable properties:
   * nodeValue,Attr:value,CharacterData:data
   * prefix
   */
  function _removeChild(parentNode,child){
    var previous = child.previousSibling;
    var next = child.nextSibling;
    if(previous){
      previous.nextSibling = next;
    }else{
      parentNode.firstChild = next
    }
    if(next){
      next.previousSibling = previous;
    }else{
      parentNode.lastChild = previous;
    }
    _onUpdateChild(parentNode.ownerDocument,parentNode);
    return child;
  }
  /**
   * preformance key(refChild == null)
   */
  function _insertBefore(parentNode,newChild,nextChild){
    var cp = newChild.parentNode;
    if(cp){
      cp.removeChild(newChild);//remove and update
    }
    if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
      var newFirst = newChild.firstChild;
      if (newFirst == null) {
        return newChild;
      }
      var newLast = newChild.lastChild;
    }else{
      newFirst = newLast = newChild;
    }
    var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;
  
    newFirst.previousSibling = pre;
    newLast.nextSibling = nextChild;
    
    
    if(pre){
      pre.nextSibling = newFirst;
    }else{
      parentNode.firstChild = newFirst;
    }
    if(nextChild == null){
      parentNode.lastChild = newLast;
    }else{
      nextChild.previousSibling = newLast;
    }
    do{
      newFirst.parentNode = parentNode;
    }while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
    _onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
    //console.log(parentNode.lastChild.nextSibling == null)
    if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
      newChild.firstChild = newChild.lastChild = null;
    }
    return newChild;
  }
  function _appendSingleChild(parentNode,newChild){
    var cp = newChild.parentNode;
    if(cp){
      var pre = parentNode.lastChild;
      cp.removeChild(newChild);//remove and update
      var pre = parentNode.lastChild;
    }
    var pre = parentNode.lastChild;
    newChild.parentNode = parentNode;
    newChild.previousSibling = pre;
    newChild.nextSibling = null;
    if(pre){
      pre.nextSibling = newChild;
    }else{
      parentNode.firstChild = newChild;
    }
    parentNode.lastChild = newChild;
    _onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
    return newChild;
    //console.log("__aa",parentNode.lastChild.nextSibling == null)
  }
  Document.prototype = {
    //implementation : null,
    nodeName :  '#document',
    nodeType :  DOCUMENT_NODE,
    doctype :  null,
    documentElement :  null,
    _inc : 1,
    
    insertBefore :  function(newChild, refChild){//raises 
      if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
        var child = newChild.firstChild;
        while(child){
          var next = child.nextSibling;
          this.insertBefore(child,refChild);
          child = next;
        }
        return newChild;
      }
      if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
        this.documentElement = newChild;
      }
      
      return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
    },
    removeChild :  function(oldChild){
      if(this.documentElement == oldChild){
        this.documentElement = null;
      }
      return _removeChild(this,oldChild);
    },
    // Introduced in DOM Level 2:
    importNode : function(importedNode,deep){
      return importNode(this,importedNode,deep);
    },
    // Introduced in DOM Level 2:
    getElementById :	function(id){
      var rtv = null;
      _visitNode(this.documentElement,function(node){
        if(node.nodeType == ELEMENT_NODE){
          if(node.getAttribute('id') == id){
            rtv = node;
            return true;
          }
        }
      })
      return rtv;
    },
    
    getElementsByClassName: function(className) {
      var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return new LiveNodeList(this, function(base) {
        var ls = [];
        _visitNode(base.documentElement, function(node) {
          if(node !== base && node.nodeType == ELEMENT_NODE) {
            if(pattern.test(node.getAttribute('class'))) {
              ls.push(node);
            }
          }
        });
        return ls;
      });
    },
    
    //document factory method:
    createElement :	function(tagName){
      var node = new Element();
      node.ownerDocument = this;
      node.nodeName = tagName;
      node.tagName = tagName;
      node.childNodes = new NodeList();
      var attrs	= node.attributes = new NamedNodeMap();
      attrs._ownerElement = node;
      return node;
    },
    createDocumentFragment :	function(){
      var node = new DocumentFragment();
      node.ownerDocument = this;
      node.childNodes = new NodeList();
      return node;
    },
    createTextNode :	function(data){
      var node = new Text();
      node.ownerDocument = this;
      node.appendData(data)
      return node;
    },
    createComment :	function(data){
      var node = new Comment();
      node.ownerDocument = this;
      node.appendData(data)
      return node;
    },
    createCDATASection :	function(data){
      var node = new CDATASection();
      node.ownerDocument = this;
      node.appendData(data)
      return node;
    },
    createProcessingInstruction :	function(target,data){
      var node = new ProcessingInstruction();
      node.ownerDocument = this;
      node.tagName = node.target = target;
      node.nodeValue= node.data = data;
      return node;
    },
    createAttribute :	function(name){
      var node = new Attr();
      node.ownerDocument	= this;
      node.name = name;
      node.nodeName	= name;
      node.localName = name;
      node.specified = true;
      return node;
    },
    createEntityReference :	function(name){
      var node = new EntityReference();
      node.ownerDocument	= this;
      node.nodeName	= name;
      return node;
    },
    // Introduced in DOM Level 2:
    createElementNS :	function(namespaceURI,qualifiedName){
      var node = new Element();
      var pl = qualifiedName.split(':');
      var attrs	= node.attributes = new NamedNodeMap();
      node.childNodes = new NodeList();
      node.ownerDocument = this;
      node.nodeName = qualifiedName;
      node.tagName = qualifiedName;
      node.namespaceURI = namespaceURI;
      if(pl.length == 2){
        node.prefix = pl[0];
        node.localName = pl[1];
      }else{
        //el.prefix = null;
        node.localName = qualifiedName;
      }
      attrs._ownerElement = node;
      return node;
    },
    // Introduced in DOM Level 2:
    createAttributeNS :	function(namespaceURI,qualifiedName){
      var node = new Attr();
      var pl = qualifiedName.split(':');
      node.ownerDocument = this;
      node.nodeName = qualifiedName;
      node.name = qualifiedName;
      node.namespaceURI = namespaceURI;
      node.specified = true;
      if(pl.length == 2){
        node.prefix = pl[0];
        node.localName = pl[1];
      }else{
        //el.prefix = null;
        node.localName = qualifiedName;
      }
      return node;
    }
  };
  _extends(Document,Node);
  
  
  function Element() {
    this._nsMap = {};
  };
  Element.prototype = {
    nodeType : ELEMENT_NODE,
    hasAttribute : function(name){
      return this.getAttributeNode(name)!=null;
    },
    getAttribute : function(name){
      var attr = this.getAttributeNode(name);
      return attr && attr.value || '';
    },
    getAttributeNode : function(name){
      return this.attributes.getNamedItem(name);
    },
    setAttribute : function(name, value){
      var attr = this.ownerDocument.createAttribute(name);
      attr.value = attr.nodeValue = "" + value;
      this.setAttributeNode(attr)
    },
    removeAttribute : function(name){
      var attr = this.getAttributeNode(name)
      attr && this.removeAttributeNode(attr);
    },
    
    //four real opeartion method
    appendChild:function(newChild){
      if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
        return this.insertBefore(newChild,null);
      }else{
        return _appendSingleChild(this,newChild);
      }
    },
    setAttributeNode : function(newAttr){
      return this.attributes.setNamedItem(newAttr);
    },
    setAttributeNodeNS : function(newAttr){
      return this.attributes.setNamedItemNS(newAttr);
    },
    removeAttributeNode : function(oldAttr){
      //console.log(this == oldAttr.ownerElement)
      return this.attributes.removeNamedItem(oldAttr.nodeName);
    },
    //get real attribute name,and remove it by removeAttributeNode
    removeAttributeNS : function(namespaceURI, localName){
      var old = this.getAttributeNodeNS(namespaceURI, localName);
      old && this.removeAttributeNode(old);
    },
    
    hasAttributeNS : function(namespaceURI, localName){
      return this.getAttributeNodeNS(namespaceURI, localName)!=null;
    },
    getAttributeNS : function(namespaceURI, localName){
      var attr = this.getAttributeNodeNS(namespaceURI, localName);
      return attr && attr.value || '';
    },
    setAttributeNS : function(namespaceURI, qualifiedName, value){
      var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
      attr.value = attr.nodeValue = "" + value;
      this.setAttributeNode(attr)
    },
    getAttributeNodeNS : function(namespaceURI, localName){
      return this.attributes.getNamedItemNS(namespaceURI, localName);
    },
    
    getElementsByTagName : function(tagName){
      return new LiveNodeList(this,function(base){
        var ls = [];
        _visitNode(base,function(node){
          if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
            ls.push(node);
          }
        });
        return ls;
      });
    },
    getElementsByTagNameNS : function(namespaceURI, localName){
      return new LiveNodeList(this,function(base){
        var ls = [];
        _visitNode(base,function(node){
          if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
            ls.push(node);
          }
        });
        return ls;
        
      });
    }
  };
  Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
  Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
  
  
  _extends(Element,Node);
  function Attr() {
  };
  Attr.prototype.nodeType = ATTRIBUTE_NODE;
  _extends(Attr,Node);
  
  
  function CharacterData() {
  };
  CharacterData.prototype = {
    data : '',
    substringData : function(offset, count) {
      return this.data.substring(offset, offset+count);
    },
    appendData: function(text) {
      text = this.data+text;
      this.nodeValue = this.data = text;
      this.length = text.length;
    },
    insertData: function(offset,text) {
      this.replaceData(offset,0,text);
    
    },
    appendChild:function(newChild){
      throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
    },
    deleteData: function(offset, count) {
      this.replaceData(offset,count,"");
    },
    replaceData: function(offset, count, text) {
      var start = this.data.substring(0,offset);
      var end = this.data.substring(offset+count);
      text = start + text + end;
      this.nodeValue = this.data = text;
      this.length = text.length;
    }
  }
  _extends(CharacterData,Node);
  function Text() {
  };
  Text.prototype = {
    nodeName : "#text",
    nodeType : TEXT_NODE,
    splitText : function(offset) {
      var text = this.data;
      var newText = text.substring(offset);
      text = text.substring(0, offset);
      this.data = this.nodeValue = text;
      this.length = text.length;
      var newNode = this.ownerDocument.createTextNode(newText);
      if(this.parentNode){
        this.parentNode.insertBefore(newNode, this.nextSibling);
      }
      return newNode;
    }
  }
  _extends(Text,CharacterData);
  function Comment() {
  };
  Comment.prototype = {
    nodeName : "#comment",
    nodeType : COMMENT_NODE
  }
  _extends(Comment,CharacterData);
  
  function CDATASection() {
  };
  CDATASection.prototype = {
    nodeName : "#cdata-section",
    nodeType : CDATA_SECTION_NODE
  }
  _extends(CDATASection,CharacterData);
  
  
  function DocumentType() {
  };
  DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
  _extends(DocumentType,Node);
  
  function Notation() {
  };
  Notation.prototype.nodeType = NOTATION_NODE;
  _extends(Notation,Node);
  
  function Entity() {
  };
  Entity.prototype.nodeType = ENTITY_NODE;
  _extends(Entity,Node);
  
  function EntityReference() {
  };
  EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
  _extends(EntityReference,Node);
  
  function DocumentFragment() {
  };
  DocumentFragment.prototype.nodeName =	"#document-fragment";
  DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
  _extends(DocumentFragment,Node);
  
  
  function ProcessingInstruction() {
  }
  ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
  _extends(ProcessingInstruction,Node);
  function XMLSerializer(){}
  XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
    return nodeSerializeToString.call(node,isHtml,nodeFilter);
  }
  Node.prototype.toString = nodeSerializeToString;
  function nodeSerializeToString(isHtml,nodeFilter){
    var buf = [];
    var refNode = this.nodeType == 9 && this.documentElement || this;
    var prefix = refNode.prefix;
    var uri = refNode.namespaceURI;
    
    if(uri && prefix == null){
      //console.log(prefix)
      var prefix = refNode.lookupPrefix(uri);
      if(prefix == null){
        //isHTML = true;
        var visibleNamespaces=[
        {namespace:uri,prefix:null}
        //{namespace:uri,prefix:''}
        ]
      }
    }
    serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
    //console.log('###',this.nodeType,uri,prefix,buf.join(''))
    return buf.join('');
  }
  function needNamespaceDefine(node,isHTML, visibleNamespaces) {
    var prefix = node.prefix||'';
    var uri = node.namespaceURI;
    if (!prefix && !uri){
      return false;
    }
    if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
      || uri == 'http://www.w3.org/2000/xmlns/'){
      return false;
    }
    
    var i = visibleNamespaces.length 
    //console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
    while (i--) {
      var ns = visibleNamespaces[i];
      // get namespace prefix
      //console.log(node.nodeType,node.tagName,ns.prefix,prefix)
      if (ns.prefix == prefix){
        return ns.namespace != uri;
      }
    }
    //console.log(isHTML,uri,prefix=='')
    //if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
    //	return false;
    //}
    //node.flag = '11111'
    //console.error(3,true,node.flag,node.prefix,node.namespaceURI)
    return true;
  }
  function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
    if(nodeFilter){
      node = nodeFilter(node);
      if(node){
        if(typeof node == 'string'){
          buf.push(node);
          return;
        }
      }else{
        return;
      }
      //buf.sort.apply(attrs, attributeSorter);
    }
    switch(node.nodeType){
    case ELEMENT_NODE:
      if (!visibleNamespaces) visibleNamespaces = [];
      var startVisibleNamespaces = visibleNamespaces.length;
      var attrs = node.attributes;
      var len = attrs.length;
      var child = node.firstChild;
      var nodeName = node.tagName;
      
      isHTML =  (htmlns === node.namespaceURI) ||isHTML 
      buf.push('<',nodeName);
      
      
      
      for(var i=0;i<len;i++){
        // add namespaces for attributes
        var attr = attrs.item(i);
        if (attr.prefix == 'xmlns') {
          visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
        }else if(attr.nodeName == 'xmlns'){
          visibleNamespaces.push({ prefix: '', namespace: attr.value });
        }
      }
      for(var i=0;i<len;i++){
        var attr = attrs.item(i);
        if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
          var prefix = attr.prefix||'';
          var uri = attr.namespaceURI;
          var ns = prefix ? ' xmlns:' + prefix : " xmlns";
          buf.push(ns, '="' , uri , '"');
          visibleNamespaces.push({ prefix: prefix, namespace:uri });
        }
        serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
      }
      // add namespace for current node		
      if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
        var prefix = node.prefix||'';
        var uri = node.namespaceURI;
        if (uri) {
          // Avoid empty namespace value like xmlns:ds=""
          // Empty namespace URL will we produce an invalid XML document
          var ns = prefix ? ' xmlns:' + prefix : " xmlns";
          buf.push(ns, '="' , uri , '"');
          visibleNamespaces.push({ prefix: prefix, namespace:uri });
        }
      }
      
      if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
        buf.push('>');
        //if is cdata child node
        if(isHTML && /^script$/i.test(nodeName)){
          while(child){
            if(child.data){
              buf.push(child.data);
            }else{
              serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
            }
            child = child.nextSibling;
          }
        }else
        {
          while(child){
            serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
            child = child.nextSibling;
          }
        }
        buf.push('</',nodeName,'>');
      }else{
        buf.push('/>');
      }
      // remove added visible namespaces
      //visibleNamespaces.length = startVisibleNamespaces;
      return;
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      var child = node.firstChild;
      while(child){
        serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
        child = child.nextSibling;
      }
      return;
    case ATTRIBUTE_NODE:
      /**
       * Well-formedness constraint: No < in Attribute Values
       * The replacement text of any entity referred to directly or indirectly in an attribute value must not contain a <.
       * @see https://www.w3.org/TR/xml/#CleanAttrVals
       * @see https://www.w3.org/TR/xml/#NT-AttValue
       */
      return buf.push(' ', node.name, '="', node.value.replace(/[<&"]/g,_xmlEncoder), '"');
    case TEXT_NODE:
      /**
       * The ampersand character (&) and the left angle bracket (<) must not appear in their literal form,
       * except when used as markup delimiters, or within a comment, a processing instruction, or a CDATA section.
       * If they are needed elsewhere, they must be escaped using either numeric character references or the strings
       * `&amp;` and `&lt;` respectively.
       * The right angle bracket (>) may be represented using the string " &gt; ", and must, for compatibility,
       * be escaped using either `&gt;` or a character reference when it appears in the string `]]>` in content,
       * when that string is not marking the end of a CDATA section.
       *
       * In the content of elements, character data is any string of characters
       * which does not contain the start-delimiter of any markup
       * and does not include the CDATA-section-close delimiter, `]]>`.
       *
       * @see https://www.w3.org/TR/xml/#NT-CharData
       */
      return buf.push(node.data
        .replace(/[<&]/g,_xmlEncoder)
        .replace(/]]>/g, ']]&gt;')
      );
    case CDATA_SECTION_NODE:
      return buf.push( '<![CDATA[',node.data,']]>');
    case COMMENT_NODE:
      return buf.push( "<!--",node.data,"-->");
    case DOCUMENT_TYPE_NODE:
      var pubid = node.publicId;
      var sysid = node.systemId;
      buf.push('<!DOCTYPE ',node.name);
      if(pubid){
        buf.push(' PUBLIC ', pubid);
        if (sysid && sysid!='.') {
          buf.push(' ', sysid);
        }
        buf.push('>');
      }else if(sysid && sysid!='.'){
        buf.push(' SYSTEM ', sysid, '>');
      }else{
        var sub = node.internalSubset;
        if(sub){
          buf.push(" [",sub,"]");
        }
        buf.push(">");
      }
      return;
    case PROCESSING_INSTRUCTION_NODE:
      return buf.push( "<?",node.target," ",node.data,"?>");
    case ENTITY_REFERENCE_NODE:
      return buf.push( '&',node.nodeName,';');
    //case ENTITY_NODE:
    //case NOTATION_NODE:
    default:
      buf.push('??',node.nodeName);
    }
  }
  function importNode(doc,node,deep){
    var node2;
    switch (node.nodeType) {
    case ELEMENT_NODE:
      node2 = node.cloneNode(false);
      node2.ownerDocument = doc;
      //var attrs = node2.attributes;
      //var len = attrs.length;
      //for(var i=0;i<len;i++){
        //node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
      //}
    case DOCUMENT_FRAGMENT_NODE:
      break;
    case ATTRIBUTE_NODE:
      deep = true;
      break;
    //case ENTITY_REFERENCE_NODE:
    //case PROCESSING_INSTRUCTION_NODE:
    ////case TEXT_NODE:
    //case CDATA_SECTION_NODE:
    //case COMMENT_NODE:
    //	deep = false;
    //	break;
    //case DOCUMENT_NODE:
    //case DOCUMENT_TYPE_NODE:
    //cannot be imported.
    //case ENTITY_NODE:
    //case NOTATION_NODE：
    //can not hit in level3
    //default:throw e;
    }
    if(!node2){
      node2 = node.cloneNode(false);//false
    }
    node2.ownerDocument = doc;
    node2.parentNode = null;
    if(deep){
      var child = node.firstChild;
      while(child){
        node2.appendChild(importNode(doc,child,deep));
        child = child.nextSibling;
      }
    }
    return node2;
  }
  //
  //var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
  //					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
  function cloneNode(doc,node,deep){
    var node2 = new node.constructor();
    for(var n in node){
      var v = node[n];
      if(typeof v != 'object' ){
        if(v != node2[n]){
          node2[n] = v;
        }
      }
    }
    if(node.childNodes){
      node2.childNodes = new NodeList();
    }
    node2.ownerDocument = doc;
    switch (node2.nodeType) {
    case ELEMENT_NODE:
      var attrs	= node.attributes;
      var attrs2	= node2.attributes = new NamedNodeMap();
      var len = attrs.length
      attrs2._ownerElement = node2;
      for(var i=0;i<len;i++){
        node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
      }
      break;;
    case ATTRIBUTE_NODE:
      deep = true;
    }
    if(deep){
      var child = node.firstChild;
      while(child){
        node2.appendChild(cloneNode(doc,child,deep));
        child = child.nextSibling;
      }
    }
    return node2;
  }
  
  function __set__(object,key,value){
    object[key] = value
  }
  //do dynamic
  try{
    if(Object.defineProperty){
      Object.defineProperty(LiveNodeList.prototype,'length',{
        get:function(){
          _updateLiveList(this);
          return this.$$length;
        }
      });
      Object.defineProperty(Node.prototype,'textContent',{
        get:function(){
          return getTextContent(this);
        },
        set:function(data){
          switch(this.nodeType){
          case ELEMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            while(this.firstChild){
              this.removeChild(this.firstChild);
            }
            if(data || String(data)){
              this.appendChild(this.ownerDocument.createTextNode(data));
            }
            break;
          default:
            //TODO:
            this.data = data;
            this.value = data;
            this.nodeValue = data;
          }
        }
      })
      
      function getTextContent(node){
        switch(node.nodeType){
        case ELEMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE:
          var buf = [];
          node = node.firstChild;
          while(node){
            if(node.nodeType!==7 && node.nodeType !==8){
              buf.push(getTextContent(node));
            }
            node = node.nextSibling;
          }
          return buf.join('');
        default:
          return node.nodeValue;
        }
      }
      __set__ = function(object,key,value){
        //console.log(value)
        object['$$'+key] = value
      }
    }
  }catch(e){//ie8
  }
  
  //if(typeof require == 'function'){
    __webpack_unused_export__ = Node;
    __webpack_unused_export__ = DOMException;
    exports.DOMImplementation = DOMImplementation;
    __webpack_unused_export__ = XMLSerializer;
  //}
  
  
  /***/ }),
  
  /***/ 2975:
  /***/ ((__unused_webpack_module, exports) => {
  
  exports.entityMap = {
         lt: '<',
         gt: '>',
         amp: '&',
         quot: '"',
         apos: "'",
         Agrave: "À",
         Aacute: "Á",
         Acirc: "Â",
         Atilde: "Ã",
         Auml: "Ä",
         Aring: "Å",
         AElig: "Æ",
         Ccedil: "Ç",
         Egrave: "È",
         Eacute: "É",
         Ecirc: "Ê",
         Euml: "Ë",
         Igrave: "Ì",
         Iacute: "Í",
         Icirc: "Î",
         Iuml: "Ï",
         ETH: "Ð",
         Ntilde: "Ñ",
         Ograve: "Ò",
         Oacute: "Ó",
         Ocirc: "Ô",
         Otilde: "Õ",
         Ouml: "Ö",
         Oslash: "Ø",
         Ugrave: "Ù",
         Uacute: "Ú",
         Ucirc: "Û",
         Uuml: "Ü",
         Yacute: "Ý",
         THORN: "Þ",
         szlig: "ß",
         agrave: "à",
         aacute: "á",
         acirc: "â",
         atilde: "ã",
         auml: "ä",
         aring: "å",
         aelig: "æ",
         ccedil: "ç",
         egrave: "è",
         eacute: "é",
         ecirc: "ê",
         euml: "ë",
         igrave: "ì",
         iacute: "í",
         icirc: "î",
         iuml: "ï",
         eth: "ð",
         ntilde: "ñ",
         ograve: "ò",
         oacute: "ó",
         ocirc: "ô",
         otilde: "õ",
         ouml: "ö",
         oslash: "ø",
         ugrave: "ù",
         uacute: "ú",
         ucirc: "û",
         uuml: "ü",
         yacute: "ý",
         thorn: "þ",
         yuml: "ÿ",
         nbsp: "\u00a0",
         iexcl: "¡",
         cent: "¢",
         pound: "£",
         curren: "¤",
         yen: "¥",
         brvbar: "¦",
         sect: "§",
         uml: "¨",
         copy: "©",
         ordf: "ª",
         laquo: "«",
         not: "¬",
         shy: "­­",
         reg: "®",
         macr: "¯",
         deg: "°",
         plusmn: "±",
         sup2: "²",
         sup3: "³",
         acute: "´",
         micro: "µ",
         para: "¶",
         middot: "·",
         cedil: "¸",
         sup1: "¹",
         ordm: "º",
         raquo: "»",
         frac14: "¼",
         frac12: "½",
         frac34: "¾",
         iquest: "¿",
         times: "×",
         divide: "÷",
         forall: "∀",
         part: "∂",
         exist: "∃",
         empty: "∅",
         nabla: "∇",
         isin: "∈",
         notin: "∉",
         ni: "∋",
         prod: "∏",
         sum: "∑",
         minus: "−",
         lowast: "∗",
         radic: "√",
         prop: "∝",
         infin: "∞",
         ang: "∠",
         and: "∧",
         or: "∨",
         cap: "∩",
         cup: "∪",
         'int': "∫",
         there4: "∴",
         sim: "∼",
         cong: "≅",
         asymp: "≈",
         ne: "≠",
         equiv: "≡",
         le: "≤",
         ge: "≥",
         sub: "⊂",
         sup: "⊃",
         nsub: "⊄",
         sube: "⊆",
         supe: "⊇",
         oplus: "⊕",
         otimes: "⊗",
         perp: "⊥",
         sdot: "⋅",
         Alpha: "Α",
         Beta: "Β",
         Gamma: "Γ",
         Delta: "Δ",
         Epsilon: "Ε",
         Zeta: "Ζ",
         Eta: "Η",
         Theta: "Θ",
         Iota: "Ι",
         Kappa: "Κ",
         Lambda: "Λ",
         Mu: "Μ",
         Nu: "Ν",
         Xi: "Ξ",
         Omicron: "Ο",
         Pi: "Π",
         Rho: "Ρ",
         Sigma: "Σ",
         Tau: "Τ",
         Upsilon: "Υ",
         Phi: "Φ",
         Chi: "Χ",
         Psi: "Ψ",
         Omega: "Ω",
         alpha: "α",
         beta: "β",
         gamma: "γ",
         delta: "δ",
         epsilon: "ε",
         zeta: "ζ",
         eta: "η",
         theta: "θ",
         iota: "ι",
         kappa: "κ",
         lambda: "λ",
         mu: "μ",
         nu: "ν",
         xi: "ξ",
         omicron: "ο",
         pi: "π",
         rho: "ρ",
         sigmaf: "ς",
         sigma: "σ",
         tau: "τ",
         upsilon: "υ",
         phi: "φ",
         chi: "χ",
         psi: "ψ",
         omega: "ω",
         thetasym: "ϑ",
         upsih: "ϒ",
         piv: "ϖ",
         OElig: "Œ",
         oelig: "œ",
         Scaron: "Š",
         scaron: "š",
         Yuml: "Ÿ",
         fnof: "ƒ",
         circ: "ˆ",
         tilde: "˜",
         ensp: " ",
         emsp: " ",
         thinsp: " ",
         zwnj: "‌",
         zwj: "‍",
         lrm: "‎",
         rlm: "‏",
         ndash: "–",
         mdash: "—",
         lsquo: "‘",
         rsquo: "’",
         sbquo: "‚",
         ldquo: "“",
         rdquo: "”",
         bdquo: "„",
         dagger: "†",
         Dagger: "‡",
         bull: "•",
         hellip: "…",
         permil: "‰",
         prime: "′",
         Prime: "″",
         lsaquo: "‹",
         rsaquo: "›",
         oline: "‾",
         euro: "€",
         trade: "™",
         larr: "←",
         uarr: "↑",
         rarr: "→",
         darr: "↓",
         harr: "↔",
         crarr: "↵",
         lceil: "⌈",
         rceil: "⌉",
         lfloor: "⌊",
         rfloor: "⌋",
         loz: "◊",
         spades: "♠",
         clubs: "♣",
         hearts: "♥",
         diams: "♦"
  };
  
  
  /***/ }),
  
  /***/ 7860:
  /***/ ((__unused_webpack_module, exports) => {
  
  //[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
  //[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
  //[5]   	Name	   ::=   	NameStartChar (NameChar)*
  var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
  var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
  var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
  //var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
  //var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')
  
  //S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
  //S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
  var S_TAG = 0;//tag name offerring
  var S_ATTR = 1;//attr name offerring 
  var S_ATTR_SPACE=2;//attr name end and space offer
  var S_EQ = 3;//=space?
  var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
  var S_ATTR_END = 5;//attr value end and no space(quot end)
  var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
  var S_TAG_CLOSE = 7;//closed el<el />
  
  /**
   * Creates an error that will not be caught by XMLReader aka the SAX parser.
   *
   * @param {string} message
   * @param {any?} locator Optional, can provide details about the location in the source
   * @constructor
   */
  function ParseError(message, locator) {
    this.message = message
    this.locator = locator
    if(Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
  }
  ParseError.prototype = new Error();
  ParseError.prototype.name = ParseError.name
  
  function XMLReader(){
    
  }
  
  XMLReader.prototype = {
    parse:function(source,defaultNSMap,entityMap){
      var domBuilder = this.domBuilder;
      domBuilder.startDocument();
      _copy(defaultNSMap ,defaultNSMap = {})
      parse(source,defaultNSMap,entityMap,
          domBuilder,this.errorHandler);
      domBuilder.endDocument();
    }
  }
  function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
    function fixedFromCharCode(code) {
      // String.prototype.fromCharCode does not supports
      // > 2 bytes unicode chars directly
      if (code > 0xffff) {
        code -= 0x10000;
        var surrogate1 = 0xd800 + (code >> 10)
          , surrogate2 = 0xdc00 + (code & 0x3ff);
  
        return String.fromCharCode(surrogate1, surrogate2);
      } else {
        return String.fromCharCode(code);
      }
    }
    function entityReplacer(a){
      var k = a.slice(1,-1);
      if(k in entityMap){
        return entityMap[k]; 
      }else if(k.charAt(0) === '#'){
        return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
      }else{
        errorHandler.error('entity not found:'+a);
        return a;
      }
    }
    function appendText(end){//has some bugs
      if(end>start){
        var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
        locator&&position(start);
        domBuilder.characters(xt,0,end-start);
        start = end
      }
    }
    function position(p,m){
      while(p>=lineEnd && (m = linePattern.exec(source))){
        lineStart = m.index;
        lineEnd = lineStart + m[0].length;
        locator.lineNumber++;
        //console.log('line++:',locator,startPos,endPos)
      }
      locator.columnNumber = p-lineStart+1;
    }
    var lineStart = 0;
    var lineEnd = 0;
    var linePattern = /.*(?:\r\n?|\n)|.*$/g
    var locator = domBuilder.locator;
    
    var parseStack = [{currentNSMap:defaultNSMapCopy}]
    var closeMap = {};
    var start = 0;
    while(true){
      try{
        var tagStart = source.indexOf('<',start);
        if(tagStart<0){
          if(!source.substr(start).match(/^\s*$/)){
            var doc = domBuilder.doc;
              var text = doc.createTextNode(source.substr(start));
              doc.appendChild(text);
              domBuilder.currentElement = text;
          }
          return;
        }
        if(tagStart>start){
          appendText(tagStart);
        }
        switch(source.charAt(tagStart+1)){
        case '/':
          var end = source.indexOf('>',tagStart+3);
          var tagName = source.substring(tagStart+2,end);
          var config = parseStack.pop();
          if(end<0){
            
                tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
                errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
                end = tagStart+1+tagName.length;
              }else if(tagName.match(/\s</)){
                tagName = tagName.replace(/[\s<].*/,'');
                errorHandler.error("end tag name: "+tagName+' maybe not complete');
                end = tagStart+1+tagName.length;
          }
          var localNSMap = config.localNSMap;
          var endMatch = config.tagName == tagName;
          var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
              if(endIgnoreCaseMach){
                domBuilder.endElement(config.uri,config.localName,tagName);
            if(localNSMap){
              for(var prefix in localNSMap){
                domBuilder.endPrefixMapping(prefix) ;
              }
            }
            if(!endMatch){
                    errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName ); // No known test case
            }
              }else{
                parseStack.push(config)
              }
          
          end++;
          break;
          // end elment
        case '?':// <?...?>
          locator&&position(tagStart);
          end = parseInstruction(source,tagStart,domBuilder);
          break;
        case '!':// <!doctype,<![CDATA,<!--
          locator&&position(tagStart);
          end = parseDCC(source,tagStart,domBuilder,errorHandler);
          break;
        default:
          locator&&position(tagStart);
          var el = new ElementAttributes();
          var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
          //elStartEnd
          var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
          var len = el.length;
          
          
          if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
            el.closed = true;
            if(!entityMap.nbsp){
              errorHandler.warning('unclosed xml attribute');
            }
          }
          if(locator && len){
            var locator2 = copyLocator(locator,{});
            //try{//attribute position fixed
            for(var i = 0;i<len;i++){
              var a = el[i];
              position(a.offset);
              a.locator = copyLocator(locator,{});
            }
            domBuilder.locator = locator2
            if(appendElement(el,domBuilder,currentNSMap)){
              parseStack.push(el)
            }
            domBuilder.locator = locator;
          }else{
            if(appendElement(el,domBuilder,currentNSMap)){
              parseStack.push(el)
            }
          }
          
          
          
          if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
            end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
          }else{
            end++;
          }
        }
      }catch(e){
        if (e instanceof ParseError) {
          throw e;
        }
        errorHandler.error('element parse error: '+e)
        end = -1;
      }
      if(end>start){
        start = end;
      }else{
        //TODO: 这里有可能sax回退，有位置错误风险
        appendText(Math.max(tagStart,start)+1);
      }
    }
  }
  function copyLocator(f,t){
    t.lineNumber = f.lineNumber;
    t.columnNumber = f.columnNumber;
    return t;
  }
  
  /**
   * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
   * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
   */
  function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
  
    /**
     * @param {string} qname
     * @param {string} value
     * @param {number} startIndex
     */
    function addAttribute(qname, value, startIndex) {
      if (qname in el.attributeNames) errorHandler.fatalError('Attribute ' + qname + ' redefined')
      el.addValue(qname, value, startIndex)
    }
    var attrName;
    var value;
    var p = ++start;
    var s = S_TAG;//status
    while(true){
      var c = source.charAt(p);
      switch(c){
      case '=':
        if(s === S_ATTR){//attrName
          attrName = source.slice(start,p);
          s = S_EQ;
        }else if(s === S_ATTR_SPACE){
          s = S_EQ;
        }else{
          //fatalError: equal must after attrName or space after attrName
          throw new Error('attribute equal must after attrName'); // No known test case
        }
        break;
      case '\'':
      case '"':
        if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
          ){//equal
          if(s === S_ATTR){
            errorHandler.warning('attribute value must after "="')
            attrName = source.slice(start,p)
          }
          start = p+1;
          p = source.indexOf(c,start)
          if(p>0){
            value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
            addAttribute(attrName, value, start-1);
            s = S_ATTR_END;
          }else{
            //fatalError: no end quot match
            throw new Error('attribute value no end \''+c+'\' match');
          }
        }else if(s == S_ATTR_NOQUOT_VALUE){
          value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
          //console.log(attrName,value,start,p)
          addAttribute(attrName, value, start);
          //console.dir(el)
          errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
          start = p+1;
          s = S_ATTR_END
        }else{
          //fatalError: no equal before
          throw new Error('attribute value must after "="'); // No known test case
        }
        break;
      case '/':
        switch(s){
        case S_TAG:
          el.setTagName(source.slice(start,p));
        case S_ATTR_END:
        case S_TAG_SPACE:
        case S_TAG_CLOSE:
          s =S_TAG_CLOSE;
          el.closed = true;
        case S_ATTR_NOQUOT_VALUE:
        case S_ATTR:
        case S_ATTR_SPACE:
          break;
        //case S_EQ:
        default:
          throw new Error("attribute invalid close char('/')") // No known test case
        }
        break;
      case ''://end document
        errorHandler.error('unexpected end of input');
        if(s == S_TAG){
          el.setTagName(source.slice(start,p));
        }
        return p;
      case '>':
        switch(s){
        case S_TAG:
          el.setTagName(source.slice(start,p));
        case S_ATTR_END:
        case S_TAG_SPACE:
        case S_TAG_CLOSE:
          break;//normal
        case S_ATTR_NOQUOT_VALUE://Compatible state
        case S_ATTR:
          value = source.slice(start,p);
          if(value.slice(-1) === '/'){
            el.closed  = true;
            value = value.slice(0,-1)
          }
        case S_ATTR_SPACE:
          if(s === S_ATTR_SPACE){
            value = attrName;
          }
          if(s == S_ATTR_NOQUOT_VALUE){
            errorHandler.warning('attribute "'+value+'" missed quot(")!');
            addAttribute(attrName, value.replace(/&#?\w+;/g,entityReplacer), start)
          }else{
            if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
              errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
            }
            addAttribute(value, value, start)
          }
          break;
        case S_EQ:
          throw new Error('attribute value missed!!');
        }
  //			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
        return p;
      /*xml space '\x20' | #x9 | #xD | #xA; */
      case '\u0080':
        c = ' ';
      default:
        if(c<= ' '){//space
          switch(s){
          case S_TAG:
            el.setTagName(source.slice(start,p));//tagName
            s = S_TAG_SPACE;
            break;
          case S_ATTR:
            attrName = source.slice(start,p)
            s = S_ATTR_SPACE;
            break;
          case S_ATTR_NOQUOT_VALUE:
            var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
            errorHandler.warning('attribute "'+value+'" missed quot(")!!');
            addAttribute(attrName, value, start)
          case S_ATTR_END:
            s = S_TAG_SPACE;
            break;
          //case S_TAG_SPACE:
          //case S_EQ:
          //case S_ATTR_SPACE:
          //	void();break;
          //case S_TAG_CLOSE:
            //ignore warning
          }
        }else{//not space
  //S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
  //S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
          switch(s){
          //case S_TAG:void();break;
          //case S_ATTR:void();break;
          //case S_ATTR_NOQUOT_VALUE:void();break;
          case S_ATTR_SPACE:
            var tagName =  el.tagName;
            if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
              errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
            }
            addAttribute(attrName, attrName, start);
            start = p;
            s = S_ATTR;
            break;
          case S_ATTR_END:
            errorHandler.warning('attribute space is required"'+attrName+'"!!')
          case S_TAG_SPACE:
            s = S_ATTR;
            start = p;
            break;
          case S_EQ:
            s = S_ATTR_NOQUOT_VALUE;
            start = p;
            break;
          case S_TAG_CLOSE:
            throw new Error("elements closed character '/' and '>' must be connected to");
          }
        }
      }//end outer switch
      //console.log('p++',p)
      p++;
    }
  }
  /**
   * @return true if has new namespace define
   */
  function appendElement(el,domBuilder,currentNSMap){
    var tagName = el.tagName;
    var localNSMap = null;
    //var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
    var i = el.length;
    while(i--){
      var a = el[i];
      var qName = a.qName;
      var value = a.value;
      var nsp = qName.indexOf(':');
      if(nsp>0){
        var prefix = a.prefix = qName.slice(0,nsp);
        var localName = qName.slice(nsp+1);
        var nsPrefix = prefix === 'xmlns' && localName
      }else{
        localName = qName;
        prefix = null
        nsPrefix = qName === 'xmlns' && ''
      }
      //can not set prefix,because prefix !== ''
      a.localName = localName ;
      //prefix == null for no ns prefix attribute 
      if(nsPrefix !== false){//hack!!
        if(localNSMap == null){
          localNSMap = {}
          //console.log(currentNSMap,0)
          _copy(currentNSMap,currentNSMap={})
          //console.log(currentNSMap,1)
        }
        currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
        a.uri = 'http://www.w3.org/2000/xmlns/'
        domBuilder.startPrefixMapping(nsPrefix, value) 
      }
    }
    var i = el.length;
    while(i--){
      a = el[i];
      var prefix = a.prefix;
      if(prefix){//no prefix attribute has no namespace
        if(prefix === 'xml'){
          a.uri = 'http://www.w3.org/XML/1998/namespace';
        }if(prefix !== 'xmlns'){
          a.uri = currentNSMap[prefix || '']
          
          //{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
        }
      }
    }
    var nsp = tagName.indexOf(':');
    if(nsp>0){
      prefix = el.prefix = tagName.slice(0,nsp);
      localName = el.localName = tagName.slice(nsp+1);
    }else{
      prefix = null;//important!!
      localName = el.localName = tagName;
    }
    //no prefix element has default namespace
    var ns = el.uri = currentNSMap[prefix || ''];
    domBuilder.startElement(ns,localName,tagName,el);
    //endPrefixMapping and startPrefixMapping have not any help for dom builder
    //localNSMap = null
    if(el.closed){
      domBuilder.endElement(ns,localName,tagName);
      if(localNSMap){
        for(prefix in localNSMap){
          domBuilder.endPrefixMapping(prefix) 
        }
      }
    }else{
      el.currentNSMap = currentNSMap;
      el.localNSMap = localNSMap;
      //parseStack.push(el);
      return true;
    }
  }
  function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
    if(/^(?:script|textarea)$/i.test(tagName)){
      var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
      var text = source.substring(elStartEnd+1,elEndStart);
      if(/[&<]/.test(text)){
        if(/^script$/i.test(tagName)){
          //if(!/\]\]>/.test(text)){
            //lexHandler.startCDATA();
            domBuilder.characters(text,0,text.length);
            //lexHandler.endCDATA();
            return elEndStart;
          //}
        }//}else{//text area
          text = text.replace(/&#?\w+;/g,entityReplacer);
          domBuilder.characters(text,0,text.length);
          return elEndStart;
        //}
        
      }
    }
    return elStartEnd+1;
  }
  function fixSelfClosed(source,elStartEnd,tagName,closeMap){
    //if(tagName in closeMap){
    var pos = closeMap[tagName];
    if(pos == null){
      //console.log(tagName)
      pos =  source.lastIndexOf('</'+tagName+'>')
      if(pos<elStartEnd){//忘记闭合
        pos = source.lastIndexOf('</'+tagName)
      }
      closeMap[tagName] =pos
    }
    return pos<elStartEnd;
    //} 
  }
  function _copy(source,target){
    for(var n in source){target[n] = source[n]}
  }
  function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
    var next= source.charAt(start+2)
    switch(next){
    case '-':
      if(source.charAt(start + 3) === '-'){
        var end = source.indexOf('-->',start+4);
        //append comment source.substring(4,end)//<!--
        if(end>start){
          domBuilder.comment(source,start+4,end-start-4);
          return end+3;
        }else{
          errorHandler.error("Unclosed comment");
          return -1;
        }
      }else{
        //error
        return -1;
      }
    default:
      if(source.substr(start+3,6) == 'CDATA['){
        var end = source.indexOf(']]>',start+9);
        domBuilder.startCDATA();
        domBuilder.characters(source,start+9,end-start-9);
        domBuilder.endCDATA() 
        return end+3;
      }
      //<!DOCTYPE
      //startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
      var matchs = split(source,start);
      var len = matchs.length;
      if(len>1 && /!doctype/i.test(matchs[0][0])){
        var name = matchs[1][0];
        var pubid = false;
        var sysid = false;
        if(len>3){
          if(/^public$/i.test(matchs[2][0])){
            pubid = matchs[3][0];
            sysid = len>4 && matchs[4][0];
          }else if(/^system$/i.test(matchs[2][0])){
            sysid = matchs[3][0];
          }
        }
        var lastMatch = matchs[len-1]
        domBuilder.startDTD(name, pubid, sysid);
        domBuilder.endDTD();
        
        return lastMatch.index+lastMatch[0].length
      }
    }
    return -1;
  }
  
  
  
  function parseInstruction(source,start,domBuilder){
    var end = source.indexOf('?>',start);
    if(end){
      var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
      if(match){
        var len = match[0].length;
        domBuilder.processingInstruction(match[1], match[2]) ;
        return end+2;
      }else{//error
        return -1;
      }
    }
    return -1;
  }
  
  function ElementAttributes(){
    this.attributeNames = {}
  }
  ElementAttributes.prototype = {
    setTagName:function(tagName){
      if(!tagNamePattern.test(tagName)){
        throw new Error('invalid tagName:'+tagName)
      }
      this.tagName = tagName
    },
    addValue:function(qName, value, offset) {
      if(!tagNamePattern.test(qName)){
        throw new Error('invalid attribute:'+qName)
      }
      this.attributeNames[qName] = this.length;
      this[this.length++] = {qName:qName,value:value,offset:offset}
    },
    length:0,
    getLocalName:function(i){return this[i].localName},
    getLocator:function(i){return this[i].locator},
    getQName:function(i){return this[i].qName},
    getURI:function(i){return this[i].uri},
    getValue:function(i){return this[i].value}
  //	,getIndex:function(uri, localName)){
  //		if(localName){
  //			
  //		}else{
  //			var qName = uri
  //		}
  //	},
  //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
  //	getType:function(uri,localName){}
  //	getType:function(i){},
  }
  
  
  
  function split(source,start){
    var match;
    var buf = [];
    var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
    reg.lastIndex = start;
    reg.exec(source);//skip <
    while(match = reg.exec(source)){
      buf.push(match);
      if(match[1])return buf;
    }
  }
  
  exports.XMLReader = XMLReader;
  exports.ParseError = ParseError;
  
  
  /***/ }),
  
  /***/ 1532:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const ANY = Symbol('SemVer ANY')
  // hoisted class for cyclic dependency
  class Comparator {
    static get ANY () {
      return ANY
    }
  
    constructor (comp, options) {
      options = parseOptions(options)
  
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp
        } else {
          comp = comp.value
        }
      }
  
      debug('comparator', comp, options)
      this.options = options
      this.loose = !!options.loose
      this.parse(comp)
  
      if (this.semver === ANY) {
        this.value = ''
      } else {
        this.value = this.operator + this.semver.version
      }
  
      debug('comp', this)
    }
  
    parse (comp) {
      const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
      const m = comp.match(r)
  
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`)
      }
  
      this.operator = m[1] !== undefined ? m[1] : ''
      if (this.operator === '=') {
        this.operator = ''
      }
  
      // if it literally is just '>' or '' then allow anything.
      if (!m[2]) {
        this.semver = ANY
      } else {
        this.semver = new SemVer(m[2], this.options.loose)
      }
    }
  
    toString () {
      return this.value
    }
  
    test (version) {
      debug('Comparator.test', version, this.options.loose)
  
      if (this.semver === ANY || version === ANY) {
        return true
      }
  
      if (typeof version === 'string') {
        try {
          version = new SemVer(version, this.options)
        } catch (er) {
          return false
        }
      }
  
      return cmp(version, this.operator, this.semver, this.options)
    }
  
    intersects (comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError('a Comparator is required')
      }
  
      if (!options || typeof options !== 'object') {
        options = {
          loose: !!options,
          includePrerelease: false,
        }
      }
  
      if (this.operator === '') {
        if (this.value === '') {
          return true
        }
        return new Range(comp.value, options).test(this.value)
      } else if (comp.operator === '') {
        if (comp.value === '') {
          return true
        }
        return new Range(this.value, options).test(comp.semver)
      }
  
      const sameDirectionIncreasing =
        (this.operator === '>=' || this.operator === '>') &&
        (comp.operator === '>=' || comp.operator === '>')
      const sameDirectionDecreasing =
        (this.operator === '<=' || this.operator === '<') &&
        (comp.operator === '<=' || comp.operator === '<')
      const sameSemVer = this.semver.version === comp.semver.version
      const differentDirectionsInclusive =
        (this.operator === '>=' || this.operator === '<=') &&
        (comp.operator === '>=' || comp.operator === '<=')
      const oppositeDirectionsLessThan =
        cmp(this.semver, '<', comp.semver, options) &&
        (this.operator === '>=' || this.operator === '>') &&
          (comp.operator === '<=' || comp.operator === '<')
      const oppositeDirectionsGreaterThan =
        cmp(this.semver, '>', comp.semver, options) &&
        (this.operator === '<=' || this.operator === '<') &&
          (comp.operator === '>=' || comp.operator === '>')
  
      return (
        sameDirectionIncreasing ||
        sameDirectionDecreasing ||
        (sameSemVer && differentDirectionsInclusive) ||
        oppositeDirectionsLessThan ||
        oppositeDirectionsGreaterThan
      )
    }
  }
  
  module.exports = Comparator
  
  const parseOptions = __nccwpck_require__(785)
  const { re, t } = __nccwpck_require__(9523)
  const cmp = __nccwpck_require__(5098)
  const debug = __nccwpck_require__(427)
  const SemVer = __nccwpck_require__(8088)
  const Range = __nccwpck_require__(9828)
  
  
  /***/ }),
  
  /***/ 9828:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  // hoisted class for cyclic dependency
  class Range {
    constructor (range, options) {
      options = parseOptions(options)
  
      if (range instanceof Range) {
        if (
          range.loose === !!options.loose &&
          range.includePrerelease === !!options.includePrerelease
        ) {
          return range
        } else {
          return new Range(range.raw, options)
        }
      }
  
      if (range instanceof Comparator) {
        // just put it in the set and return
        this.raw = range.value
        this.set = [[range]]
        this.format()
        return this
      }
  
      this.options = options
      this.loose = !!options.loose
      this.includePrerelease = !!options.includePrerelease
  
      // First, split based on boolean or ||
      this.raw = range
      this.set = range
        .split('||')
        // map the range to a 2d array of comparators
        .map(r => this.parseRange(r.trim()))
        // throw out any comparator lists that are empty
        // this generally means that it was not a valid range, which is allowed
        // in loose mode, but will still throw if the WHOLE range is invalid.
        .filter(c => c.length)
  
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${range}`)
      }
  
      // if we have any that are not the null set, throw out null sets.
      if (this.set.length > 1) {
        // keep the first one, in case they're all null sets
        const first = this.set[0]
        this.set = this.set.filter(c => !isNullSet(c[0]))
        if (this.set.length === 0) {
          this.set = [first]
        } else if (this.set.length > 1) {
          // if we have any that are *, then the range is just *
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c]
              break
            }
          }
        }
      }
  
      this.format()
    }
  
    format () {
      this.range = this.set
        .map((comps) => {
          return comps.join(' ').trim()
        })
        .join('||')
        .trim()
      return this.range
    }
  
    toString () {
      return this.range
    }
  
    parseRange (range) {
      range = range.trim()
  
      // memoize range parsing for performance.
      // this is a very hot path, and fully deterministic.
      const memoOpts = Object.keys(this.options).join(',')
      const memoKey = `parseRange:${memoOpts}:${range}`
      const cached = cache.get(memoKey)
      if (cached) {
        return cached
      }
  
      const loose = this.options.loose
      // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
      const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
      range = range.replace(hr, hyphenReplace(this.options.includePrerelease))
      debug('hyphen replace', range)
      // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
      range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)
      debug('comparator trim', range)
  
      // `~ 1.2.3` => `~1.2.3`
      range = range.replace(re[t.TILDETRIM], tildeTrimReplace)
  
      // `^ 1.2.3` => `^1.2.3`
      range = range.replace(re[t.CARETTRIM], caretTrimReplace)
  
      // normalize spaces
      range = range.split(/\s+/).join(' ')
  
      // At this point, the range is completely trimmed and
      // ready to be split into comparators.
  
      let rangeList = range
        .split(' ')
        .map(comp => parseComparator(comp, this.options))
        .join(' ')
        .split(/\s+/)
        // >=0.0.0 is equivalent to *
        .map(comp => replaceGTE0(comp, this.options))
  
      if (loose) {
        // in loose mode, throw out any that are not valid comparators
        rangeList = rangeList.filter(comp => {
          debug('loose invalid filter', comp, this.options)
          return !!comp.match(re[t.COMPARATORLOOSE])
        })
      }
      debug('range list', rangeList)
  
      // if any comparators are the null set, then replace with JUST null set
      // if more than one comparator, remove any * comparators
      // also, don't include the same comparator more than once
      const rangeMap = new Map()
      const comparators = rangeList.map(comp => new Comparator(comp, this.options))
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp]
        }
        rangeMap.set(comp.value, comp)
      }
      if (rangeMap.size > 1 && rangeMap.has('')) {
        rangeMap.delete('')
      }
  
      const result = [...rangeMap.values()]
      cache.set(memoKey, result)
      return result
    }
  
    intersects (range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError('a Range is required')
      }
  
      return this.set.some((thisComparators) => {
        return (
          isSatisfiable(thisComparators, options) &&
          range.set.some((rangeComparators) => {
            return (
              isSatisfiable(rangeComparators, options) &&
              thisComparators.every((thisComparator) => {
                return rangeComparators.every((rangeComparator) => {
                  return thisComparator.intersects(rangeComparator, options)
                })
              })
            )
          })
        )
      })
    }
  
    // if ANY of the sets match ALL of its comparators, then pass
    test (version) {
      if (!version) {
        return false
      }
  
      if (typeof version === 'string') {
        try {
          version = new SemVer(version, this.options)
        } catch (er) {
          return false
        }
      }
  
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true
        }
      }
      return false
    }
  }
  module.exports = Range
  
  const LRU = __nccwpck_require__(7129)
  const cache = new LRU({ max: 1000 })
  
  const parseOptions = __nccwpck_require__(785)
  const Comparator = __nccwpck_require__(1532)
  const debug = __nccwpck_require__(427)
  const SemVer = __nccwpck_require__(8088)
  const {
    re,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace,
  } = __nccwpck_require__(9523)
  
  const isNullSet = c => c.value === '<0.0.0-0'
  const isAny = c => c.value === ''
  
  // take a set of comparators and determine whether there
  // exists a version which can satisfy it
  const isSatisfiable = (comparators, options) => {
    let result = true
    const remainingComparators = comparators.slice()
    let testComparator = remainingComparators.pop()
  
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options)
      })
  
      testComparator = remainingComparators.pop()
    }
  
    return result
  }
  
  // comprised of xranges, tildes, stars, and gtlt's at this point.
  // already replaced the hyphen ranges
  // turn into a set of JUST comparators.
  const parseComparator = (comp, options) => {
    debug('comp', comp, options)
    comp = replaceCarets(comp, options)
    debug('caret', comp)
    comp = replaceTildes(comp, options)
    debug('tildes', comp)
    comp = replaceXRanges(comp, options)
    debug('xrange', comp)
    comp = replaceStars(comp, options)
    debug('stars', comp)
    return comp
  }
  
  const isX = id => !id || id.toLowerCase() === 'x' || id === '*'
  
  // ~, ~> --> * (any, kinda silly)
  // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
  // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
  // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
  // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
  // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
  // ~0.0.1 --> >=0.0.1 <0.1.0-0
  const replaceTildes = (comp, options) =>
    comp.trim().split(/\s+/).map((c) => {
      return replaceTilde(c, options)
    }).join(' ')
  
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
    return comp.replace(r, (_, M, m, p, pr) => {
      debug('tilde', comp, _, M, m, p, pr)
      let ret
  
      if (isX(M)) {
        ret = ''
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`
      } else if (isX(p)) {
        // ~1.2 == >=1.2.0 <1.3.0-0
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`
      } else if (pr) {
        debug('replaceTilde pr', pr)
        ret = `>=${M}.${m}.${p}-${pr
        } <${M}.${+m + 1}.0-0`
      } else {
        // ~1.2.3 == >=1.2.3 <1.3.0-0
        ret = `>=${M}.${m}.${p
        } <${M}.${+m + 1}.0-0`
      }
  
      debug('tilde return', ret)
      return ret
    })
  }
  
  // ^ --> * (any, kinda silly)
  // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
  // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
  // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
  // ^1.2.3 --> >=1.2.3 <2.0.0-0
  // ^1.2.0 --> >=1.2.0 <2.0.0-0
  // ^0.0.1 --> >=0.0.1 <0.0.2-0
  // ^0.1.0 --> >=0.1.0 <0.2.0-0
  const replaceCarets = (comp, options) =>
    comp.trim().split(/\s+/).map((c) => {
      return replaceCaret(c, options)
    }).join(' ')
  
  const replaceCaret = (comp, options) => {
    debug('caret', comp, options)
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
    const z = options.includePrerelease ? '-0' : ''
    return comp.replace(r, (_, M, m, p, pr) => {
      debug('caret', comp, _, M, m, p, pr)
      let ret
  
      if (isX(M)) {
        ret = ''
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`
      } else if (isX(p)) {
        if (M === '0') {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`
        }
      } else if (pr) {
        debug('replaceCaret pr', pr)
        if (M === '0') {
          if (m === '0') {
            ret = `>=${M}.${m}.${p}-${pr
            } <${M}.${m}.${+p + 1}-0`
          } else {
            ret = `>=${M}.${m}.${p}-${pr
            } <${M}.${+m + 1}.0-0`
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${+M + 1}.0.0-0`
        }
      } else {
        debug('no pr')
        if (M === '0') {
          if (m === '0') {
            ret = `>=${M}.${m}.${p
            }${z} <${M}.${m}.${+p + 1}-0`
          } else {
            ret = `>=${M}.${m}.${p
            }${z} <${M}.${+m + 1}.0-0`
          }
        } else {
          ret = `>=${M}.${m}.${p
          } <${+M + 1}.0.0-0`
        }
      }
  
      debug('caret return', ret)
      return ret
    })
  }
  
  const replaceXRanges = (comp, options) => {
    debug('replaceXRanges', comp, options)
    return comp.split(/\s+/).map((c) => {
      return replaceXRange(c, options)
    }).join(' ')
  }
  
  const replaceXRange = (comp, options) => {
    comp = comp.trim()
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug('xRange', comp, ret, gtlt, M, m, p, pr)
      const xM = isX(M)
      const xm = xM || isX(m)
      const xp = xm || isX(p)
      const anyX = xp
  
      if (gtlt === '=' && anyX) {
        gtlt = ''
      }
  
      // if we're including prereleases in the match, then we need
      // to fix this to -0, the lowest possible prerelease value
      pr = options.includePrerelease ? '-0' : ''
  
      if (xM) {
        if (gtlt === '>' || gtlt === '<') {
          // nothing is allowed
          ret = '<0.0.0-0'
        } else {
          // nothing is forbidden
          ret = '*'
        }
      } else if (gtlt && anyX) {
        // we know patch is an x, because we have any x at all.
        // replace X with 0
        if (xm) {
          m = 0
        }
        p = 0
  
        if (gtlt === '>') {
          // >1 => >=2.0.0
          // >1.2 => >=1.3.0
          gtlt = '>='
          if (xm) {
            M = +M + 1
            m = 0
            p = 0
          } else {
            m = +m + 1
            p = 0
          }
        } else if (gtlt === '<=') {
          // <=0.7.x is actually <0.8.0, since any 0.7.x should
          // pass.  Similarly, <=7.x is actually <8.0.0, etc.
          gtlt = '<'
          if (xm) {
            M = +M + 1
          } else {
            m = +m + 1
          }
        }
  
        if (gtlt === '<') {
          pr = '-0'
        }
  
        ret = `${gtlt + M}.${m}.${p}${pr}`
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr
        } <${M}.${+m + 1}.0-0`
      }
  
      debug('xRange return', ret)
  
      return ret
    })
  }
  
  // Because * is AND-ed with everything else in the comparator,
  // and '' means "any version", just remove the *s entirely.
  const replaceStars = (comp, options) => {
    debug('replaceStars', comp, options)
    // Looseness is ignored here.  star is always as loose as it gets!
    return comp.trim().replace(re[t.STAR], '')
  }
  
  const replaceGTE0 = (comp, options) => {
    debug('replaceGTE0', comp, options)
    return comp.trim()
      .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
  }
  
  // This function is passed to string.replace(re[t.HYPHENRANGE])
  // M, m, patch, prerelease, build
  // 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
  // 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
  // 1.2 - 3.4 => >=1.2.0 <3.5.0-0
  const hyphenReplace = incPr => ($0,
    from, fM, fm, fp, fpr, fb,
    to, tM, tm, tp, tpr, tb) => {
    if (isX(fM)) {
      from = ''
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? '-0' : ''}`
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`
    } else if (fpr) {
      from = `>=${from}`
    } else {
      from = `>=${from}${incPr ? '-0' : ''}`
    }
  
    if (isX(tM)) {
      to = ''
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`
    } else {
      to = `<=${to}`
    }
  
    return (`${from} ${to}`).trim()
  }
  
  const testSet = (set, version, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version)) {
        return false
      }
    }
  
    if (version.prerelease.length && !options.includePrerelease) {
      // Find the set of versions that are allowed to have prereleases
      // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
      // That should allow `1.2.3-pr.2` to pass.
      // However, `1.2.4-alpha.notready` should NOT be allowed,
      // even though it's within the range set by the comparators.
      for (let i = 0; i < set.length; i++) {
        debug(set[i].semver)
        if (set[i].semver === Comparator.ANY) {
          continue
        }
  
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver
          if (allowed.major === version.major &&
              allowed.minor === version.minor &&
              allowed.patch === version.patch) {
            return true
          }
        }
      }
  
      // Version has a -pre, but it's not one of the ones we like.
      return false
    }
  
    return true
  }
  
  
  /***/ }),
  
  /***/ 8088:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const debug = __nccwpck_require__(427)
  const { MAX_LENGTH, MAX_SAFE_INTEGER } = __nccwpck_require__(2293)
  const { re, t } = __nccwpck_require__(9523)
  
  const parseOptions = __nccwpck_require__(785)
  const { compareIdentifiers } = __nccwpck_require__(2463)
  class SemVer {
    constructor (version, options) {
      options = parseOptions(options)
  
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose &&
            version.includePrerelease === !!options.includePrerelease) {
          return version
        } else {
          version = version.version
        }
      } else if (typeof version !== 'string') {
        throw new TypeError(`Invalid Version: ${version}`)
      }
  
      if (version.length > MAX_LENGTH) {
        throw new TypeError(
          `version is longer than ${MAX_LENGTH} characters`
        )
      }
  
      debug('SemVer', version, options)
      this.options = options
      this.loose = !!options.loose
      // this isn't actually relevant for versions, but keep it so that we
      // don't run into trouble passing this.options around.
      this.includePrerelease = !!options.includePrerelease
  
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])
  
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`)
      }
  
      this.raw = version
  
      // these are actually numbers
      this.major = +m[1]
      this.minor = +m[2]
      this.patch = +m[3]
  
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError('Invalid major version')
      }
  
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError('Invalid minor version')
      }
  
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError('Invalid patch version')
      }
  
      // numberify any prerelease numeric ids
      if (!m[4]) {
        this.prerelease = []
      } else {
        this.prerelease = m[4].split('.').map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num
            }
          }
          return id
        })
      }
  
      this.build = m[5] ? m[5].split('.') : []
      this.format()
    }
  
    format () {
      this.version = `${this.major}.${this.minor}.${this.patch}`
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join('.')}`
      }
      return this.version
    }
  
    toString () {
      return this.version
    }
  
    compare (other) {
      debug('SemVer.compare', this.version, this.options, other)
      if (!(other instanceof SemVer)) {
        if (typeof other === 'string' && other === this.version) {
          return 0
        }
        other = new SemVer(other, this.options)
      }
  
      if (other.version === this.version) {
        return 0
      }
  
      return this.compareMain(other) || this.comparePre(other)
    }
  
    compareMain (other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options)
      }
  
      return (
        compareIdentifiers(this.major, other.major) ||
        compareIdentifiers(this.minor, other.minor) ||
        compareIdentifiers(this.patch, other.patch)
      )
    }
  
    comparePre (other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options)
      }
  
      // NOT having a prerelease is > having one
      if (this.prerelease.length && !other.prerelease.length) {
        return -1
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0
      }
  
      let i = 0
      do {
        const a = this.prerelease[i]
        const b = other.prerelease[i]
        debug('prerelease compare', i, a, b)
        if (a === undefined && b === undefined) {
          return 0
        } else if (b === undefined) {
          return 1
        } else if (a === undefined) {
          return -1
        } else if (a === b) {
          continue
        } else {
          return compareIdentifiers(a, b)
        }
      } while (++i)
    }
  
    compareBuild (other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options)
      }
  
      let i = 0
      do {
        const a = this.build[i]
        const b = other.build[i]
        debug('prerelease compare', i, a, b)
        if (a === undefined && b === undefined) {
          return 0
        } else if (b === undefined) {
          return 1
        } else if (a === undefined) {
          return -1
        } else if (a === b) {
          continue
        } else {
          return compareIdentifiers(a, b)
        }
      } while (++i)
    }
  
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc (release, identifier) {
      switch (release) {
        case 'premajor':
          this.prerelease.length = 0
          this.patch = 0
          this.minor = 0
          this.major++
          this.inc('pre', identifier)
          break
        case 'preminor':
          this.prerelease.length = 0
          this.patch = 0
          this.minor++
          this.inc('pre', identifier)
          break
        case 'prepatch':
          // If this is already a prerelease, it will bump to the next version
          // drop any prereleases that might already exist, since they are not
          // relevant at this point.
          this.prerelease.length = 0
          this.inc('patch', identifier)
          this.inc('pre', identifier)
          break
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case 'prerelease':
          if (this.prerelease.length === 0) {
            this.inc('patch', identifier)
          }
          this.inc('pre', identifier)
          break
  
        case 'major':
          // If this is a pre-major version, bump up to the same major version.
          // Otherwise increment major.
          // 1.0.0-5 bumps to 1.0.0
          // 1.1.0 bumps to 2.0.0
          if (
            this.minor !== 0 ||
            this.patch !== 0 ||
            this.prerelease.length === 0
          ) {
            this.major++
          }
          this.minor = 0
          this.patch = 0
          this.prerelease = []
          break
        case 'minor':
          // If this is a pre-minor version, bump up to the same minor version.
          // Otherwise increment minor.
          // 1.2.0-5 bumps to 1.2.0
          // 1.2.1 bumps to 1.3.0
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++
          }
          this.patch = 0
          this.prerelease = []
          break
        case 'patch':
          // If this is not a pre-release version, it will increment the patch.
          // If it is a pre-release it will bump up to the same patch version.
          // 1.2.0-5 patches to 1.2.0
          // 1.2.0 patches to 1.2.1
          if (this.prerelease.length === 0) {
            this.patch++
          }
          this.prerelease = []
          break
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case 'pre':
          if (this.prerelease.length === 0) {
            this.prerelease = [0]
          } else {
            let i = this.prerelease.length
            while (--i >= 0) {
              if (typeof this.prerelease[i] === 'number') {
                this.prerelease[i]++
                i = -2
              }
            }
            if (i === -1) {
              // didn't increment anything
              this.prerelease.push(0)
            }
          }
          if (identifier) {
            // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
            // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = [identifier, 0]
              }
            } else {
              this.prerelease = [identifier, 0]
            }
          }
          break
  
        default:
          throw new Error(`invalid increment argument: ${release}`)
      }
      this.format()
      this.raw = this.version
      return this
    }
  }
  
  module.exports = SemVer
  
  
  /***/ }),
  
  /***/ 8848:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const parse = __nccwpck_require__(5925)
  const clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ''), options)
    return s ? s.version : null
  }
  module.exports = clean
  
  
  /***/ }),
  
  /***/ 5098:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const eq = __nccwpck_require__(1898)
  const neq = __nccwpck_require__(6017)
  const gt = __nccwpck_require__(4123)
  const gte = __nccwpck_require__(5522)
  const lt = __nccwpck_require__(194)
  const lte = __nccwpck_require__(7520)
  
  const cmp = (a, op, b, loose) => {
    switch (op) {
      case '===':
        if (typeof a === 'object') {
          a = a.version
        }
        if (typeof b === 'object') {
          b = b.version
        }
        return a === b
  
      case '!==':
        if (typeof a === 'object') {
          a = a.version
        }
        if (typeof b === 'object') {
          b = b.version
        }
        return a !== b
  
      case '':
      case '=':
      case '==':
        return eq(a, b, loose)
  
      case '!=':
        return neq(a, b, loose)
  
      case '>':
        return gt(a, b, loose)
  
      case '>=':
        return gte(a, b, loose)
  
      case '<':
        return lt(a, b, loose)
  
      case '<=':
        return lte(a, b, loose)
  
      default:
        throw new TypeError(`Invalid operator: ${op}`)
    }
  }
  module.exports = cmp
  
  
  /***/ }),
  
  /***/ 3466:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const parse = __nccwpck_require__(5925)
  const { re, t } = __nccwpck_require__(9523)
  
  const coerce = (version, options) => {
    if (version instanceof SemVer) {
      return version
    }
  
    if (typeof version === 'number') {
      version = String(version)
    }
  
    if (typeof version !== 'string') {
      return null
    }
  
    options = options || {}
  
    let match = null
    if (!options.rtl) {
      match = version.match(re[t.COERCE])
    } else {
      // Find the right-most coercible string that does not share
      // a terminus with a more left-ward coercible string.
      // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
      //
      // Walk through the string checking with a /g regexp
      // Manually set the index so as to pick up overlapping matches.
      // Stop when we get a match that ends at the string end, since no
      // coercible string can be more right-ward without the same terminus.
      let next
      while ((next = re[t.COERCERTL].exec(version)) &&
          (!match || match.index + match[0].length !== version.length)
      ) {
        if (!match ||
              next.index + next[0].length !== match.index + match[0].length) {
          match = next
        }
        re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
      }
      // leave it in a clean state
      re[t.COERCERTL].lastIndex = -1
    }
  
    if (match === null) {
      return null
    }
  
    return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
  }
  module.exports = coerce
  
  
  /***/ }),
  
  /***/ 2156:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose)
    const versionB = new SemVer(b, loose)
    return versionA.compare(versionB) || versionA.compareBuild(versionB)
  }
  module.exports = compareBuild
  
  
  /***/ }),
  
  /***/ 2804:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const compareLoose = (a, b) => compare(a, b, true)
  module.exports = compareLoose
  
  
  /***/ }),
  
  /***/ 4309:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const compare = (a, b, loose) =>
    new SemVer(a, loose).compare(new SemVer(b, loose))
  
  module.exports = compare
  
  
  /***/ }),
  
  /***/ 4297:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const parse = __nccwpck_require__(5925)
  const eq = __nccwpck_require__(1898)
  
  const diff = (version1, version2) => {
    if (eq(version1, version2)) {
      return null
    } else {
      const v1 = parse(version1)
      const v2 = parse(version2)
      const hasPre = v1.prerelease.length || v2.prerelease.length
      const prefix = hasPre ? 'pre' : ''
      const defaultResult = hasPre ? 'prerelease' : ''
      for (const key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return prefix + key
          }
        }
      }
      return defaultResult // may be undefined
    }
  }
  module.exports = diff
  
  
  /***/ }),
  
  /***/ 1898:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const eq = (a, b, loose) => compare(a, b, loose) === 0
  module.exports = eq
  
  
  /***/ }),
  
  /***/ 4123:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const gt = (a, b, loose) => compare(a, b, loose) > 0
  module.exports = gt
  
  
  /***/ }),
  
  /***/ 5522:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const gte = (a, b, loose) => compare(a, b, loose) >= 0
  module.exports = gte
  
  
  /***/ }),
  
  /***/ 900:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  
  const inc = (version, release, options, identifier) => {
    if (typeof (options) === 'string') {
      identifier = options
      options = undefined
    }
  
    try {
      return new SemVer(
        version instanceof SemVer ? version.version : version,
        options
      ).inc(release, identifier).version
    } catch (er) {
      return null
    }
  }
  module.exports = inc
  
  
  /***/ }),
  
  /***/ 194:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const lt = (a, b, loose) => compare(a, b, loose) < 0
  module.exports = lt
  
  
  /***/ }),
  
  /***/ 7520:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const lte = (a, b, loose) => compare(a, b, loose) <= 0
  module.exports = lte
  
  
  /***/ }),
  
  /***/ 6688:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const major = (a, loose) => new SemVer(a, loose).major
  module.exports = major
  
  
  /***/ }),
  
  /***/ 8447:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const minor = (a, loose) => new SemVer(a, loose).minor
  module.exports = minor
  
  
  /***/ }),
  
  /***/ 6017:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const neq = (a, b, loose) => compare(a, b, loose) !== 0
  module.exports = neq
  
  
  /***/ }),
  
  /***/ 5925:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const { MAX_LENGTH } = __nccwpck_require__(2293)
  const { re, t } = __nccwpck_require__(9523)
  const SemVer = __nccwpck_require__(8088)
  
  const parseOptions = __nccwpck_require__(785)
  const parse = (version, options) => {
    options = parseOptions(options)
  
    if (version instanceof SemVer) {
      return version
    }
  
    if (typeof version !== 'string') {
      return null
    }
  
    if (version.length > MAX_LENGTH) {
      return null
    }
  
    const r = options.loose ? re[t.LOOSE] : re[t.FULL]
    if (!r.test(version)) {
      return null
    }
  
    try {
      return new SemVer(version, options)
    } catch (er) {
      return null
    }
  }
  
  module.exports = parse
  
  
  /***/ }),
  
  /***/ 2866:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const patch = (a, loose) => new SemVer(a, loose).patch
  module.exports = patch
  
  
  /***/ }),
  
  /***/ 4016:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const parse = __nccwpck_require__(5925)
  const prerelease = (version, options) => {
    const parsed = parse(version, options)
    return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
  }
  module.exports = prerelease
  
  
  /***/ }),
  
  /***/ 6417:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compare = __nccwpck_require__(4309)
  const rcompare = (a, b, loose) => compare(b, a, loose)
  module.exports = rcompare
  
  
  /***/ }),
  
  /***/ 8701:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compareBuild = __nccwpck_require__(2156)
  const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
  module.exports = rsort
  
  
  /***/ }),
  
  /***/ 6055:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const Range = __nccwpck_require__(9828)
  const satisfies = (version, range, options) => {
    try {
      range = new Range(range, options)
    } catch (er) {
      return false
    }
    return range.test(version)
  }
  module.exports = satisfies
  
  
  /***/ }),
  
  /***/ 1426:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const compareBuild = __nccwpck_require__(2156)
  const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
  module.exports = sort
  
  
  /***/ }),
  
  /***/ 9601:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const parse = __nccwpck_require__(5925)
  const valid = (version, options) => {
    const v = parse(version, options)
    return v ? v.version : null
  }
  module.exports = valid
  
  
  /***/ }),
  
  /***/ 1383:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  // just pre-load all the stuff that index.js lazily exports
  const internalRe = __nccwpck_require__(9523)
  const constants = __nccwpck_require__(2293)
  const SemVer = __nccwpck_require__(8088)
  const identifiers = __nccwpck_require__(2463)
  const parse = __nccwpck_require__(5925)
  const valid = __nccwpck_require__(9601)
  const clean = __nccwpck_require__(8848)
  const inc = __nccwpck_require__(900)
  const diff = __nccwpck_require__(4297)
  const major = __nccwpck_require__(6688)
  const minor = __nccwpck_require__(8447)
  const patch = __nccwpck_require__(2866)
  const prerelease = __nccwpck_require__(4016)
  const compare = __nccwpck_require__(4309)
  const rcompare = __nccwpck_require__(6417)
  const compareLoose = __nccwpck_require__(2804)
  const compareBuild = __nccwpck_require__(2156)
  const sort = __nccwpck_require__(1426)
  const rsort = __nccwpck_require__(8701)
  const gt = __nccwpck_require__(4123)
  const lt = __nccwpck_require__(194)
  const eq = __nccwpck_require__(1898)
  const neq = __nccwpck_require__(6017)
  const gte = __nccwpck_require__(5522)
  const lte = __nccwpck_require__(7520)
  const cmp = __nccwpck_require__(5098)
  const coerce = __nccwpck_require__(3466)
  const Comparator = __nccwpck_require__(1532)
  const Range = __nccwpck_require__(9828)
  const satisfies = __nccwpck_require__(6055)
  const toComparators = __nccwpck_require__(2706)
  const maxSatisfying = __nccwpck_require__(579)
  const minSatisfying = __nccwpck_require__(832)
  const minVersion = __nccwpck_require__(4179)
  const validRange = __nccwpck_require__(2098)
  const outside = __nccwpck_require__(420)
  const gtr = __nccwpck_require__(9380)
  const ltr = __nccwpck_require__(3323)
  const intersects = __nccwpck_require__(7008)
  const simplifyRange = __nccwpck_require__(5297)
  const subset = __nccwpck_require__(7863)
  module.exports = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers,
  }
  
  
  /***/ }),
  
  /***/ 2293:
  /***/ ((module) => {
  
  // Note: this is the semver.org version of the spec that it implements
  // Not necessarily the package version of this code.
  const SEMVER_SPEC_VERSION = '2.0.0'
  
  const MAX_LENGTH = 256
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991
  
  // Max safe segment length for coercion.
  const MAX_SAFE_COMPONENT_LENGTH = 16
  
  module.exports = {
    SEMVER_SPEC_VERSION,
    MAX_LENGTH,
    MAX_SAFE_INTEGER,
    MAX_SAFE_COMPONENT_LENGTH,
  }
  
  
  /***/ }),
  
  /***/ 427:
  /***/ ((module) => {
  
  const debug = (
    typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)
  ) ? (...args) => console.error('SEMVER', ...args)
    : () => {}
  
  module.exports = debug
  
  
  /***/ }),
  
  /***/ 2463:
  /***/ ((module) => {
  
  const numeric = /^[0-9]+$/
  const compareIdentifiers = (a, b) => {
    const anum = numeric.test(a)
    const bnum = numeric.test(b)
  
    if (anum && bnum) {
      a = +a
      b = +b
    }
  
    return a === b ? 0
      : (anum && !bnum) ? -1
      : (bnum && !anum) ? 1
      : a < b ? -1
      : 1
  }
  
  const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)
  
  module.exports = {
    compareIdentifiers,
    rcompareIdentifiers,
  }
  
  
  /***/ }),
  
  /***/ 785:
  /***/ ((module) => {
  
  // parse out just the options we care about so we always get a consistent
  // obj with keys in a consistent order.
  const opts = ['includePrerelease', 'loose', 'rtl']
  const parseOptions = options =>
    !options ? {}
    : typeof options !== 'object' ? { loose: true }
    : opts.filter(k => options[k]).reduce((o, k) => {
      o[k] = true
      return o
    }, {})
  module.exports = parseOptions
  
  
  /***/ }),
  
  /***/ 9523:
  /***/ ((module, exports, __nccwpck_require__) => {
  
  const { MAX_SAFE_COMPONENT_LENGTH } = __nccwpck_require__(2293)
  const debug = __nccwpck_require__(427)
  exports = module.exports = {}
  
  // The actual regexps go on exports.re
  const re = exports.re = []
  const src = exports.src = []
  const t = exports.t = {}
  let R = 0
  
  const createToken = (name, value, isGlobal) => {
    const index = R++
    debug(name, index, value)
    t[name] = index
    src[index] = value
    re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
  }
  
  // The following Regular Expressions can be used for tokenizing,
  // validating, and parsing SemVer version strings.
  
  // ## Numeric Identifier
  // A single `0`, or a non-zero digit followed by zero or more digits.
  
  createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
  createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+')
  
  // ## Non-numeric Identifier
  // Zero or more digits, followed by a letter or hyphen, and then zero or
  // more letters, digits, or hyphens.
  
  createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*')
  
  // ## Main Version
  // Three dot-separated numeric identifiers.
  
  createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                     `(${src[t.NUMERICIDENTIFIER]})\\.` +
                     `(${src[t.NUMERICIDENTIFIER]})`)
  
  createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                          `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                          `(${src[t.NUMERICIDENTIFIERLOOSE]})`)
  
  // ## Pre-release Version Identifier
  // A numeric identifier, or a non-numeric identifier.
  
  createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
  }|${src[t.NONNUMERICIDENTIFIER]})`)
  
  createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
  }|${src[t.NONNUMERICIDENTIFIER]})`)
  
  // ## Pre-release Version
  // Hyphen, followed by one or more dot-separated pre-release version
  // identifiers.
  
  createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
  }(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)
  
  createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
  }(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)
  
  // ## Build Metadata Identifier
  // Any combination of digits, letters, or hyphens.
  
  createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+')
  
  // ## Build Metadata
  // Plus sign, followed by one or more period-separated build metadata
  // identifiers.
  
  createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
  }(?:\\.${src[t.BUILDIDENTIFIER]})*))`)
  
  // ## Full Version String
  // A main version, followed optionally by a pre-release version and
  // build metadata.
  
  // Note that the only major, minor, patch, and pre-release sections of
  // the version string are capturing groups.  The build metadata is not a
  // capturing group, because it should not ever be used in version
  // comparison.
  
  createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
  }${src[t.PRERELEASE]}?${
    src[t.BUILD]}?`)
  
  createToken('FULL', `^${src[t.FULLPLAIN]}$`)
  
  // like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
  // also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
  // common in the npm registry.
  createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
  }${src[t.PRERELEASELOOSE]}?${
    src[t.BUILD]}?`)
  
  createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)
  
  createToken('GTLT', '((?:<|>)?=?)')
  
  // Something like "2.*" or "1.2.x".
  // Note that "x.x" is a valid xRange identifer, meaning "any version"
  // Only the first item is strictly required.
  createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
  createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)
  
  createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                     `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                     `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                     `(?:${src[t.PRERELEASE]})?${
                       src[t.BUILD]}?` +
                     `)?)?`)
  
  createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                          `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                          `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                          `(?:${src[t.PRERELEASELOOSE]})?${
                            src[t.BUILD]}?` +
                          `)?)?`)
  
  createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
  createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)
  
  // Coercion.
  // Extract anything that could conceivably be a part of a valid semver
  createToken('COERCE', `${'(^|[^\\d])' +
                '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
                `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
                `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
                `(?:$|[^\\d])`)
  createToken('COERCERTL', src[t.COERCE], true)
  
  // Tilde ranges.
  // Meaning is "reasonably at or greater than"
  createToken('LONETILDE', '(?:~>?)')
  
  createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
  exports.tildeTrimReplace = '$1~'
  
  createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
  createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)
  
  // Caret ranges.
  // Meaning is "at least and backwards compatible with"
  createToken('LONECARET', '(?:\\^)')
  
  createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
  exports.caretTrimReplace = '$1^'
  
  createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
  createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)
  
  // A simple gt/lt/eq thing, or just "" to indicate "any version"
  createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
  createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)
  
  // An expression to strip any whitespace between the gtlt and the thing
  // it modifies, so that `> 1.2.3` ==> `>1.2.3`
  createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
  }\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
  exports.comparatorTrimReplace = '$1$2$3'
  
  // Something like `1.2.3 - 1.2.4`
  // Note that these all use the loose form, because they'll be
  // checked against either the strict or loose comparator form
  // later.
  createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                     `\\s+-\\s+` +
                     `(${src[t.XRANGEPLAIN]})` +
                     `\\s*$`)
  
  createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                          `\\s+-\\s+` +
                          `(${src[t.XRANGEPLAINLOOSE]})` +
                          `\\s*$`)
  
  // Star ranges basically just allow anything at all.
  createToken('STAR', '(<|>)?=?\\s*\\*')
  // >=0.0.0 is like a star
  createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$')
  createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$')
  
  
  /***/ }),
  
  /***/ 9380:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  // Determine if version is greater than all the versions possible in the range.
  const outside = __nccwpck_require__(420)
  const gtr = (version, range, options) => outside(version, range, '>', options)
  module.exports = gtr
  
  
  /***/ }),
  
  /***/ 7008:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const Range = __nccwpck_require__(9828)
  const intersects = (r1, r2, options) => {
    r1 = new Range(r1, options)
    r2 = new Range(r2, options)
    return r1.intersects(r2)
  }
  module.exports = intersects
  
  
  /***/ }),
  
  /***/ 3323:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const outside = __nccwpck_require__(420)
  // Determine if version is less than all the versions possible in the range
  const ltr = (version, range, options) => outside(version, range, '<', options)
  module.exports = ltr
  
  
  /***/ }),
  
  /***/ 579:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const Range = __nccwpck_require__(9828)
  
  const maxSatisfying = (versions, range, options) => {
    let max = null
    let maxSV = null
    let rangeObj = null
    try {
      rangeObj = new Range(range, options)
    } catch (er) {
      return null
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        // satisfies(v, range, options)
        if (!max || maxSV.compare(v) === -1) {
          // compare(max, v, true)
          max = v
          maxSV = new SemVer(max, options)
        }
      }
    })
    return max
  }
  module.exports = maxSatisfying
  
  
  /***/ }),
  
  /***/ 832:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const Range = __nccwpck_require__(9828)
  const minSatisfying = (versions, range, options) => {
    let min = null
    let minSV = null
    let rangeObj = null
    try {
      rangeObj = new Range(range, options)
    } catch (er) {
      return null
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        // satisfies(v, range, options)
        if (!min || minSV.compare(v) === 1) {
          // compare(min, v, true)
          min = v
          minSV = new SemVer(min, options)
        }
      }
    })
    return min
  }
  module.exports = minSatisfying
  
  
  /***/ }),
  
  /***/ 4179:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const Range = __nccwpck_require__(9828)
  const gt = __nccwpck_require__(4123)
  
  const minVersion = (range, loose) => {
    range = new Range(range, loose)
  
    let minver = new SemVer('0.0.0')
    if (range.test(minver)) {
      return minver
    }
  
    minver = new SemVer('0.0.0-0')
    if (range.test(minver)) {
      return minver
    }
  
    minver = null
    for (let i = 0; i < range.set.length; ++i) {
      const comparators = range.set[i]
  
      let setMin = null
      comparators.forEach((comparator) => {
        // Clone to avoid manipulating the comparator's semver object.
        const compver = new SemVer(comparator.semver.version)
        switch (comparator.operator) {
          case '>':
            if (compver.prerelease.length === 0) {
              compver.patch++
            } else {
              compver.prerelease.push(0)
            }
            compver.raw = compver.format()
            /* fallthrough */
          case '':
          case '>=':
            if (!setMin || gt(compver, setMin)) {
              setMin = compver
            }
            break
          case '<':
          case '<=':
            /* Ignore maximum versions */
            break
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${comparator.operator}`)
        }
      })
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin
      }
    }
  
    if (minver && range.test(minver)) {
      return minver
    }
  
    return null
  }
  module.exports = minVersion
  
  
  /***/ }),
  
  /***/ 420:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const SemVer = __nccwpck_require__(8088)
  const Comparator = __nccwpck_require__(1532)
  const { ANY } = Comparator
  const Range = __nccwpck_require__(9828)
  const satisfies = __nccwpck_require__(6055)
  const gt = __nccwpck_require__(4123)
  const lt = __nccwpck_require__(194)
  const lte = __nccwpck_require__(7520)
  const gte = __nccwpck_require__(5522)
  
  const outside = (version, range, hilo, options) => {
    version = new SemVer(version, options)
    range = new Range(range, options)
  
    let gtfn, ltefn, ltfn, comp, ecomp
    switch (hilo) {
      case '>':
        gtfn = gt
        ltefn = lte
        ltfn = lt
        comp = '>'
        ecomp = '>='
        break
      case '<':
        gtfn = lt
        ltefn = gte
        ltfn = gt
        comp = '<'
        ecomp = '<='
        break
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"')
    }
  
    // If it satisfies the range it is not outside
    if (satisfies(version, range, options)) {
      return false
    }
  
    // From now on, variable terms are as if we're in "gtr" mode.
    // but note that everything is flipped for the "ltr" function.
  
    for (let i = 0; i < range.set.length; ++i) {
      const comparators = range.set[i]
  
      let high = null
      let low = null
  
      comparators.forEach((comparator) => {
        if (comparator.semver === ANY) {
          comparator = new Comparator('>=0.0.0')
        }
        high = high || comparator
        low = low || comparator
        if (gtfn(comparator.semver, high.semver, options)) {
          high = comparator
        } else if (ltfn(comparator.semver, low.semver, options)) {
          low = comparator
        }
      })
  
      // If the edge version comparator has a operator then our version
      // isn't outside it
      if (high.operator === comp || high.operator === ecomp) {
        return false
      }
  
      // If the lowest version comparator has an operator and our version
      // is less than it then it isn't higher than the range
      if ((!low.operator || low.operator === comp) &&
          ltefn(version, low.semver)) {
        return false
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false
      }
    }
    return true
  }
  
  module.exports = outside
  
  
  /***/ }),
  
  /***/ 5297:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  // given a set of versions and a range, create a "simplified" range
  // that includes the same versions that the original range does
  // If the original range is shorter than the simplified one, return that.
  const satisfies = __nccwpck_require__(6055)
  const compare = __nccwpck_require__(4309)
  module.exports = (versions, range, options) => {
    const set = []
    let first = null
    let prev = null
    const v = versions.sort((a, b) => compare(a, b, options))
    for (const version of v) {
      const included = satisfies(version, range, options)
      if (included) {
        prev = version
        if (!first) {
          first = version
        }
      } else {
        if (prev) {
          set.push([first, prev])
        }
        prev = null
        first = null
      }
    }
    if (first) {
      set.push([first, null])
    }
  
    const ranges = []
    for (const [min, max] of set) {
      if (min === max) {
        ranges.push(min)
      } else if (!max && min === v[0]) {
        ranges.push('*')
      } else if (!max) {
        ranges.push(`>=${min}`)
      } else if (min === v[0]) {
        ranges.push(`<=${max}`)
      } else {
        ranges.push(`${min} - ${max}`)
      }
    }
    const simplified = ranges.join(' || ')
    const original = typeof range.raw === 'string' ? range.raw : String(range)
    return simplified.length < original.length ? simplified : range
  }
  
  
  /***/ }),
  
  /***/ 7863:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const Range = __nccwpck_require__(9828)
  const Comparator = __nccwpck_require__(1532)
  const { ANY } = Comparator
  const satisfies = __nccwpck_require__(6055)
  const compare = __nccwpck_require__(4309)
  
  // Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
  // - Every simple range `r1, r2, ...` is a null set, OR
  // - Every simple range `r1, r2, ...` which is not a null set is a subset of
  //   some `R1, R2, ...`
  //
  // Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
  // - If c is only the ANY comparator
  //   - If C is only the ANY comparator, return true
  //   - Else if in prerelease mode, return false
  //   - else replace c with `[>=0.0.0]`
  // - If C is only the ANY comparator
  //   - if in prerelease mode, return true
  //   - else replace C with `[>=0.0.0]`
  // - Let EQ be the set of = comparators in c
  // - If EQ is more than one, return true (null set)
  // - Let GT be the highest > or >= comparator in c
  // - Let LT be the lowest < or <= comparator in c
  // - If GT and LT, and GT.semver > LT.semver, return true (null set)
  // - If any C is a = range, and GT or LT are set, return false
  // - If EQ
  //   - If GT, and EQ does not satisfy GT, return true (null set)
  //   - If LT, and EQ does not satisfy LT, return true (null set)
  //   - If EQ satisfies every C, return true
  //   - Else return false
  // - If GT
  //   - If GT.semver is lower than any > or >= comp in C, return false
  //   - If GT is >=, and GT.semver does not satisfy every C, return false
  //   - If GT.semver has a prerelease, and not in prerelease mode
  //     - If no C has a prerelease and the GT.semver tuple, return false
  // - If LT
  //   - If LT.semver is greater than any < or <= comp in C, return false
  //   - If LT is <=, and LT.semver does not satisfy every C, return false
  //   - If GT.semver has a prerelease, and not in prerelease mode
  //     - If no C has a prerelease and the LT.semver tuple, return false
  // - Else return true
  
  const subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true
    }
  
    sub = new Range(sub, options)
    dom = new Range(dom, options)
    let sawNonNull = false
  
    OUTER: for (const simpleSub of sub.set) {
      for (const simpleDom of dom.set) {
        const isSub = simpleSubset(simpleSub, simpleDom, options)
        sawNonNull = sawNonNull || isSub !== null
        if (isSub) {
          continue OUTER
        }
      }
      // the null set is a subset of everything, but null simple ranges in
      // a complex range should be ignored.  so if we saw a non-null range,
      // then we know this isn't a subset, but if EVERY simple range was null,
      // then it is a subset.
      if (sawNonNull) {
        return false
      }
    }
    return true
  }
  
  const simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true
    }
  
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true
      } else if (options.includePrerelease) {
        sub = [new Comparator('>=0.0.0-0')]
      } else {
        sub = [new Comparator('>=0.0.0')]
      }
    }
  
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true
      } else {
        dom = [new Comparator('>=0.0.0')]
      }
    }
  
    const eqSet = new Set()
    let gt, lt
    for (const c of sub) {
      if (c.operator === '>' || c.operator === '>=') {
        gt = higherGT(gt, c, options)
      } else if (c.operator === '<' || c.operator === '<=') {
        lt = lowerLT(lt, c, options)
      } else {
        eqSet.add(c.semver)
      }
    }
  
    if (eqSet.size > 1) {
      return null
    }
  
    let gtltComp
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options)
      if (gtltComp > 0) {
        return null
      } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
        return null
      }
    }
  
    // will iterate one or zero times
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null
      }
  
      if (lt && !satisfies(eq, String(lt), options)) {
        return null
      }
  
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false
        }
      }
  
      return true
    }
  
    let higher, lower
    let hasDomLT, hasDomGT
    // if the subset has a prerelease, we need a comparator in the superset
    // with the same tuple and a prerelease, or it's not a subset
    let needDomLTPre = lt &&
      !options.includePrerelease &&
      lt.semver.prerelease.length ? lt.semver : false
    let needDomGTPre = gt &&
      !options.includePrerelease &&
      gt.semver.prerelease.length ? gt.semver : false
    // exception: <1.2.3-0 is the same as <1.2.3
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
        lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false
    }
  
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='
      hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length &&
              c.semver.major === needDomGTPre.major &&
              c.semver.minor === needDomGTPre.minor &&
              c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false
          }
        }
        if (c.operator === '>' || c.operator === '>=') {
          higher = higherGT(gt, c, options)
          if (higher === c && higher !== gt) {
            return false
          }
        } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
          return false
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length &&
              c.semver.major === needDomLTPre.major &&
              c.semver.minor === needDomLTPre.minor &&
              c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false
          }
        }
        if (c.operator === '<' || c.operator === '<=') {
          lower = lowerLT(lt, c, options)
          if (lower === c && lower !== lt) {
            return false
          }
        } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
          return false
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false
      }
    }
  
    // if there was a < or >, and nothing in the dom, then must be false
    // UNLESS it was limited by another range in the other direction.
    // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false
    }
  
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false
    }
  
    // we needed a prerelease range in a specific tuple, but didn't get one
    // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
    // because it includes prereleases in the 1.2.3 tuple
    if (needDomGTPre || needDomLTPre) {
      return false
    }
  
    return true
  }
  
  // >=1.2.3 is lower than >1.2.3
  const higherGT = (a, b, options) => {
    if (!a) {
      return b
    }
    const comp = compare(a.semver, b.semver, options)
    return comp > 0 ? a
      : comp < 0 ? b
      : b.operator === '>' && a.operator === '>=' ? b
      : a
  }
  
  // <=1.2.3 is higher than <1.2.3
  const lowerLT = (a, b, options) => {
    if (!a) {
      return b
    }
    const comp = compare(a.semver, b.semver, options)
    return comp < 0 ? a
      : comp > 0 ? b
      : b.operator === '<' && a.operator === '<=' ? b
      : a
  }
  
  module.exports = subset
  
  
  /***/ }),
  
  /***/ 2706:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const Range = __nccwpck_require__(9828)
  
  // Mostly just for testing and legacy API reasons
  const toComparators = (range, options) =>
    new Range(range, options).set
      .map(comp => comp.map(c => c.value).join(' ').trim().split(' '))
  
  module.exports = toComparators
  
  
  /***/ }),
  
  /***/ 2098:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  const Range = __nccwpck_require__(9828)
  const validRange = (range, options) => {
    try {
      // Return '*' instead of '' so that truthiness works.
      // This will throw if it's invalid anyway
      return new Range(range, options).range || '*'
    } catch (er) {
      return null
    }
  }
  module.exports = validRange
  
  
  /***/ }),
  
  /***/ 4294:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  module.exports = __nccwpck_require__(4219);
  
  
  /***/ }),
  
  /***/ 4219:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  var net = __nccwpck_require__(1808);
  var tls = __nccwpck_require__(4404);
  var http = __nccwpck_require__(3685);
  var https = __nccwpck_require__(5687);
  var events = __nccwpck_require__(2361);
  var assert = __nccwpck_require__(9491);
  var util = __nccwpck_require__(3837);
  
  
  exports.httpOverHttp = httpOverHttp;
  exports.httpsOverHttp = httpsOverHttp;
  exports.httpOverHttps = httpOverHttps;
  exports.httpsOverHttps = httpsOverHttps;
  
  
  function httpOverHttp(options) {
    var agent = new TunnelingAgent(options);
    agent.request = http.request;
    return agent;
  }
  
  function httpsOverHttp(options) {
    var agent = new TunnelingAgent(options);
    agent.request = http.request;
    agent.createSocket = createSecureSocket;
    agent.defaultPort = 443;
    return agent;
  }
  
  function httpOverHttps(options) {
    var agent = new TunnelingAgent(options);
    agent.request = https.request;
    return agent;
  }
  
  function httpsOverHttps(options) {
    var agent = new TunnelingAgent(options);
    agent.request = https.request;
    agent.createSocket = createSecureSocket;
    agent.defaultPort = 443;
    return agent;
  }
  
  
  function TunnelingAgent(options) {
    var self = this;
    self.options = options || {};
    self.proxyOptions = self.options.proxy || {};
    self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
    self.requests = [];
    self.sockets = [];
  
    self.on('free', function onFree(socket, host, port, localAddress) {
      var options = toOptions(host, port, localAddress);
      for (var i = 0, len = self.requests.length; i < len; ++i) {
        var pending = self.requests[i];
        if (pending.host === options.host && pending.port === options.port) {
          // Detect the request to connect same origin server,
          // reuse the connection.
          self.requests.splice(i, 1);
          pending.request.onSocket(socket);
          return;
        }
      }
      socket.destroy();
      self.removeSocket(socket);
    });
  }
  util.inherits(TunnelingAgent, events.EventEmitter);
  
  TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
    var self = this;
    var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));
  
    if (self.sockets.length >= this.maxSockets) {
      // We are over limit so we'll add it to the queue.
      self.requests.push(options);
      return;
    }
  
    // If we are under maxSockets create a new one.
    self.createSocket(options, function(socket) {
      socket.on('free', onFree);
      socket.on('close', onCloseOrRemove);
      socket.on('agentRemove', onCloseOrRemove);
      req.onSocket(socket);
  
      function onFree() {
        self.emit('free', socket, options);
      }
  
      function onCloseOrRemove(err) {
        self.removeSocket(socket);
        socket.removeListener('free', onFree);
        socket.removeListener('close', onCloseOrRemove);
        socket.removeListener('agentRemove', onCloseOrRemove);
      }
    });
  };
  
  TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
    var self = this;
    var placeholder = {};
    self.sockets.push(placeholder);
  
    var connectOptions = mergeOptions({}, self.proxyOptions, {
      method: 'CONNECT',
      path: options.host + ':' + options.port,
      agent: false,
      headers: {
        host: options.host + ':' + options.port
      }
    });
    if (options.localAddress) {
      connectOptions.localAddress = options.localAddress;
    }
    if (connectOptions.proxyAuth) {
      connectOptions.headers = connectOptions.headers || {};
      connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
          new Buffer(connectOptions.proxyAuth).toString('base64');
    }
  
    debug('making CONNECT request');
    var connectReq = self.request(connectOptions);
    connectReq.useChunkedEncodingByDefault = false; // for v0.6
    connectReq.once('response', onResponse); // for v0.6
    connectReq.once('upgrade', onUpgrade);   // for v0.6
    connectReq.once('connect', onConnect);   // for v0.7 or later
    connectReq.once('error', onError);
    connectReq.end();
  
    function onResponse(res) {
      // Very hacky. This is necessary to avoid http-parser leaks.
      res.upgrade = true;
    }
  
    function onUpgrade(res, socket, head) {
      // Hacky.
      process.nextTick(function() {
        onConnect(res, socket, head);
      });
    }
  
    function onConnect(res, socket, head) {
      connectReq.removeAllListeners();
      socket.removeAllListeners();
  
      if (res.statusCode !== 200) {
        debug('tunneling socket could not be established, statusCode=%d',
          res.statusCode);
        socket.destroy();
        var error = new Error('tunneling socket could not be established, ' +
          'statusCode=' + res.statusCode);
        error.code = 'ECONNRESET';
        options.request.emit('error', error);
        self.removeSocket(placeholder);
        return;
      }
      if (head.length > 0) {
        debug('got illegal response body from proxy');
        socket.destroy();
        var error = new Error('got illegal response body from proxy');
        error.code = 'ECONNRESET';
        options.request.emit('error', error);
        self.removeSocket(placeholder);
        return;
      }
      debug('tunneling connection has established');
      self.sockets[self.sockets.indexOf(placeholder)] = socket;
      return cb(socket);
    }
  
    function onError(cause) {
      connectReq.removeAllListeners();
  
      debug('tunneling socket could not be established, cause=%s\n',
            cause.message, cause.stack);
      var error = new Error('tunneling socket could not be established, ' +
                            'cause=' + cause.message);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
    }
  };
  
  TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
    var pos = this.sockets.indexOf(socket)
    if (pos === -1) {
      return;
    }
    this.sockets.splice(pos, 1);
  
    var pending = this.requests.shift();
    if (pending) {
      // If we have pending requests and a socket gets closed a new one
      // needs to be created to take over in the pool for the one that closed.
      this.createSocket(pending, function(socket) {
        pending.request.onSocket(socket);
      });
    }
  };
  
  function createSecureSocket(options, cb) {
    var self = this;
    TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
      var hostHeader = options.request.getHeader('host');
      var tlsOptions = mergeOptions({}, self.options, {
        socket: socket,
        servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
      });
  
      // 0 is dummy port for v0.6
      var secureSocket = tls.connect(0, tlsOptions);
      self.sockets[self.sockets.indexOf(socket)] = secureSocket;
      cb(secureSocket);
    });
  }
  
  
  function toOptions(host, port, localAddress) {
    if (typeof host === 'string') { // since v0.10
      return {
        host: host,
        port: port,
        localAddress: localAddress
      };
    }
    return host; // for v0.11 or later
  }
  
  function mergeOptions(target) {
    for (var i = 1, len = arguments.length; i < len; ++i) {
      var overrides = arguments[i];
      if (typeof overrides === 'object') {
        var keys = Object.keys(overrides);
        for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
          var k = keys[j];
          if (overrides[k] !== undefined) {
            target[k] = overrides[k];
          }
        }
      }
    }
    return target;
  }
  
  
  var debug;
  if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
    debug = function() {
      var args = Array.prototype.slice.call(arguments);
      if (typeof args[0] === 'string') {
        args[0] = 'TUNNEL: ' + args[0];
      } else {
        args.unshift('TUNNEL:');
      }
      console.error.apply(console, args);
    }
  } else {
    debug = function() {};
  }
  exports.debug = debug; // for test
  
  
  /***/ }),
  
  /***/ 5840:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  Object.defineProperty(exports, "v1", ({
    enumerable: true,
    get: function () {
      return _v.default;
    }
  }));
  Object.defineProperty(exports, "v3", ({
    enumerable: true,
    get: function () {
      return _v2.default;
    }
  }));
  Object.defineProperty(exports, "v4", ({
    enumerable: true,
    get: function () {
      return _v3.default;
    }
  }));
  Object.defineProperty(exports, "v5", ({
    enumerable: true,
    get: function () {
      return _v4.default;
    }
  }));
  Object.defineProperty(exports, "NIL", ({
    enumerable: true,
    get: function () {
      return _nil.default;
    }
  }));
  Object.defineProperty(exports, "version", ({
    enumerable: true,
    get: function () {
      return _version.default;
    }
  }));
  Object.defineProperty(exports, "validate", ({
    enumerable: true,
    get: function () {
      return _validate.default;
    }
  }));
  Object.defineProperty(exports, "stringify", ({
    enumerable: true,
    get: function () {
      return _stringify.default;
    }
  }));
  Object.defineProperty(exports, "parse", ({
    enumerable: true,
    get: function () {
      return _parse.default;
    }
  }));
  
  var _v = _interopRequireDefault(__nccwpck_require__(8628));
  
  var _v2 = _interopRequireDefault(__nccwpck_require__(6409));
  
  var _v3 = _interopRequireDefault(__nccwpck_require__(5122));
  
  var _v4 = _interopRequireDefault(__nccwpck_require__(9120));
  
  var _nil = _interopRequireDefault(__nccwpck_require__(5332));
  
  var _version = _interopRequireDefault(__nccwpck_require__(1595));
  
  var _validate = _interopRequireDefault(__nccwpck_require__(6900));
  
  var _stringify = _interopRequireDefault(__nccwpck_require__(8950));
  
  var _parse = _interopRequireDefault(__nccwpck_require__(2746));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /***/ }),
  
  /***/ 4569:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _crypto = _interopRequireDefault(__nccwpck_require__(6113));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function md5(bytes) {
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === 'string') {
      bytes = Buffer.from(bytes, 'utf8');
    }
  
    return _crypto.default.createHash('md5').update(bytes).digest();
  }
  
  var _default = md5;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 5332:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  var _default = '00000000-0000-0000-0000-000000000000';
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 2746:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _validate = _interopRequireDefault(__nccwpck_require__(6900));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function parse(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError('Invalid UUID');
    }
  
    let v;
    const arr = new Uint8Array(16); // Parse ########-....-....-....-............
  
    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    arr[1] = v >>> 16 & 0xff;
    arr[2] = v >>> 8 & 0xff;
    arr[3] = v & 0xff; // Parse ........-####-....-....-............
  
    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    arr[5] = v & 0xff; // Parse ........-....-####-....-............
  
    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    arr[7] = v & 0xff; // Parse ........-....-....-####-............
  
    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    arr[9] = v & 0xff; // Parse ........-....-....-....-############
    // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
  
    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
    arr[11] = v / 0x100000000 & 0xff;
    arr[12] = v >>> 24 & 0xff;
    arr[13] = v >>> 16 & 0xff;
    arr[14] = v >>> 8 & 0xff;
    arr[15] = v & 0xff;
    return arr;
  }
  
  var _default = parse;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 814:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 807:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = rng;
  
  var _crypto = _interopRequireDefault(__nccwpck_require__(6113));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate
  
  let poolPtr = rnds8Pool.length;
  
  function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
      _crypto.default.randomFillSync(rnds8Pool);
  
      poolPtr = 0;
    }
  
    return rnds8Pool.slice(poolPtr, poolPtr += 16);
  }
  
  /***/ }),
  
  /***/ 5274:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _crypto = _interopRequireDefault(__nccwpck_require__(6113));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function sha1(bytes) {
    if (Array.isArray(bytes)) {
      bytes = Buffer.from(bytes);
    } else if (typeof bytes === 'string') {
      bytes = Buffer.from(bytes, 'utf8');
    }
  
    return _crypto.default.createHash('sha1').update(bytes).digest();
  }
  
  var _default = sha1;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 8950:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _validate = _interopRequireDefault(__nccwpck_require__(6900));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */
  const byteToHex = [];
  
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
  }
  
  function stringify(arr, offset = 0) {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
    // of the following:
    // - One or more input array values don't map to a hex octet (leading to
    // "undefined" in the uuid)
    // - Invalid input values for the RFC `version` or `variant` fields
  
    if (!(0, _validate.default)(uuid)) {
      throw TypeError('Stringified UUID is invalid');
    }
  
    return uuid;
  }
  
  var _default = stringify;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 8628:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _rng = _interopRequireDefault(__nccwpck_require__(807));
  
  var _stringify = _interopRequireDefault(__nccwpck_require__(8950));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html
  let _nodeId;
  
  let _clockseq; // Previous uuid creation time
  
  
  let _lastMSecs = 0;
  let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details
  
  function v1(options, buf, offset) {
    let i = buf && offset || 0;
    const b = buf || new Array(16);
    options = options || {};
    let node = options.node || _nodeId;
    let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
    // specified.  We do this lazily to minimize issues related to insufficient
    // system entropy.  See #189
  
    if (node == null || clockseq == null) {
      const seedBytes = options.random || (options.rng || _rng.default)();
  
      if (node == null) {
        // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
        node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      }
  
      if (clockseq == null) {
        // Per 4.2.2, randomize (14 bit) clockseq
        clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
      }
    } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  
  
    let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
  
    let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)
  
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression
  
    if (dt < 0 && options.clockseq === undefined) {
      clockseq = clockseq + 1 & 0x3fff;
    } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
  
  
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    } // Per 4.2.1.2 Throw error if too many uuids are requested
  
  
    if (nsecs >= 10000) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
  
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  
    msecs += 12219292800000; // `time_low`
  
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff; // `time_mid`
  
    const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff; // `time_high_and_version`
  
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  
    b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  
    b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`
  
    b[i++] = clockseq & 0xff; // `node`
  
    for (let n = 0; n < 6; ++n) {
      b[i + n] = node[n];
    }
  
    return buf || (0, _stringify.default)(b);
  }
  
  var _default = v1;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 6409:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _v = _interopRequireDefault(__nccwpck_require__(5998));
  
  var _md = _interopRequireDefault(__nccwpck_require__(4569));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  const v3 = (0, _v.default)('v3', 0x30, _md.default);
  var _default = v3;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 5998:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = _default;
  exports.URL = exports.DNS = void 0;
  
  var _stringify = _interopRequireDefault(__nccwpck_require__(8950));
  
  var _parse = _interopRequireDefault(__nccwpck_require__(2746));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function stringToBytes(str) {
    str = unescape(encodeURIComponent(str)); // UTF8 escape
  
    const bytes = [];
  
    for (let i = 0; i < str.length; ++i) {
      bytes.push(str.charCodeAt(i));
    }
  
    return bytes;
  }
  
  const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  exports.DNS = DNS;
  const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  exports.URL = URL;
  
  function _default(name, version, hashfunc) {
    function generateUUID(value, namespace, buf, offset) {
      if (typeof value === 'string') {
        value = stringToBytes(value);
      }
  
      if (typeof namespace === 'string') {
        namespace = (0, _parse.default)(namespace);
      }
  
      if (namespace.length !== 16) {
        throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
      } // Compute hash of namespace and value, Per 4.3
      // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
      // hashfunc([...namespace, ... value])`
  
  
      let bytes = new Uint8Array(16 + value.length);
      bytes.set(namespace);
      bytes.set(value, namespace.length);
      bytes = hashfunc(bytes);
      bytes[6] = bytes[6] & 0x0f | version;
      bytes[8] = bytes[8] & 0x3f | 0x80;
  
      if (buf) {
        offset = offset || 0;
  
        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = bytes[i];
        }
  
        return buf;
      }
  
      return (0, _stringify.default)(bytes);
    } // Function#name is not settable on some platforms (#270)
  
  
    try {
      generateUUID.name = name; // eslint-disable-next-line no-empty
    } catch (err) {} // For CommonJS default export support
  
  
    generateUUID.DNS = DNS;
    generateUUID.URL = URL;
    return generateUUID;
  }
  
  /***/ }),
  
  /***/ 5122:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _rng = _interopRequireDefault(__nccwpck_require__(807));
  
  var _stringify = _interopRequireDefault(__nccwpck_require__(8950));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function v4(options, buf, offset) {
    options = options || {};
  
    const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  
  
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided
  
    if (buf) {
      offset = offset || 0;
  
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
  
      return buf;
    }
  
    return (0, _stringify.default)(rnds);
  }
  
  var _default = v4;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 9120:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _v = _interopRequireDefault(__nccwpck_require__(5998));
  
  var _sha = _interopRequireDefault(__nccwpck_require__(5274));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  const v5 = (0, _v.default)('v5', 0x50, _sha.default);
  var _default = v5;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 6900:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _regex = _interopRequireDefault(__nccwpck_require__(814));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function validate(uuid) {
    return typeof uuid === 'string' && _regex.default.test(uuid);
  }
  
  var _default = validate;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 1595:
  /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
  
  "use strict";
  
  
  Object.defineProperty(exports, "__esModule", ({
    value: true
  }));
  exports["default"] = void 0;
  
  var _validate = _interopRequireDefault(__nccwpck_require__(6900));
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function version(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError('Invalid UUID');
    }
  
    return parseInt(uuid.substr(14, 1), 16);
  }
  
  var _default = version;
  exports["default"] = _default;
  
  /***/ }),
  
  /***/ 2839:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    module.exports = {
      Disconnected: 1,
      Preceding: 2,
      Following: 4,
      Contains: 8,
      ContainedBy: 16,
      ImplementationSpecific: 32
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 9267:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    module.exports = {
      Element: 1,
      Attribute: 2,
      Text: 3,
      CData: 4,
      EntityReference: 5,
      EntityDeclaration: 6,
      ProcessingInstruction: 7,
      Comment: 8,
      Document: 9,
      DocType: 10,
      DocumentFragment: 11,
      NotationDeclaration: 12,
      // Numeric codes up to 200 are reserved to W3C for possible future use.
      // Following are types internal to this library:
      Declaration: 201,
      Raw: 202,
      AttributeDeclaration: 203,
      ElementDeclaration: 204,
      Dummy: 205
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 8229:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Copies all enumerable own properties from `sources` to `target`
    var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject,
      hasProp = {}.hasOwnProperty;
  
    assign = function(target, ...sources) {
      var i, key, len, source;
      if (isFunction(Object.assign)) {
        Object.assign.apply(null, arguments);
      } else {
        for (i = 0, len = sources.length; i < len; i++) {
          source = sources[i];
          if (source != null) {
            for (key in source) {
              if (!hasProp.call(source, key)) continue;
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  
    // Determines if `val` is a Function object
    isFunction = function(val) {
      return !!val && Object.prototype.toString.call(val) === '[object Function]';
    };
  
    // Determines if `val` is an Object
    isObject = function(val) {
      var ref;
      return !!val && ((ref = typeof val) === 'function' || ref === 'object');
    };
  
    // Determines if `val` is an Array
    isArray = function(val) {
      if (isFunction(Array.isArray)) {
        return Array.isArray(val);
      } else {
        return Object.prototype.toString.call(val) === '[object Array]';
      }
    };
  
    // Determines if `val` is an empty Array or an Object with no own properties
    isEmpty = function(val) {
      var key;
      if (isArray(val)) {
        return !val.length;
      } else {
        for (key in val) {
          if (!hasProp.call(val, key)) continue;
          return false;
        }
        return true;
      }
    };
  
    // Determines if `val` is a plain Object
    isPlainObject = function(val) {
      var ctor, proto;
      return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && (typeof ctor === 'function') && (ctor instanceof ctor) && (Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object));
    };
  
    // Gets the primitive value of an object
    getValue = function(obj) {
      if (isFunction(obj.valueOf)) {
        return obj.valueOf();
      } else {
        return obj;
      }
    };
  
    module.exports.assign = assign;
  
    module.exports.isFunction = isFunction;
  
    module.exports.isObject = isObject;
  
    module.exports.isArray = isArray;
  
    module.exports.isEmpty = isEmpty;
  
    module.exports.isPlainObject = isPlainObject;
  
    module.exports.getValue = getValue;
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 9766:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    module.exports = {
      None: 0,
      OpenTag: 1,
      InsideTag: 2,
      CloseTag: 3
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 8376:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLAttribute, XMLNode;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLNode = __nccwpck_require__(7608);
  
    // Represents an attribute
    module.exports = XMLAttribute = (function() {
      class XMLAttribute {
        // Initializes a new instance of `XMLAttribute`
  
        // `parent` the parent node
        // `name` attribute target
        // `value` attribute value
        constructor(parent, name, value) {
          this.parent = parent;
          if (this.parent) {
            this.options = this.parent.options;
            this.stringify = this.parent.stringify;
          }
          if (name == null) {
            throw new Error("Missing attribute name. " + this.debugInfo(name));
          }
          this.name = this.stringify.name(name);
          this.value = this.stringify.attValue(value);
          this.type = NodeType.Attribute;
          // DOM level 3
          this.isId = false;
          this.schemaTypeInfo = null;
        }
  
        // Creates and returns a deep clone of `this`
        clone() {
          return Object.create(this);
        }
  
        // Converts the XML fragment to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        toString(options) {
          return this.options.writer.attribute(this, this.options.writer.filterOptions(options));
        }
  
        
        // Returns debug string for this node
        debugInfo(name) {
          name = name || this.name;
          if (name == null) {
            return "parent: <" + this.parent.name + ">";
          } else {
            return "attribute: {" + name + "}, parent: <" + this.parent.name + ">";
          }
        }
  
        isEqualNode(node) {
          if (node.namespaceURI !== this.namespaceURI) {
            return false;
          }
          if (node.prefix !== this.prefix) {
            return false;
          }
          if (node.localName !== this.localName) {
            return false;
          }
          if (node.value !== this.value) {
            return false;
          }
          return true;
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLAttribute.prototype, 'nodeType', {
        get: function() {
          return this.type;
        }
      });
  
      Object.defineProperty(XMLAttribute.prototype, 'ownerElement', {
        get: function() {
          return this.parent;
        }
      });
  
      // DOM level 3
      Object.defineProperty(XMLAttribute.prototype, 'textContent', {
        get: function() {
          return this.value;
        },
        set: function(value) {
          return this.value = value || '';
        }
      });
  
      // DOM level 4
      Object.defineProperty(XMLAttribute.prototype, 'namespaceURI', {
        get: function() {
          return '';
        }
      });
  
      Object.defineProperty(XMLAttribute.prototype, 'prefix', {
        get: function() {
          return '';
        }
      });
  
      Object.defineProperty(XMLAttribute.prototype, 'localName', {
        get: function() {
          return this.name;
        }
      });
  
      Object.defineProperty(XMLAttribute.prototype, 'specified', {
        get: function() {
          return true;
        }
      });
  
      return XMLAttribute;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 333:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLCData, XMLCharacterData;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLCharacterData = __nccwpck_require__(7709);
  
    // Represents a  CDATA node
    module.exports = XMLCData = class XMLCData extends XMLCharacterData {
      // Initializes a new instance of `XMLCData`
  
      // `text` CDATA text
      constructor(parent, text) {
        super(parent);
        if (text == null) {
          throw new Error("Missing CDATA text. " + this.debugInfo());
        }
        this.name = "#cdata-section";
        this.type = NodeType.CData;
        this.value = this.stringify.cdata(text);
      }
  
      // Creates and returns a deep clone of `this`
      clone() {
        return Object.create(this);
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.cdata(this, this.options.writer.filterOptions(options));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 7709:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var XMLCharacterData, XMLNode;
  
    XMLNode = __nccwpck_require__(7608);
  
    // Represents a character data node
    module.exports = XMLCharacterData = (function() {
      class XMLCharacterData extends XMLNode {
        // Initializes a new instance of `XMLCharacterData`
  
        constructor(parent) {
          super(parent);
          this.value = '';
        }
  
        
        // Creates and returns a deep clone of `this`
        clone() {
          return Object.create(this);
        }
  
        // DOM level 1 functions to be implemented later
        substringData(offset, count) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        appendData(arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        insertData(offset, arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        deleteData(offset, count) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        replaceData(offset, count, arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        isEqualNode(node) {
          if (!super.isEqualNode(node)) {
            return false;
          }
          if (node.data !== this.data) {
            return false;
          }
          return true;
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLCharacterData.prototype, 'data', {
        get: function() {
          return this.value;
        },
        set: function(value) {
          return this.value = value || '';
        }
      });
  
      Object.defineProperty(XMLCharacterData.prototype, 'length', {
        get: function() {
          return this.value.length;
        }
      });
  
      // DOM level 3
      Object.defineProperty(XMLCharacterData.prototype, 'textContent', {
        get: function() {
          return this.value;
        },
        set: function(value) {
          return this.value = value || '';
        }
      });
  
      return XMLCharacterData;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 4407:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLCharacterData, XMLComment;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLCharacterData = __nccwpck_require__(7709);
  
    // Represents a comment node
    module.exports = XMLComment = class XMLComment extends XMLCharacterData {
      // Initializes a new instance of `XMLComment`
  
      // `text` comment text
      constructor(parent, text) {
        super(parent);
        if (text == null) {
          throw new Error("Missing comment text. " + this.debugInfo());
        }
        this.name = "#comment";
        this.type = NodeType.Comment;
        this.value = this.stringify.comment(text);
      }
  
      // Creates and returns a deep clone of `this`
      clone() {
        return Object.create(this);
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.comment(this, this.options.writer.filterOptions(options));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 7465:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList;
  
    XMLDOMErrorHandler = __nccwpck_require__(6744);
  
    XMLDOMStringList = __nccwpck_require__(7028);
  
    // Implements the DOMConfiguration interface
    module.exports = XMLDOMConfiguration = (function() {
      class XMLDOMConfiguration {
        constructor() {
          var clonedSelf;
          this.defaultParams = {
            "canonical-form": false,
            "cdata-sections": false,
            "comments": false,
            "datatype-normalization": false,
            "element-content-whitespace": true,
            "entities": true,
            "error-handler": new XMLDOMErrorHandler(),
            "infoset": true,
            "validate-if-schema": false,
            "namespaces": true,
            "namespace-declarations": true,
            "normalize-characters": false,
            "schema-location": '',
            "schema-type": '',
            "split-cdata-sections": true,
            "validate": false,
            "well-formed": true
          };
          this.params = clonedSelf = Object.create(this.defaultParams);
        }
  
        // Gets the value of a parameter.
  
        // `name` name of the parameter
        getParameter(name) {
          if (this.params.hasOwnProperty(name)) {
            return this.params[name];
          } else {
            return null;
          }
        }
  
        // Checks if setting a parameter to a specific value is supported.
  
        // `name` name of the parameter
        // `value` parameter value
        canSetParameter(name, value) {
          return true;
        }
  
        // Sets the value of a parameter.
  
        // `name` name of the parameter
        // `value` new value or null if the user wishes to unset the parameter
        setParameter(name, value) {
          if (value != null) {
            return this.params[name] = value;
          } else {
            return delete this.params[name];
          }
        }
  
      };
  
      // Returns the list of parameter names
      Object.defineProperty(XMLDOMConfiguration.prototype, 'parameterNames', {
        get: function() {
          return new XMLDOMStringList(Object.keys(this.defaultParams));
        }
      });
  
      return XMLDOMConfiguration;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 6744:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Represents the error handler for DOM operations
    var XMLDOMErrorHandler;
  
    module.exports = XMLDOMErrorHandler = class XMLDOMErrorHandler {
      // Initializes a new instance of `XMLDOMErrorHandler`
  
      constructor() {}
  
      // Called on the error handler when an error occurs.
  
      // `error` the error message as a string
      handleError(error) {
        throw new Error(error);
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 8310:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Implements the DOMImplementation interface
    var XMLDOMImplementation;
  
    module.exports = XMLDOMImplementation = class XMLDOMImplementation {
      // Tests if the DOM implementation implements a specific feature.
  
      // `feature` package name of the feature to test. In Level 1, the
      //           legal values are "HTML" and "XML" (case-insensitive).
      // `version` version number of the package name to test. 
      //           In Level 1, this is the string "1.0". If the version is 
      //           not specified, supporting any version of the feature will 
      //           cause the method to return true.
      hasFeature(feature, version) {
        return true;
      }
  
      // Creates a new document type declaration.
  
      // `qualifiedName` qualified name of the document type to be created
      // `publicId` public identifier of the external subset
      // `systemId` system identifier of the external subset
      createDocumentType(qualifiedName, publicId, systemId) {
        throw new Error("This DOM method is not implemented.");
      }
  
      // Creates a new document.
  
      // `namespaceURI` namespace URI of the document element to create
      // `qualifiedName` the qualified name of the document to be created
      // `doctype` the type of document to be created or null
      createDocument(namespaceURI, qualifiedName, doctype) {
        throw new Error("This DOM method is not implemented.");
      }
  
      // Creates a new HTML document.
  
      // `title` document title
      createHTMLDocument(title) {
        throw new Error("This DOM method is not implemented.");
      }
  
      // Returns a specialized object which implements the specialized APIs 
      // of the specified feature and version.
  
      // `feature` name of the feature requested.
      // `version` version number of the feature to test
      getFeature(feature, version) {
        throw new Error("This DOM method is not implemented.");
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 7028:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Represents a list of string entries
    var XMLDOMStringList;
  
    module.exports = XMLDOMStringList = (function() {
      class XMLDOMStringList {
        // Initializes a new instance of `XMLDOMStringList`
        // This is just a wrapper around an ordinary
        // JS array.
  
        // `arr` the array of string values
        constructor(arr) {
          this.arr = arr || [];
        }
  
        // Returns the indexth item in the collection.
  
        // `index` index into the collection
        item(index) {
          return this.arr[index] || null;
        }
  
        // Test if a string is part of this DOMStringList.
  
        // `str` the string to look for
        contains(str) {
          return this.arr.indexOf(str) !== -1;
        }
  
      };
  
      // Returns the number of strings in the list.
      Object.defineProperty(XMLDOMStringList.prototype, 'length', {
        get: function() {
          return this.arr.length;
        }
      });
  
      return XMLDOMStringList;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 1015:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDTDAttList, XMLNode;
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    // Represents an attribute list
    module.exports = XMLDTDAttList = class XMLDTDAttList extends XMLNode {
      // Initializes a new instance of `XMLDTDAttList`
  
      // `parent` the parent `XMLDocType` element
      // `elementName` the name of the element containing this attribute
      // `attributeName` attribute name
      // `attributeType` type of the attribute
      // `defaultValueType` default value type (either #REQUIRED, #IMPLIED,
      //                    #FIXED or #DEFAULT)
      // `defaultValue` default value of the attribute
      //                (only used for #FIXED or #DEFAULT)
      constructor(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
        super(parent);
        if (elementName == null) {
          throw new Error("Missing DTD element name. " + this.debugInfo());
        }
        if (attributeName == null) {
          throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
        }
        if (!attributeType) {
          throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
        }
        if (!defaultValueType) {
          throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
        }
        if (defaultValueType.indexOf('#') !== 0) {
          defaultValueType = '#' + defaultValueType;
        }
        if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
          throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
        }
        if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
          throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
        }
        this.elementName = this.stringify.name(elementName);
        this.type = NodeType.AttributeDeclaration;
        this.attributeName = this.stringify.name(attributeName);
        this.attributeType = this.stringify.dtdAttType(attributeType);
        if (defaultValue) {
          this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
        }
        this.defaultValueType = defaultValueType;
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 2421:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDTDElement, XMLNode;
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    // Represents an attribute
    module.exports = XMLDTDElement = class XMLDTDElement extends XMLNode {
      // Initializes a new instance of `XMLDTDElement`
  
      // `parent` the parent `XMLDocType` element
      // `name` element name
      // `value` element content (defaults to #PCDATA)
      constructor(parent, name, value) {
        super(parent);
        if (name == null) {
          throw new Error("Missing DTD element name. " + this.debugInfo());
        }
        if (!value) {
          value = '(#PCDATA)';
        }
        if (Array.isArray(value)) {
          value = '(' + value.join(',') + ')';
        }
        this.name = this.stringify.name(name);
        this.type = NodeType.ElementDeclaration;
        this.value = this.stringify.dtdElementValue(value);
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 53:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDTDEntity, XMLNode, isObject;
  
    ({isObject} = __nccwpck_require__(8229));
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    // Represents an entity declaration in the DTD
    module.exports = XMLDTDEntity = (function() {
      class XMLDTDEntity extends XMLNode {
        // Initializes a new instance of `XMLDTDEntity`
  
        // `parent` the parent `XMLDocType` element
        // `pe` whether this is a parameter entity or a general entity
        //      defaults to `false` (general entity)
        // `name` the name of the entity
        // `value` internal entity value or an object with external entity details
        // `value.pubID` public identifier
        // `value.sysID` system identifier
        // `value.nData` notation declaration
        constructor(parent, pe, name, value) {
          super(parent);
          if (name == null) {
            throw new Error("Missing DTD entity name. " + this.debugInfo(name));
          }
          if (value == null) {
            throw new Error("Missing DTD entity value. " + this.debugInfo(name));
          }
          this.pe = !!pe;
          this.name = this.stringify.name(name);
          this.type = NodeType.EntityDeclaration;
          if (!isObject(value)) {
            this.value = this.stringify.dtdEntityValue(value);
            this.internal = true;
          } else {
            if (!value.pubID && !value.sysID) {
              throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
            }
            if (value.pubID && !value.sysID) {
              throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
            }
            this.internal = false;
            if (value.pubID != null) {
              this.pubID = this.stringify.dtdPubID(value.pubID);
            }
            if (value.sysID != null) {
              this.sysID = this.stringify.dtdSysID(value.sysID);
            }
            if (value.nData != null) {
              this.nData = this.stringify.dtdNData(value.nData);
            }
            if (this.pe && this.nData) {
              throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
            }
          }
        }
  
        // Converts the XML fragment to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        toString(options) {
          return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options));
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLDTDEntity.prototype, 'publicId', {
        get: function() {
          return this.pubID;
        }
      });
  
      Object.defineProperty(XMLDTDEntity.prototype, 'systemId', {
        get: function() {
          return this.sysID;
        }
      });
  
      Object.defineProperty(XMLDTDEntity.prototype, 'notationName', {
        get: function() {
          return this.nData || null;
        }
      });
  
      // DOM level 3
      Object.defineProperty(XMLDTDEntity.prototype, 'inputEncoding', {
        get: function() {
          return null;
        }
      });
  
      Object.defineProperty(XMLDTDEntity.prototype, 'xmlEncoding', {
        get: function() {
          return null;
        }
      });
  
      Object.defineProperty(XMLDTDEntity.prototype, 'xmlVersion', {
        get: function() {
          return null;
        }
      });
  
      return XMLDTDEntity;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 2837:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDTDNotation, XMLNode;
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    // Represents a NOTATION entry in the DTD
    module.exports = XMLDTDNotation = (function() {
      class XMLDTDNotation extends XMLNode {
        // Initializes a new instance of `XMLDTDNotation`
  
        // `parent` the parent `XMLDocType` element
        // `name` the name of the notation
        // `value` an object with external entity details
        // `value.pubID` public identifier
        // `value.sysID` system identifier
        constructor(parent, name, value) {
          super(parent);
          if (name == null) {
            throw new Error("Missing DTD notation name. " + this.debugInfo(name));
          }
          if (!value.pubID && !value.sysID) {
            throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.NotationDeclaration;
          if (value.pubID != null) {
            this.pubID = this.stringify.dtdPubID(value.pubID);
          }
          if (value.sysID != null) {
            this.sysID = this.stringify.dtdSysID(value.sysID);
          }
        }
  
        // Converts the XML fragment to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        toString(options) {
          return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options));
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLDTDNotation.prototype, 'publicId', {
        get: function() {
          return this.pubID;
        }
      });
  
      Object.defineProperty(XMLDTDNotation.prototype, 'systemId', {
        get: function() {
          return this.sysID;
        }
      });
  
      return XMLDTDNotation;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 6364:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDeclaration, XMLNode, isObject;
  
    ({isObject} = __nccwpck_require__(8229));
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    // Represents the XML declaration
    module.exports = XMLDeclaration = class XMLDeclaration extends XMLNode {
      // Initializes a new instance of `XMLDeclaration`
  
      // `parent` the document object
  
      // `version` A version number string, e.g. 1.0
      // `encoding` Encoding declaration, e.g. UTF-8
      // `standalone` standalone document declaration: true or false
      constructor(parent, version, encoding, standalone) {
        super(parent);
        // arguments may also be passed as an object
        if (isObject(version)) {
          ({version, encoding, standalone} = version);
        }
        if (!version) {
          version = '1.0';
        }
        this.type = NodeType.Declaration;
        this.version = this.stringify.xmlVersion(version);
        if (encoding != null) {
          this.encoding = this.stringify.xmlEncoding(encoding);
        }
        if (standalone != null) {
          this.standalone = this.stringify.xmlStandalone(standalone);
        }
      }
  
      // Converts to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.declaration(this, this.options.writer.filterOptions(options));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 1801:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDocType, XMLNamedNodeMap, XMLNode, isObject;
  
    ({isObject} = __nccwpck_require__(8229));
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    XMLDTDAttList = __nccwpck_require__(1015);
  
    XMLDTDEntity = __nccwpck_require__(53);
  
    XMLDTDElement = __nccwpck_require__(2421);
  
    XMLDTDNotation = __nccwpck_require__(2837);
  
    XMLNamedNodeMap = __nccwpck_require__(4361);
  
    // Represents doctype declaration
    module.exports = XMLDocType = (function() {
      class XMLDocType extends XMLNode {
        // Initializes a new instance of `XMLDocType`
  
        // `parent` the document object
  
        // `pubID` public identifier of the external subset
        // `sysID` system identifier of the external subset
        constructor(parent, pubID, sysID) {
          var child, i, len, ref;
          super(parent);
          this.type = NodeType.DocType;
          // set DTD name to the name of the root node
          if (parent.children) {
            ref = parent.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.Element) {
                this.name = child.name;
                break;
              }
            }
          }
          this.documentObject = parent;
          // arguments may also be passed as an object
          if (isObject(pubID)) {
            ({pubID, sysID} = pubID);
          }
          if (sysID == null) {
            [sysID, pubID] = [pubID, sysID];
          }
          if (pubID != null) {
            this.pubID = this.stringify.dtdPubID(pubID);
          }
          if (sysID != null) {
            this.sysID = this.stringify.dtdSysID(sysID);
          }
        }
  
        // Creates an element type declaration
  
        // `name` element name
        // `value` element content (defaults to #PCDATA)
        element(name, value) {
          var child;
          child = new XMLDTDElement(this, name, value);
          this.children.push(child);
          return this;
        }
  
        // Creates an attribute declaration
  
        // `elementName` the name of the element containing this attribute
        // `attributeName` attribute name
        // `attributeType` type of the attribute (defaults to CDATA)
        // `defaultValueType` default value type (either #REQUIRED, #IMPLIED, #FIXED or
        //                    #DEFAULT) (defaults to #IMPLIED)
        // `defaultValue` default value of the attribute
        //                (only used for #FIXED or #DEFAULT)
        attList(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          var child;
          child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
          this.children.push(child);
          return this;
        }
  
        // Creates a general entity declaration
  
        // `name` the name of the entity
        // `value` internal entity value or an object with external entity details
        // `value.pubID` public identifier
        // `value.sysID` system identifier
        // `value.nData` notation declaration
        entity(name, value) {
          var child;
          child = new XMLDTDEntity(this, false, name, value);
          this.children.push(child);
          return this;
        }
  
        // Creates a parameter entity declaration
  
        // `name` the name of the entity
        // `value` internal entity value or an object with external entity details
        // `value.pubID` public identifier
        // `value.sysID` system identifier
        pEntity(name, value) {
          var child;
          child = new XMLDTDEntity(this, true, name, value);
          this.children.push(child);
          return this;
        }
  
        // Creates a NOTATION declaration
  
        // `name` the name of the notation
        // `value` an object with external entity details
        // `value.pubID` public identifier
        // `value.sysID` system identifier
        notation(name, value) {
          var child;
          child = new XMLDTDNotation(this, name, value);
          this.children.push(child);
          return this;
        }
  
        // Converts to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        toString(options) {
          return this.options.writer.docType(this, this.options.writer.filterOptions(options));
        }
  
        // Aliases
        ele(name, value) {
          return this.element(name, value);
        }
  
        att(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
        }
  
        ent(name, value) {
          return this.entity(name, value);
        }
  
        pent(name, value) {
          return this.pEntity(name, value);
        }
  
        not(name, value) {
          return this.notation(name, value);
        }
  
        up() {
          return this.root() || this.documentObject;
        }
  
        isEqualNode(node) {
          if (!super.isEqualNode(node)) {
            return false;
          }
          if (node.name !== this.name) {
            return false;
          }
          if (node.publicId !== this.publicId) {
            return false;
          }
          if (node.systemId !== this.systemId) {
            return false;
          }
          return true;
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLDocType.prototype, 'entities', {
        get: function() {
          var child, i, len, nodes, ref;
          nodes = {};
          ref = this.children;
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            if ((child.type === NodeType.EntityDeclaration) && !child.pe) {
              nodes[child.name] = child;
            }
          }
          return new XMLNamedNodeMap(nodes);
        }
      });
  
      Object.defineProperty(XMLDocType.prototype, 'notations', {
        get: function() {
          var child, i, len, nodes, ref;
          nodes = {};
          ref = this.children;
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            if (child.type === NodeType.NotationDeclaration) {
              nodes[child.name] = child;
            }
          }
          return new XMLNamedNodeMap(nodes);
        }
      });
  
      // DOM level 2
      Object.defineProperty(XMLDocType.prototype, 'publicId', {
        get: function() {
          return this.pubID;
        }
      });
  
      Object.defineProperty(XMLDocType.prototype, 'systemId', {
        get: function() {
          return this.sysID;
        }
      });
  
      Object.defineProperty(XMLDocType.prototype, 'internalSubset', {
        get: function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
      });
  
      return XMLDocType;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 3730:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDOMConfiguration, XMLDOMImplementation, XMLDocument, XMLNode, XMLStringWriter, XMLStringifier, isPlainObject;
  
    ({isPlainObject} = __nccwpck_require__(8229));
  
    XMLDOMImplementation = __nccwpck_require__(8310);
  
    XMLDOMConfiguration = __nccwpck_require__(7465);
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    XMLStringifier = __nccwpck_require__(8594);
  
    XMLStringWriter = __nccwpck_require__(5913);
  
    // Represents an XML builder
    module.exports = XMLDocument = (function() {
      class XMLDocument extends XMLNode {
        // Initializes a new instance of `XMLDocument`
  
        // `options.keepNullNodes` whether nodes with null values will be kept
        //     or ignored: true or false
        // `options.keepNullAttributes` whether attributes with null values will be
        //     kept or ignored: true or false
        // `options.ignoreDecorators` whether decorator strings will be ignored when
        //     converting JS objects: true or false
        // `options.separateArrayItems` whether array items are created as separate
        //     nodes when passed as an object value: true or false
        // `options.noDoubleEncoding` whether existing html entities are encoded:
        //     true or false
        // `options.stringify` a set of functions to use for converting values to
        //     strings
        // `options.writer` the default XML writer to use for converting nodes to
        //     string. If the default writer is not set, the built-in XMLStringWriter
        //     will be used instead.
        constructor(options) {
          super(null);
          this.name = "#document";
          this.type = NodeType.Document;
          this.documentURI = null;
          this.domConfig = new XMLDOMConfiguration();
          options || (options = {});
          if (!options.writer) {
            options.writer = new XMLStringWriter();
          }
          this.options = options;
          this.stringify = new XMLStringifier(options);
        }
  
        // Ends the document and passes it to the given XML writer
  
        // `writer` is either an XML writer or a plain object to pass to the
        // constructor of the default XML writer. The default writer is assigned when
        // creating the XML document. Following flags are recognized by the
        // built-in XMLStringWriter:
        //   `writer.pretty` pretty prints the result
        //   `writer.indent` indentation for pretty print
        //   `writer.offset` how many indentations to add to every line for pretty print
        //   `writer.newline` newline sequence for pretty print
        end(writer) {
          var writerOptions;
          writerOptions = {};
          if (!writer) {
            writer = this.options.writer;
          } else if (isPlainObject(writer)) {
            writerOptions = writer;
            writer = this.options.writer;
          }
          return writer.document(this, writer.filterOptions(writerOptions));
        }
  
        // Converts the XML document to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        toString(options) {
          return this.options.writer.document(this, this.options.writer.filterOptions(options));
        }
  
        // DOM level 1 functions to be implemented later
        createElement(tagName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createDocumentFragment() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createTextNode(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createComment(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createCDATASection(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createProcessingInstruction(target, data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createAttribute(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createEntityReference(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementsByTagName(tagname) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM level 2 functions to be implemented later
        importNode(importedNode, deep) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createElementNS(namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createAttributeNS(namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementsByTagNameNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementById(elementId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM level 3 functions to be implemented later
        adoptNode(source) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        normalizeDocument() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        renameNode(node, namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM level 4 functions to be implemented later
        getElementsByClassName(classNames) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createEvent(eventInterface) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createRange() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createNodeIterator(root, whatToShow, filter) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        createTreeWalker(root, whatToShow, filter) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLDocument.prototype, 'implementation', {
        value: new XMLDOMImplementation()
      });
  
      Object.defineProperty(XMLDocument.prototype, 'doctype', {
        get: function() {
          var child, i, len, ref;
          ref = this.children;
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            if (child.type === NodeType.DocType) {
              return child;
            }
          }
          return null;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'documentElement', {
        get: function() {
          return this.rootObject || null;
        }
      });
  
      // DOM level 3
      Object.defineProperty(XMLDocument.prototype, 'inputEncoding', {
        get: function() {
          return null;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'strictErrorChecking', {
        get: function() {
          return false;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'xmlEncoding', {
        get: function() {
          if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
            return this.children[0].encoding;
          } else {
            return null;
          }
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'xmlStandalone', {
        get: function() {
          if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
            return this.children[0].standalone === 'yes';
          } else {
            return false;
          }
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'xmlVersion', {
        get: function() {
          if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
            return this.children[0].version;
          } else {
            return "1.0";
          }
        }
      });
  
      // DOM level 4
      Object.defineProperty(XMLDocument.prototype, 'URL', {
        get: function() {
          return this.documentURI;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'origin', {
        get: function() {
          return null;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'compatMode', {
        get: function() {
          return null;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'characterSet', {
        get: function() {
          return null;
        }
      });
  
      Object.defineProperty(XMLDocument.prototype, 'contentType', {
        get: function() {
          return null;
        }
      });
  
      return XMLDocument;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 7356:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, WriterState, XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDocument, XMLDocumentCB, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject,
      hasProp = {}.hasOwnProperty;
  
    ({isObject, isFunction, isPlainObject, getValue} = __nccwpck_require__(8229));
  
    NodeType = __nccwpck_require__(9267);
  
    XMLDocument = __nccwpck_require__(3730);
  
    XMLElement = __nccwpck_require__(9437);
  
    XMLCData = __nccwpck_require__(333);
  
    XMLComment = __nccwpck_require__(4407);
  
    XMLRaw = __nccwpck_require__(6329);
  
    XMLText = __nccwpck_require__(1318);
  
    XMLProcessingInstruction = __nccwpck_require__(6939);
  
    XMLDeclaration = __nccwpck_require__(6364);
  
    XMLDocType = __nccwpck_require__(1801);
  
    XMLDTDAttList = __nccwpck_require__(1015);
  
    XMLDTDEntity = __nccwpck_require__(53);
  
    XMLDTDElement = __nccwpck_require__(2421);
  
    XMLDTDNotation = __nccwpck_require__(2837);
  
    XMLAttribute = __nccwpck_require__(8376);
  
    XMLStringifier = __nccwpck_require__(8594);
  
    XMLStringWriter = __nccwpck_require__(5913);
  
    WriterState = __nccwpck_require__(9766);
  
    // Represents an XML builder
    module.exports = XMLDocumentCB = class XMLDocumentCB {
      // Initializes a new instance of `XMLDocumentCB`
  
      // `options.keepNullNodes` whether nodes with null values will be kept
      //     or ignored: true or false
      // `options.keepNullAttributes` whether attributes with null values will be
      //     kept or ignored: true or false
      // `options.ignoreDecorators` whether decorator strings will be ignored when
      //     converting JS objects: true or false
      // `options.separateArrayItems` whether array items are created as separate
      //     nodes when passed as an object value: true or false
      // `options.noDoubleEncoding` whether existing html entities are encoded:
      //     true or false
      // `options.stringify` a set of functions to use for converting values to
      //     strings
      // `options.writer` the default XML writer to use for converting nodes to
      //     string. If the default writer is not set, the built-in XMLStringWriter
      //     will be used instead.
  
      // `onData` the function to be called when a new chunk of XML is output. The
      //          string containing the XML chunk is passed to `onData` as its first
      //          argument, and the current indentation level as its second argument.
      // `onEnd`  the function to be called when the XML document is completed with
      //          `end`. `onEnd` does not receive any arguments.
      constructor(options, onData, onEnd) {
        var writerOptions;
        this.name = "?xml";
        this.type = NodeType.Document;
        options || (options = {});
        writerOptions = {};
        if (!options.writer) {
          options.writer = new XMLStringWriter();
        } else if (isPlainObject(options.writer)) {
          writerOptions = options.writer;
          options.writer = new XMLStringWriter();
        }
        this.options = options;
        this.writer = options.writer;
        this.writerOptions = this.writer.filterOptions(writerOptions);
        this.stringify = new XMLStringifier(options);
        this.onDataCallback = onData || function() {};
        this.onEndCallback = onEnd || function() {};
        this.currentNode = null;
        this.currentLevel = -1;
        this.openTags = {};
        this.documentStarted = false;
        this.documentCompleted = false;
        this.root = null;
      }
  
      // Creates a child element node from the given XMLNode
  
      // `node` the child node
      createChildNode(node) {
        var att, attName, attributes, child, i, len, ref, ref1;
        switch (node.type) {
          case NodeType.CData:
            this.cdata(node.value);
            break;
          case NodeType.Comment:
            this.comment(node.value);
            break;
          case NodeType.Element:
            attributes = {};
            ref = node.attribs;
            for (attName in ref) {
              if (!hasProp.call(ref, attName)) continue;
              att = ref[attName];
              attributes[attName] = att.value;
            }
            this.node(node.name, attributes);
            break;
          case NodeType.Dummy:
            this.dummy();
            break;
          case NodeType.Raw:
            this.raw(node.value);
            break;
          case NodeType.Text:
            this.text(node.value);
            break;
          case NodeType.ProcessingInstruction:
            this.instruction(node.target, node.value);
            break;
          default:
            throw new Error("This XML node type is not supported in a JS object: " + node.constructor.name);
        }
        ref1 = node.children;
        // write child nodes recursively
        for (i = 0, len = ref1.length; i < len; i++) {
          child = ref1[i];
          this.createChildNode(child);
          if (child.type === NodeType.Element) {
            this.up();
          }
        }
        return this;
      }
  
      // Creates a dummy node
  
      dummy() {
        // no-op, just return this
        return this;
      }
  
      // Creates a node
  
      // `name` name of the node
      // `attributes` an object containing name/value pairs of attributes
      // `text` element text
      node(name, attributes, text) {
        if (name == null) {
          throw new Error("Missing node name.");
        }
        if (this.root && this.currentLevel === -1) {
          throw new Error("Document can only have one root node. " + this.debugInfo(name));
        }
        this.openCurrent();
        name = getValue(name);
        if (attributes == null) {
          attributes = {};
        }
        attributes = getValue(attributes);
        // swap argument order: text <-> attributes
        if (!isObject(attributes)) {
          [text, attributes] = [attributes, text];
        }
        this.currentNode = new XMLElement(this, name, attributes);
        this.currentNode.children = false;
        this.currentLevel++;
        this.openTags[this.currentLevel] = this.currentNode;
        if (text != null) {
          this.text(text);
        }
        return this;
      }
  
      // Creates a child element node or an element type declaration when called
      // inside the DTD
  
      // `name` name of the node
      // `attributes` an object containing name/value pairs of attributes
      // `text` element text
      element(name, attributes, text) {
        var child, i, len, oldValidationFlag, ref, root;
        if (this.currentNode && this.currentNode.type === NodeType.DocType) {
          this.dtdElement(...arguments);
        } else {
          if (Array.isArray(name) || isObject(name) || isFunction(name)) {
            oldValidationFlag = this.options.noValidation;
            this.options.noValidation = true;
            root = new XMLDocument(this.options).element('TEMP_ROOT');
            root.element(name);
            this.options.noValidation = oldValidationFlag;
            ref = root.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              this.createChildNode(child);
              if (child.type === NodeType.Element) {
                this.up();
              }
            }
          } else {
            this.node(name, attributes, text);
          }
        }
        return this;
      }
  
      // Adds or modifies an attribute
  
      // `name` attribute name
      // `value` attribute value
      attribute(name, value) {
        var attName, attValue;
        if (!this.currentNode || this.currentNode.children) {
          throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
        }
        if (name != null) {
          name = getValue(name);
        }
        if (isObject(name)) { // expand if object
          for (attName in name) {
            if (!hasProp.call(name, attName)) continue;
            attValue = name[attName];
            this.attribute(attName, attValue);
          }
        } else {
          if (isFunction(value)) {
            value = value.apply();
          }
          if (this.options.keepNullAttributes && (value == null)) {
            this.currentNode.attribs[name] = new XMLAttribute(this, name, "");
          } else if (value != null) {
            this.currentNode.attribs[name] = new XMLAttribute(this, name, value);
          }
        }
        return this;
      }
  
      // Creates a text node
  
      // `value` element text
      text(value) {
        var node;
        this.openCurrent();
        node = new XMLText(this, value);
        this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates a CDATA node
  
      // `value` element text without CDATA delimiters
      cdata(value) {
        var node;
        this.openCurrent();
        node = new XMLCData(this, value);
        this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates a comment node
  
      // `value` comment text
      comment(value) {
        var node;
        this.openCurrent();
        node = new XMLComment(this, value);
        this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Adds unescaped raw text
  
      // `value` text
      raw(value) {
        var node;
        this.openCurrent();
        node = new XMLRaw(this, value);
        this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Adds a processing instruction
  
      // `target` instruction target
      // `value` instruction value
      instruction(target, value) {
        var i, insTarget, insValue, len, node;
        this.openCurrent();
        if (target != null) {
          target = getValue(target);
        }
        if (value != null) {
          value = getValue(value);
        }
        if (Array.isArray(target)) { // expand if array
          for (i = 0, len = target.length; i < len; i++) {
            insTarget = target[i];
            this.instruction(insTarget);
          }
        } else if (isObject(target)) { // expand if object
          for (insTarget in target) {
            if (!hasProp.call(target, insTarget)) continue;
            insValue = target[insTarget];
            this.instruction(insTarget, insValue);
          }
        } else {
          if (isFunction(value)) {
            value = value.apply();
          }
          node = new XMLProcessingInstruction(this, target, value);
          this.onData(this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        }
        return this;
      }
  
      // Creates the xml declaration
  
      // `version` A version number string, e.g. 1.0
      // `encoding` Encoding declaration, e.g. UTF-8
      // `standalone` standalone document declaration: true or false
      declaration(version, encoding, standalone) {
        var node;
        this.openCurrent();
        if (this.documentStarted) {
          throw new Error("declaration() must be the first node.");
        }
        node = new XMLDeclaration(this, version, encoding, standalone);
        this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates the document type declaration
  
      // `root`  the name of the root node
      // `pubID` the public identifier of the external subset
      // `sysID` the system identifier of the external subset
      doctype(root, pubID, sysID) {
        this.openCurrent();
        if (root == null) {
          throw new Error("Missing root node name.");
        }
        if (this.root) {
          throw new Error("dtd() must come before the root node.");
        }
        this.currentNode = new XMLDocType(this, pubID, sysID);
        this.currentNode.rootNodeName = root;
        this.currentNode.children = false;
        this.currentLevel++;
        this.openTags[this.currentLevel] = this.currentNode;
        return this;
      }
  
      // Creates an element type declaration
  
      // `name` element name
      // `value` element content (defaults to #PCDATA)
      dtdElement(name, value) {
        var node;
        this.openCurrent();
        node = new XMLDTDElement(this, name, value);
        this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates an attribute declaration
  
      // `elementName` the name of the element containing this attribute
      // `attributeName` attribute name
      // `attributeType` type of the attribute (defaults to CDATA)
      // `defaultValueType` default value type (either #REQUIRED, #IMPLIED, #FIXED or
      //                    #DEFAULT) (defaults to #IMPLIED)
      // `defaultValue` default value of the attribute
      //                (only used for #FIXED or #DEFAULT)
      attList(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
        var node;
        this.openCurrent();
        node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
        this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates a general entity declaration
  
      // `name` the name of the entity
      // `value` internal entity value or an object with external entity details
      // `value.pubID` public identifier
      // `value.sysID` system identifier
      // `value.nData` notation declaration
      entity(name, value) {
        var node;
        this.openCurrent();
        node = new XMLDTDEntity(this, false, name, value);
        this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates a parameter entity declaration
  
      // `name` the name of the entity
      // `value` internal entity value or an object with external entity details
      // `value.pubID` public identifier
      // `value.sysID` system identifier
      pEntity(name, value) {
        var node;
        this.openCurrent();
        node = new XMLDTDEntity(this, true, name, value);
        this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Creates a NOTATION declaration
  
      // `name` the name of the notation
      // `value` an object with external entity details
      // `value.pubID` public identifier
      // `value.sysID` system identifier
      notation(name, value) {
        var node;
        this.openCurrent();
        node = new XMLDTDNotation(this, name, value);
        this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
        return this;
      }
  
      // Gets the parent node
      up() {
        if (this.currentLevel < 0) {
          throw new Error("The document node has no parent.");
        }
        if (this.currentNode) {
          if (this.currentNode.children) {
            this.closeNode(this.currentNode);
          } else {
            this.openNode(this.currentNode);
          }
          this.currentNode = null;
        } else {
          this.closeNode(this.openTags[this.currentLevel]);
        }
        delete this.openTags[this.currentLevel];
        this.currentLevel--;
        return this;
      }
  
      // Ends the document
      end() {
        while (this.currentLevel >= 0) {
          this.up();
        }
        return this.onEnd();
      }
  
      // Opens the current parent node
      openCurrent() {
        if (this.currentNode) {
          this.currentNode.children = true;
          return this.openNode(this.currentNode);
        }
      }
  
      // Writes the opening tag of the current node or the entire node if it has
      // no child nodes
      openNode(node) {
        var att, chunk, name, ref;
        if (!node.isOpen) {
          if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
            this.root = node;
          }
          chunk = '';
          if (node.type === NodeType.Element) {
            this.writerOptions.state = WriterState.OpenTag;
            chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<' + node.name;
            ref = node.attribs;
            for (name in ref) {
              if (!hasProp.call(ref, name)) continue;
              att = ref[name];
              chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel);
            }
            chunk += (node.children ? '>' : '/>') + this.writer.endline(node, this.writerOptions, this.currentLevel);
            this.writerOptions.state = WriterState.InsideTag; // if node.type is NodeType.DocType
          } else {
            this.writerOptions.state = WriterState.OpenTag;
            chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<!DOCTYPE ' + node.rootNodeName;
            
            // external identifier
            if (node.pubID && node.sysID) {
              chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
            } else if (node.sysID) {
              chunk += ' SYSTEM "' + node.sysID + '"';
            }
            
            // internal subset
            if (node.children) {
              chunk += ' [';
              this.writerOptions.state = WriterState.InsideTag;
            } else {
              this.writerOptions.state = WriterState.CloseTag;
              chunk += '>';
            }
            chunk += this.writer.endline(node, this.writerOptions, this.currentLevel);
          }
          this.onData(chunk, this.currentLevel);
          return node.isOpen = true;
        }
      }
  
      // Writes the closing tag of the current node
      closeNode(node) {
        var chunk;
        if (!node.isClosed) {
          chunk = '';
          this.writerOptions.state = WriterState.CloseTag;
          if (node.type === NodeType.Element) {
            chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '</' + node.name + '>' + this.writer.endline(node, this.writerOptions, this.currentLevel); // if node.type is NodeType.DocType
          } else {
            chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + ']>' + this.writer.endline(node, this.writerOptions, this.currentLevel);
          }
          this.writerOptions.state = WriterState.None;
          this.onData(chunk, this.currentLevel);
          return node.isClosed = true;
        }
      }
  
      // Called when a new chunk of XML is output
  
      // `chunk` a string containing the XML chunk
      // `level` current indentation level
      onData(chunk, level) {
        this.documentStarted = true;
        return this.onDataCallback(chunk, level + 1);
      }
  
      // Called when the XML document is completed
      onEnd() {
        this.documentCompleted = true;
        return this.onEndCallback();
      }
  
      // Returns debug string
      debugInfo(name) {
        if (name == null) {
          return "";
        } else {
          return "node: <" + name + ">";
        }
      }
  
      // Node aliases
      ele() {
        return this.element(...arguments);
      }
  
      nod(name, attributes, text) {
        return this.node(name, attributes, text);
      }
  
      txt(value) {
        return this.text(value);
      }
  
      dat(value) {
        return this.cdata(value);
      }
  
      com(value) {
        return this.comment(value);
      }
  
      ins(target, value) {
        return this.instruction(target, value);
      }
  
      dec(version, encoding, standalone) {
        return this.declaration(version, encoding, standalone);
      }
  
      dtd(root, pubID, sysID) {
        return this.doctype(root, pubID, sysID);
      }
  
      e(name, attributes, text) {
        return this.element(name, attributes, text);
      }
  
      n(name, attributes, text) {
        return this.node(name, attributes, text);
      }
  
      t(value) {
        return this.text(value);
      }
  
      d(value) {
        return this.cdata(value);
      }
  
      c(value) {
        return this.comment(value);
      }
  
      r(value) {
        return this.raw(value);
      }
  
      i(target, value) {
        return this.instruction(target, value);
      }
  
      // Attribute aliases
      att() {
        if (this.currentNode && this.currentNode.type === NodeType.DocType) {
          return this.attList(...arguments);
        } else {
          return this.attribute(...arguments);
        }
      }
  
      a() {
        if (this.currentNode && this.currentNode.type === NodeType.DocType) {
          return this.attList(...arguments);
        } else {
          return this.attribute(...arguments);
        }
      }
  
      // DTD aliases
      // att() and ele() are defined above
      ent(name, value) {
        return this.entity(name, value);
      }
  
      pent(name, value) {
        return this.pEntity(name, value);
      }
  
      not(name, value) {
        return this.notation(name, value);
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 3590:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLDummy, XMLNode;
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    // Represents a  raw node
    module.exports = XMLDummy = class XMLDummy extends XMLNode {
      // Initializes a new instance of `XMLDummy`
  
      // `XMLDummy` is a special node representing a node with 
      // a null value. Dummy nodes are created while recursively
      // building the XML tree. Simply skipping null values doesn't
      // work because that would break the recursive chain.
      constructor(parent) {
        super(parent);
        this.type = NodeType.Dummy;
      }
  
      // Creates and returns a deep clone of `this`
      clone() {
        return Object.create(this);
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return '';
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 9437:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLAttribute, XMLElement, XMLNamedNodeMap, XMLNode, getValue, isFunction, isObject,
      hasProp = {}.hasOwnProperty;
  
    ({isObject, isFunction, getValue} = __nccwpck_require__(8229));
  
    XMLNode = __nccwpck_require__(7608);
  
    NodeType = __nccwpck_require__(9267);
  
    XMLAttribute = __nccwpck_require__(8376);
  
    XMLNamedNodeMap = __nccwpck_require__(4361);
  
    // Represents an element of the XML document
    module.exports = XMLElement = (function() {
      class XMLElement extends XMLNode {
        // Initializes a new instance of `XMLElement`
  
        // `parent` the parent node
        // `name` element name
        // `attributes` an object containing name/value pairs of attributes
        constructor(parent, name, attributes) {
          var child, j, len, ref;
          super(parent);
          if (name == null) {
            throw new Error("Missing element name. " + this.debugInfo());
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.Element;
          this.attribs = {};
          this.schemaTypeInfo = null;
          if (attributes != null) {
            this.attribute(attributes);
          }
          // set properties if this is the root node
          if (parent.type === NodeType.Document) {
            this.isRoot = true;
            this.documentObject = parent;
            parent.rootObject = this;
            // set dtd name
            if (parent.children) {
              ref = parent.children;
              for (j = 0, len = ref.length; j < len; j++) {
                child = ref[j];
                if (child.type === NodeType.DocType) {
                  child.name = this.name;
                  break;
                }
              }
            }
          }
        }
  
        // Creates and returns a deep clone of `this`
  
        clone() {
          var att, attName, clonedSelf, ref;
          clonedSelf = Object.create(this);
          // remove document element
          if (clonedSelf.isRoot) {
            clonedSelf.documentObject = null;
          }
          // clone attributes
          clonedSelf.attribs = {};
          ref = this.attribs;
          for (attName in ref) {
            if (!hasProp.call(ref, attName)) continue;
            att = ref[attName];
            clonedSelf.attribs[attName] = att.clone();
          }
          // clone child nodes
          clonedSelf.children = [];
          this.children.forEach(function(child) {
            var clonedChild;
            clonedChild = child.clone();
            clonedChild.parent = clonedSelf;
            return clonedSelf.children.push(clonedChild);
          });
          return clonedSelf;
        }
  
        // Adds or modifies an attribute
  
        // `name` attribute name
        // `value` attribute value
        attribute(name, value) {
          var attName, attValue;
          if (name != null) {
            name = getValue(name);
          }
          if (isObject(name)) { // expand if object
            for (attName in name) {
              if (!hasProp.call(name, attName)) continue;
              attValue = name[attName];
              this.attribute(attName, attValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            if (this.options.keepNullAttributes && (value == null)) {
              this.attribs[name] = new XMLAttribute(this, name, "");
            } else if (value != null) {
              this.attribs[name] = new XMLAttribute(this, name, value);
            }
          }
          return this;
        }
  
        // Removes an attribute
  
        // `name` attribute name
        removeAttribute(name) {
          var attName, j, len;
          // Also defined in DOM level 1
          // removeAttribute(name) removes an attribute by name.
          if (name == null) {
            throw new Error("Missing attribute name. " + this.debugInfo());
          }
          name = getValue(name);
          if (Array.isArray(name)) { // expand if array
            for (j = 0, len = name.length; j < len; j++) {
              attName = name[j];
              delete this.attribs[attName];
            }
          } else {
            delete this.attribs[name];
          }
          return this;
        }
  
        // Converts the XML fragment to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        // `options.allowEmpty` do not self close empty element tags
        toString(options) {
          return this.options.writer.element(this, this.options.writer.filterOptions(options));
        }
  
        // Aliases
        att(name, value) {
          return this.attribute(name, value);
        }
  
        a(name, value) {
          return this.attribute(name, value);
        }
  
        // DOM Level 1
        getAttribute(name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].value;
          } else {
            return null;
          }
        }
  
        setAttribute(name, value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getAttributeNode(name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name];
          } else {
            return null;
          }
        }
  
        setAttributeNode(newAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        removeAttributeNode(oldAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementsByTagName(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM Level 2
        getAttributeNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        setAttributeNS(namespaceURI, qualifiedName, value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        removeAttributeNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getAttributeNodeNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        setAttributeNodeNS(newAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementsByTagNameNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        hasAttribute(name) {
          return this.attribs.hasOwnProperty(name);
        }
  
        hasAttributeNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM Level 3
        setIdAttribute(name, isId) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].isId;
          } else {
            return isId;
          }
        }
  
        setIdAttributeNS(namespaceURI, localName, isId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        setIdAttributeNode(idAttr, isId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM Level 4
        getElementsByTagName(tagname) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementsByTagNameNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getElementsByClassName(classNames) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        isEqualNode(node) {
          var i, j, ref;
          if (!super.isEqualNode(node)) {
            return false;
          }
          if (node.namespaceURI !== this.namespaceURI) {
            return false;
          }
          if (node.prefix !== this.prefix) {
            return false;
          }
          if (node.localName !== this.localName) {
            return false;
          }
          if (node.attribs.length !== this.attribs.length) {
            return false;
          }
          for (i = j = 0, ref = this.attribs.length - 1; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
            if (!this.attribs[i].isEqualNode(node.attribs[i])) {
              return false;
            }
          }
          return true;
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLElement.prototype, 'tagName', {
        get: function() {
          return this.name;
        }
      });
  
      // DOM level 4
      Object.defineProperty(XMLElement.prototype, 'namespaceURI', {
        get: function() {
          return '';
        }
      });
  
      Object.defineProperty(XMLElement.prototype, 'prefix', {
        get: function() {
          return '';
        }
      });
  
      Object.defineProperty(XMLElement.prototype, 'localName', {
        get: function() {
          return this.name;
        }
      });
  
      Object.defineProperty(XMLElement.prototype, 'id', {
        get: function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
      });
  
      Object.defineProperty(XMLElement.prototype, 'className', {
        get: function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
      });
  
      Object.defineProperty(XMLElement.prototype, 'classList', {
        get: function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
      });
  
      Object.defineProperty(XMLElement.prototype, 'attributes', {
        get: function() {
          if (!this.attributeMap || !this.attributeMap.nodes) {
            this.attributeMap = new XMLNamedNodeMap(this.attribs);
          }
          return this.attributeMap;
        }
      });
  
      return XMLElement;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 4361:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Represents a map of nodes accessed by a string key
    var XMLNamedNodeMap;
  
    module.exports = XMLNamedNodeMap = (function() {
      class XMLNamedNodeMap {
        // Initializes a new instance of `XMLNamedNodeMap`
        // This is just a wrapper around an ordinary
        // JS object.
  
        // `nodes` the object containing nodes.
        constructor(nodes) {
          this.nodes = nodes;
        }
  
        // Creates and returns a deep clone of `this`
  
        clone() {
          // this class should not be cloned since it wraps
          // around a given object. The calling function should check
          // whether the wrapped object is null and supply a new object
          // (from the clone).
          return this.nodes = null;
        }
  
        // DOM Level 1
        getNamedItem(name) {
          return this.nodes[name];
        }
  
        setNamedItem(node) {
          var oldNode;
          oldNode = this.nodes[node.nodeName];
          this.nodes[node.nodeName] = node;
          return oldNode || null;
        }
  
        removeNamedItem(name) {
          var oldNode;
          oldNode = this.nodes[name];
          delete this.nodes[name];
          return oldNode || null;
        }
  
        item(index) {
          return this.nodes[Object.keys(this.nodes)[index]] || null;
        }
  
        // DOM level 2 functions to be implemented later
        getNamedItemNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented.");
        }
  
        setNamedItemNS(node) {
          throw new Error("This DOM method is not implemented.");
        }
  
        removeNamedItemNS(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented.");
        }
  
      };
  
      
      // DOM level 1
      Object.defineProperty(XMLNamedNodeMap.prototype, 'length', {
        get: function() {
          return Object.keys(this.nodes).length || 0;
        }
      });
  
      return XMLNamedNodeMap;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 7608:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var DocumentPosition, NodeType, XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLNamedNodeMap, XMLNode, XMLNodeList, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject,
      hasProp = {}.hasOwnProperty,
      splice = [].splice;
  
    ({isObject, isFunction, isEmpty, getValue} = __nccwpck_require__(8229));
  
    XMLElement = null;
  
    XMLCData = null;
  
    XMLComment = null;
  
    XMLDeclaration = null;
  
    XMLDocType = null;
  
    XMLRaw = null;
  
    XMLText = null;
  
    XMLProcessingInstruction = null;
  
    XMLDummy = null;
  
    NodeType = null;
  
    XMLNodeList = null;
  
    XMLNamedNodeMap = null;
  
    DocumentPosition = null;
  
    // Represents a generic XMl element
    module.exports = XMLNode = (function() {
      class XMLNode {
        // Initializes a new instance of `XMLNode`
  
        // `parent` the parent node
        constructor(parent1) {
          this.parent = parent1;
          if (this.parent) {
            this.options = this.parent.options;
            this.stringify = this.parent.stringify;
          }
          this.value = null;
          this.children = [];
          this.baseURI = null;
          // first execution, load dependencies that are otherwise
          // circular (so we can't load them at the top)
          if (!XMLElement) {
            XMLElement = __nccwpck_require__(9437);
            XMLCData = __nccwpck_require__(333);
            XMLComment = __nccwpck_require__(4407);
            XMLDeclaration = __nccwpck_require__(6364);
            XMLDocType = __nccwpck_require__(1801);
            XMLRaw = __nccwpck_require__(6329);
            XMLText = __nccwpck_require__(1318);
            XMLProcessingInstruction = __nccwpck_require__(6939);
            XMLDummy = __nccwpck_require__(3590);
            NodeType = __nccwpck_require__(9267);
            XMLNodeList = __nccwpck_require__(6768);
            XMLNamedNodeMap = __nccwpck_require__(4361);
            DocumentPosition = __nccwpck_require__(2839);
          }
        }
  
        
        // Sets the parent node of this node and its children recursively
  
        // `parent` the parent node
        setParent(parent) {
          var child, j, len, ref1, results;
          this.parent = parent;
          if (parent) {
            this.options = parent.options;
            this.stringify = parent.stringify;
          }
          ref1 = this.children;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            child = ref1[j];
            results.push(child.setParent(this));
          }
          return results;
        }
  
        // Creates a child element node
  
        // `name` node name or an object describing the XML tree
        // `attributes` an object containing name/value pairs of attributes
        // `text` element text
        element(name, attributes, text) {
          var childNode, item, j, k, key, lastChild, len, len1, val;
          lastChild = null;
          if (attributes === null && (text == null)) {
            [attributes, text] = [{}, null];
          }
          if (attributes == null) {
            attributes = {};
          }
          attributes = getValue(attributes);
          // swap argument order: text <-> attributes
          if (!isObject(attributes)) {
            [text, attributes] = [attributes, text];
          }
          if (name != null) {
            name = getValue(name);
          }
          // expand if array
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              item = name[j];
              lastChild = this.element(item);
            }
          // evaluate if function
          } else if (isFunction(name)) {
            lastChild = this.element(name.apply());
          // expand if object
          } else if (isObject(name)) {
            for (key in name) {
              if (!hasProp.call(name, key)) continue;
              val = name[key];
              if (isFunction(val)) {
                // evaluate if function
                val = val.apply();
              }
              // assign attributes
              if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
                lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
              // skip empty arrays
              } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
                lastChild = this.dummy();
              // empty objects produce one node
              } else if (isObject(val) && isEmpty(val)) {
                lastChild = this.element(key);
              // skip null and undefined nodes
              } else if (!this.options.keepNullNodes && (val == null)) {
                lastChild = this.dummy();
              
              // expand list by creating child nodes
              } else if (!this.options.separateArrayItems && Array.isArray(val)) {
                for (k = 0, len1 = val.length; k < len1; k++) {
                  item = val[k];
                  childNode = {};
                  childNode[key] = item;
                  lastChild = this.element(childNode);
                }
              
              // expand child nodes under parent
              } else if (isObject(val)) {
                // if the key is #text expand child nodes under this node to support mixed content
                if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
                  lastChild = this.element(val);
                } else {
                  lastChild = this.element(key);
                  lastChild.element(val);
                }
              } else {
                
                // text node
                lastChild = this.element(key, val);
              }
            }
          // skip null nodes
          } else if (!this.options.keepNullNodes && text === null) {
            lastChild = this.dummy();
          } else {
            // text node
            if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
              lastChild = this.text(text);
            // cdata node
            } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
              lastChild = this.cdata(text);
            // comment node
            } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
              lastChild = this.comment(text);
            // raw text node
            } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
              lastChild = this.raw(text);
            // processing instruction
            } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
              lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
            } else {
              // element node
              lastChild = this.node(name, attributes, text);
            }
          }
          if (lastChild == null) {
            throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
          }
          return lastChild;
        }
  
        // Creates a child element node before the current node
  
        // `name` node name or an object describing the XML tree
        // `attributes` an object containing name/value pairs of attributes
        // `text` element text
        insertBefore(name, attributes, text) {
          var child, i, newChild, refChild, removed;
          // DOM level 1
          // insertBefore(newChild, refChild) inserts the child node newChild before refChild
          if (name != null ? name.type : void 0) {
            newChild = name;
            refChild = attributes;
            newChild.setParent(this);
            if (refChild) {
              // temporarily remove children starting *with* refChild
              i = children.indexOf(refChild);
              removed = children.splice(i);
              
              // add the new child
              children.push(newChild);
              
              // add back removed children after new child
              Array.prototype.push.apply(children, removed);
            } else {
              children.push(newChild);
            }
            return newChild;
          } else {
            if (this.isRoot) {
              throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
            }
            
            // temporarily remove children starting *with* this
            i = this.parent.children.indexOf(this);
            removed = this.parent.children.splice(i);
            
            // add the new child
            child = this.parent.element(name, attributes, text);
            
            // add back removed children after new child
            Array.prototype.push.apply(this.parent.children, removed);
            return child;
          }
        }
  
        // Creates a child element node after the current node
  
        // `name` node name or an object describing the XML tree
        // `attributes` an object containing name/value pairs of attributes
        // `text` element text
        insertAfter(name, attributes, text) {
          var child, i, removed;
          if (this.isRoot) {
            throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
          }
          
          // temporarily remove children starting *after* this
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          
          // add the new child
          child = this.parent.element(name, attributes, text);
          
          // add back removed children after new child
          Array.prototype.push.apply(this.parent.children, removed);
          return child;
        }
  
        // Deletes a child element node
  
        remove() {
          var i, ref1;
          if (this.isRoot) {
            throw new Error("Cannot remove the root element. " + this.debugInfo());
          }
          i = this.parent.children.indexOf(this);
          splice.apply(this.parent.children, [i, i - i + 1].concat(ref1 = [])), ref1;
          return this.parent;
        }
  
        // Creates a node
  
        // `name` name of the node
        // `attributes` an object containing name/value pairs of attributes
        // `text` element text
        node(name, attributes, text) {
          var child;
          if (name != null) {
            name = getValue(name);
          }
          attributes || (attributes = {});
          attributes = getValue(attributes);
          // swap argument order: text <-> attributes
          if (!isObject(attributes)) {
            [text, attributes] = [attributes, text];
          }
          child = new XMLElement(this, name, attributes);
          if (text != null) {
            child.text(text);
          }
          this.children.push(child);
          return child;
        }
  
        // Creates a text node
  
        // `value` element text
        text(value) {
          var child;
          if (isObject(value)) {
            this.element(value);
          }
          child = new XMLText(this, value);
          this.children.push(child);
          return this;
        }
  
        // Creates a CDATA node
  
        // `value` element text without CDATA delimiters
        cdata(value) {
          var child;
          child = new XMLCData(this, value);
          this.children.push(child);
          return this;
        }
  
        // Creates a comment node
  
        // `value` comment text
        comment(value) {
          var child;
          child = new XMLComment(this, value);
          this.children.push(child);
          return this;
        }
  
        // Creates a comment node before the current node
  
        // `value` comment text
        commentBefore(value) {
          var child, i, removed;
          // temporarily remove children starting *with* this
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i);
          // add the new child
          child = this.parent.comment(value);
          // add back removed children after new child
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        }
  
        // Creates a comment node after the current node
  
        // `value` comment text
        commentAfter(value) {
          var child, i, removed;
          // temporarily remove children starting *after* this
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          // add the new child
          child = this.parent.comment(value);
          // add back removed children after new child
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        }
  
        // Adds unescaped raw text
  
        // `value` text
        raw(value) {
          var child;
          child = new XMLRaw(this, value);
          this.children.push(child);
          return this;
        }
  
        // Adds a dummy node
        dummy() {
          var child;
          child = new XMLDummy(this);
          // Normally when a new node is created it is added to the child node collection.
          // However, dummy nodes are never added to the XML tree. They are created while
          // converting JS objects to XML nodes in order not to break the recursive function
          // chain. They can be thought of as invisible nodes. They can be traversed through
          // by using prev(), next(), up(), etc. functions but they do not exists in the tree.
  
          // @children.push child
          return child;
        }
  
        // Adds a processing instruction
  
        // `target` instruction target
        // `value` instruction value
        instruction(target, value) {
          var insTarget, insValue, instruction, j, len;
          if (target != null) {
            target = getValue(target);
          }
          if (value != null) {
            value = getValue(value);
          }
          if (Array.isArray(target)) { // expand if array
            for (j = 0, len = target.length; j < len; j++) {
              insTarget = target[j];
              this.instruction(insTarget);
            }
          } else if (isObject(target)) { // expand if object
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget)) continue;
              insValue = target[insTarget];
              this.instruction(insTarget, insValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            instruction = new XMLProcessingInstruction(this, target, value);
            this.children.push(instruction);
          }
          return this;
        }
  
        // Creates a processing instruction node before the current node
  
        // `target` instruction target
        // `value` instruction value
        instructionBefore(target, value) {
          var child, i, removed;
          // temporarily remove children starting *with* this
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i);
          // add the new child
          child = this.parent.instruction(target, value);
          // add back removed children after new child
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        }
  
        // Creates a processing instruction node after the current node
  
        // `target` instruction target
        // `value` instruction value
        instructionAfter(target, value) {
          var child, i, removed;
          // temporarily remove children starting *after* this
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          // add the new child
          child = this.parent.instruction(target, value);
          // add back removed children after new child
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        }
  
        // Creates the xml declaration
  
        // `version` A version number string, e.g. 1.0
        // `encoding` Encoding declaration, e.g. UTF-8
        // `standalone` standalone document declaration: true or false
        declaration(version, encoding, standalone) {
          var doc, xmldec;
          doc = this.document();
          xmldec = new XMLDeclaration(doc, version, encoding, standalone);
          // Replace XML declaration if exists, otherwise insert at top
          if (doc.children.length === 0) {
            doc.children.unshift(xmldec);
          } else if (doc.children[0].type === NodeType.Declaration) {
            doc.children[0] = xmldec;
          } else {
            doc.children.unshift(xmldec);
          }
          return doc.root() || doc;
        }
  
        // Creates the document type declaration
  
        // `pubID` the public identifier of the external subset
        // `sysID` the system identifier of the external subset
        dtd(pubID, sysID) {
          var child, doc, doctype, i, j, k, len, len1, ref1, ref2;
          doc = this.document();
          doctype = new XMLDocType(doc, pubID, sysID);
          ref1 = doc.children;
          // Replace DTD if exists
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            child = ref1[i];
            if (child.type === NodeType.DocType) {
              doc.children[i] = doctype;
              return doctype;
            }
          }
          ref2 = doc.children;
          // insert before root node if the root node exists
          for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
            child = ref2[i];
            if (child.isRoot) {
              doc.children.splice(i, 0, doctype);
              return doctype;
            }
          }
          // otherwise append to end
          doc.children.push(doctype);
          return doctype;
        }
  
        // Gets the parent node
        up() {
          if (this.isRoot) {
            throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
          }
          return this.parent;
        }
  
        // Gets the root node
        root() {
          var node;
          node = this;
          while (node) {
            if (node.type === NodeType.Document) {
              return node.rootObject;
            } else if (node.isRoot) {
              return node;
            } else {
              node = node.parent;
            }
          }
        }
  
        // Gets the node representing the XML document
        document() {
          var node;
          node = this;
          while (node) {
            if (node.type === NodeType.Document) {
              return node;
            } else {
              node = node.parent;
            }
          }
        }
  
        // Ends the document and converts string
        end(options) {
          return this.document().end(options);
        }
  
        // Gets the previous node
        prev() {
          var i;
          i = this.parent.children.indexOf(this);
          if (i < 1) {
            throw new Error("Already at the first node. " + this.debugInfo());
          }
          return this.parent.children[i - 1];
        }
  
        // Gets the next node
        next() {
          var i;
          i = this.parent.children.indexOf(this);
          if (i === -1 || i === this.parent.children.length - 1) {
            throw new Error("Already at the last node. " + this.debugInfo());
          }
          return this.parent.children[i + 1];
        }
  
        // Imports cloned root from another XML document
  
        // `doc` the XML document to insert nodes from
        importDocument(doc) {
          var child, clonedRoot, j, len, ref1;
          clonedRoot = doc.root().clone();
          clonedRoot.parent = this;
          clonedRoot.isRoot = false;
          this.children.push(clonedRoot);
          // set properties if imported element becomes the root node
          if (this.type === NodeType.Document) {
            clonedRoot.isRoot = true;
            clonedRoot.documentObject = this;
            this.rootObject = clonedRoot;
            // set dtd name
            if (this.children) {
              ref1 = this.children;
              for (j = 0, len = ref1.length; j < len; j++) {
                child = ref1[j];
                if (child.type === NodeType.DocType) {
                  child.name = clonedRoot.name;
                  break;
                }
              }
            }
          }
          return this;
        }
  
        
        // Returns debug string for this node
        debugInfo(name) {
          var ref1, ref2;
          name = name || this.name;
          if ((name == null) && !((ref1 = this.parent) != null ? ref1.name : void 0)) {
            return "";
          } else if (name == null) {
            return "parent: <" + this.parent.name + ">";
          } else if (!((ref2 = this.parent) != null ? ref2.name : void 0)) {
            return "node: <" + name + ">";
          } else {
            return "node: <" + name + ">, parent: <" + this.parent.name + ">";
          }
        }
  
        // Aliases
        ele(name, attributes, text) {
          return this.element(name, attributes, text);
        }
  
        nod(name, attributes, text) {
          return this.node(name, attributes, text);
        }
  
        txt(value) {
          return this.text(value);
        }
  
        dat(value) {
          return this.cdata(value);
        }
  
        com(value) {
          return this.comment(value);
        }
  
        ins(target, value) {
          return this.instruction(target, value);
        }
  
        doc() {
          return this.document();
        }
  
        dec(version, encoding, standalone) {
          return this.declaration(version, encoding, standalone);
        }
  
        e(name, attributes, text) {
          return this.element(name, attributes, text);
        }
  
        n(name, attributes, text) {
          return this.node(name, attributes, text);
        }
  
        t(value) {
          return this.text(value);
        }
  
        d(value) {
          return this.cdata(value);
        }
  
        c(value) {
          return this.comment(value);
        }
  
        r(value) {
          return this.raw(value);
        }
  
        i(target, value) {
          return this.instruction(target, value);
        }
  
        u() {
          return this.up();
        }
  
        // can be deprecated in a future release
        importXMLBuilder(doc) {
          return this.importDocument(doc);
        }
  
        // Adds or modifies an attribute.
  
        // `name` attribute name
        // `value` attribute value
        attribute(name, value) {
          throw new Error("attribute() applies to element nodes only.");
        }
  
        att(name, value) {
          return this.attribute(name, value);
        }
  
        a(name, value) {
          return this.attribute(name, value);
        }
  
        // Removes an attribute
  
        // `name` attribute name
        removeAttribute(name) {
          throw new Error("attribute() applies to element nodes only.");
        }
  
        // DOM level 1 functions to be implemented later
        replaceChild(newChild, oldChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        removeChild(oldChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        appendChild(newChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        hasChildNodes() {
          return this.children.length !== 0;
        }
  
        cloneNode(deep) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        normalize() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM level 2
        isSupported(feature, version) {
          return true;
        }
  
        hasAttributes() {
          return this.attribs.length !== 0;
        }
  
        // DOM level 3 functions to be implemented later
        compareDocumentPosition(other) {
          var ref, res;
          ref = this;
          if (ref === other) {
            return 0;
          } else if (this.document() !== other.document()) {
            res = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific;
            if (Math.random() < 0.5) {
              res |= DocumentPosition.Preceding;
            } else {
              res |= DocumentPosition.Following;
            }
            return res;
          } else if (ref.isAncestor(other)) {
            return DocumentPosition.Contains | DocumentPosition.Preceding;
          } else if (ref.isDescendant(other)) {
            return DocumentPosition.Contains | DocumentPosition.Following;
          } else if (ref.isPreceding(other)) {
            return DocumentPosition.Preceding;
          } else {
            return DocumentPosition.Following;
          }
        }
  
        isSameNode(other) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        lookupPrefix(namespaceURI) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        isDefaultNamespace(namespaceURI) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        lookupNamespaceURI(prefix) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        isEqualNode(node) {
          var i, j, ref1;
          if (node.nodeType !== this.nodeType) {
            return false;
          }
          if (node.children.length !== this.children.length) {
            return false;
          }
          for (i = j = 0, ref1 = this.children.length - 1; (0 <= ref1 ? j <= ref1 : j >= ref1); i = 0 <= ref1 ? ++j : --j) {
            if (!this.children[i].isEqualNode(node.children[i])) {
              return false;
            }
          }
          return true;
        }
  
        getFeature(feature, version) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        setUserData(key, data, handler) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        getUserData(key) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // Returns true if other is an inclusive descendant of node,
        // and false otherwise.
        contains(other) {
          if (!other) {
            return false;
          }
          return other === this || this.isDescendant(other);
        }
  
        // An object A is called a descendant of an object B, if either A is 
        // a child of B or A is a child of an object C that is a descendant of B.
        isDescendant(node) {
          var child, isDescendantChild, j, len, ref1;
          ref1 = this.children;
          for (j = 0, len = ref1.length; j < len; j++) {
            child = ref1[j];
            if (node === child) {
              return true;
            }
            isDescendantChild = child.isDescendant(node);
            if (isDescendantChild) {
              return true;
            }
          }
          return false;
        }
  
        // An object A is called an ancestor of an object B if and only if
        // B is a descendant of A.
        isAncestor(node) {
          return node.isDescendant(this);
        }
  
        // An object A is preceding an object B if A and B are in the 
        // same tree and A comes before B in tree order.
        isPreceding(node) {
          var nodePos, thisPos;
          nodePos = this.treePosition(node);
          thisPos = this.treePosition(this);
          if (nodePos === -1 || thisPos === -1) {
            return false;
          } else {
            return nodePos < thisPos;
          }
        }
  
        // An object A is folllowing an object B if A and B are in the 
        // same tree and A comes after B in tree order.
        isFollowing(node) {
          var nodePos, thisPos;
          nodePos = this.treePosition(node);
          thisPos = this.treePosition(this);
          if (nodePos === -1 || thisPos === -1) {
            return false;
          } else {
            return nodePos > thisPos;
          }
        }
  
        // Returns the preorder position of the given node in the tree, or -1
        // if the node is not in the tree.
        treePosition(node) {
          var found, pos;
          pos = 0;
          found = false;
          this.foreachTreeNode(this.document(), function(childNode) {
            pos++;
            if (!found && childNode === node) {
              return found = true;
            }
          });
          if (found) {
            return pos;
          } else {
            return -1;
          }
        }
  
        
        // Depth-first preorder traversal through the XML tree
        foreachTreeNode(node, func) {
          var child, j, len, ref1, res;
          node || (node = this.document());
          ref1 = node.children;
          for (j = 0, len = ref1.length; j < len; j++) {
            child = ref1[j];
            if (res = func(child)) {
              return res;
            } else {
              res = this.foreachTreeNode(child, func);
              if (res) {
                return res;
              }
            }
          }
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLNode.prototype, 'nodeName', {
        get: function() {
          return this.name;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'nodeType', {
        get: function() {
          return this.type;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'nodeValue', {
        get: function() {
          return this.value;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'parentNode', {
        get: function() {
          return this.parent;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'childNodes', {
        get: function() {
          if (!this.childNodeList || !this.childNodeList.nodes) {
            this.childNodeList = new XMLNodeList(this.children);
          }
          return this.childNodeList;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'firstChild', {
        get: function() {
          return this.children[0] || null;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'lastChild', {
        get: function() {
          return this.children[this.children.length - 1] || null;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'previousSibling', {
        get: function() {
          var i;
          i = this.parent.children.indexOf(this);
          return this.parent.children[i - 1] || null;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'nextSibling', {
        get: function() {
          var i;
          i = this.parent.children.indexOf(this);
          return this.parent.children[i + 1] || null;
        }
      });
  
      Object.defineProperty(XMLNode.prototype, 'ownerDocument', {
        get: function() {
          return this.document() || null;
        }
      });
  
      // DOM level 3
      Object.defineProperty(XMLNode.prototype, 'textContent', {
        get: function() {
          var child, j, len, ref1, str;
          if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
            str = '';
            ref1 = this.children;
            for (j = 0, len = ref1.length; j < len; j++) {
              child = ref1[j];
              if (child.textContent) {
                str += child.textContent;
              }
            }
            return str;
          } else {
            return null;
          }
        },
        set: function(value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
      });
  
      return XMLNode;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 6768:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Represents a list of nodes
    var XMLNodeList;
  
    module.exports = XMLNodeList = (function() {
      class XMLNodeList {
        // Initializes a new instance of `XMLNodeList`
        // This is just a wrapper around an ordinary
        // JS array.
  
        // `nodes` the array containing nodes.
        constructor(nodes) {
          this.nodes = nodes;
        }
  
        // Creates and returns a deep clone of `this`
  
        clone() {
          // this class should not be cloned since it wraps
          // around a given array. The calling function should check
          // whether the wrapped array is null and supply a new array
          // (from the clone).
          return this.nodes = null;
        }
  
        // DOM Level 1
        item(index) {
          return this.nodes[index] || null;
        }
  
      };
  
      // DOM level 1
      Object.defineProperty(XMLNodeList.prototype, 'length', {
        get: function() {
          return this.nodes.length || 0;
        }
      });
  
      return XMLNodeList;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 6939:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLCharacterData, XMLProcessingInstruction;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLCharacterData = __nccwpck_require__(7709);
  
    // Represents a processing instruction
    module.exports = XMLProcessingInstruction = class XMLProcessingInstruction extends XMLCharacterData {
      // Initializes a new instance of `XMLProcessingInstruction`
  
      // `parent` the parent node
      // `target` instruction target
      // `value` instruction value
      constructor(parent, target, value) {
        super(parent);
        if (target == null) {
          throw new Error("Missing instruction target. " + this.debugInfo());
        }
        this.type = NodeType.ProcessingInstruction;
        this.target = this.stringify.insTarget(target);
        this.name = this.target;
        if (value) {
          this.value = this.stringify.insValue(value);
        }
      }
  
      // Creates and returns a deep clone of `this`
      clone() {
        return Object.create(this);
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options));
      }
  
      isEqualNode(node) {
        if (!super.isEqualNode(node)) {
          return false;
        }
        if (node.target !== this.target) {
          return false;
        }
        return true;
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 6329:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLNode, XMLRaw;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLNode = __nccwpck_require__(7608);
  
    // Represents a  raw node
    module.exports = XMLRaw = class XMLRaw extends XMLNode {
      // Initializes a new instance of `XMLRaw`
  
      // `text` raw text
      constructor(parent, text) {
        super(parent);
        if (text == null) {
          throw new Error("Missing raw text. " + this.debugInfo());
        }
        this.type = NodeType.Raw;
        this.value = this.stringify.raw(text);
      }
  
      // Creates and returns a deep clone of `this`
      clone() {
        return Object.create(this);
      }
  
      // Converts the XML fragment to string
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation for pretty print
      // `options.offset` how many indentations to add to every line for pretty print
      // `options.newline` newline sequence for pretty print
      toString(options) {
        return this.options.writer.raw(this, this.options.writer.filterOptions(options));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 8601:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, WriterState, XMLStreamWriter, XMLWriterBase,
      hasProp = {}.hasOwnProperty;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLWriterBase = __nccwpck_require__(6752);
  
    WriterState = __nccwpck_require__(9766);
  
    // Prints XML nodes to a stream
    module.exports = XMLStreamWriter = class XMLStreamWriter extends XMLWriterBase {
      // Initializes a new instance of `XMLStreamWriter`
  
      // `stream` output stream
      // `options.pretty` pretty prints the result
      // `options.indent` indentation string
      // `options.newline` newline sequence
      // `options.offset` a fixed number of indentations to add to every line
      // `options.allowEmpty` do not self close empty element tags
      // 'options.dontPrettyTextNodes' if any text is present in node, don't indent or LF
      // `options.spaceBeforeSlash` add a space before the closing slash of empty elements
      constructor(stream, options) {
        super(options);
        this.stream = stream;
      }
  
      endline(node, options, level) {
        if (node.isLastRootNode && options.state === WriterState.CloseTag) {
          return '';
        } else {
          return super.endline(node, options, level);
        }
      }
  
      document(doc, options) {
        var child, i, j, k, len1, len2, ref, ref1, results;
        ref = doc.children;
        // set a flag so that we don't insert a newline after the last root level node 
        for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
          child = ref[i];
          child.isLastRootNode = i === doc.children.length - 1;
        }
        options = this.filterOptions(options);
        ref1 = doc.children;
        results = [];
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          child = ref1[k];
          results.push(this.writeChildNode(child, options, 0));
        }
        return results;
      }
  
      cdata(node, options, level) {
        return this.stream.write(super.cdata(node, options, level));
      }
  
      comment(node, options, level) {
        return this.stream.write(super.comment(node, options, level));
      }
  
      declaration(node, options, level) {
        return this.stream.write(super.declaration(node, options, level));
      }
  
      docType(node, options, level) {
        var child, j, len1, ref;
        level || (level = 0);
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        this.stream.write(this.indent(node, options, level));
        this.stream.write('<!DOCTYPE ' + node.root().name);
        // external identifier
        if (node.pubID && node.sysID) {
          this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"');
        } else if (node.sysID) {
          this.stream.write(' SYSTEM "' + node.sysID + '"');
        }
        // internal subset
        if (node.children.length > 0) {
          this.stream.write(' [');
          this.stream.write(this.endline(node, options, level));
          options.state = WriterState.InsideTag;
          ref = node.children;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            child = ref[j];
            this.writeChildNode(child, options, level + 1);
          }
          options.state = WriterState.CloseTag;
          this.stream.write(']');
        }
        // close tag
        options.state = WriterState.CloseTag;
        this.stream.write(options.spaceBeforeSlash + '>');
        this.stream.write(this.endline(node, options, level));
        options.state = WriterState.None;
        return this.closeNode(node, options, level);
      }
  
      element(node, options, level) {
        var att, attLen, child, childNodeCount, firstChildNode, j, len, len1, name, prettySuppressed, r, ratt, ref, ref1, ref2, rline;
        level || (level = 0);
        // open tag
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<' + node.name;
        // attributes
        if (options.pretty && options.width > 0) {
          len = r.length;
          ref = node.attribs;
          for (name in ref) {
            if (!hasProp.call(ref, name)) continue;
            att = ref[name];
            ratt = this.attribute(att, options, level);
            attLen = ratt.length;
            if (len + attLen > options.width) {
              rline = this.indent(node, options, level + 1) + ratt;
              r += this.endline(node, options, level) + rline;
              len = rline.length;
            } else {
              rline = ' ' + ratt;
              r += rline;
              len += rline.length;
            }
          }
        } else {
          ref1 = node.attribs;
          for (name in ref1) {
            if (!hasProp.call(ref1, name)) continue;
            att = ref1[name];
            r += this.attribute(att, options, level);
          }
        }
        this.stream.write(r);
        childNodeCount = node.children.length;
        firstChildNode = childNodeCount === 0 ? null : node.children[0];
        if (childNodeCount === 0 || node.children.every(function(e) {
          return (e.type === NodeType.Text || e.type === NodeType.Raw || e.type === NodeType.CData) && e.value === '';
        })) {
          // empty element
          if (options.allowEmpty) {
            this.stream.write('>');
            options.state = WriterState.CloseTag;
            this.stream.write('</' + node.name + '>');
          } else {
            options.state = WriterState.CloseTag;
            this.stream.write(options.spaceBeforeSlash + '/>');
          }
        } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw || firstChildNode.type === NodeType.CData) && (firstChildNode.value != null)) {
          // do not indent text-only nodes
          this.stream.write('>');
          options.state = WriterState.InsideTag;
          options.suppressPrettyCount++;
          prettySuppressed = true;
          this.writeChildNode(firstChildNode, options, level + 1);
          options.suppressPrettyCount--;
          prettySuppressed = false;
          options.state = WriterState.CloseTag;
          this.stream.write('</' + node.name + '>');
        } else {
          this.stream.write('>' + this.endline(node, options, level));
          options.state = WriterState.InsideTag;
          ref2 = node.children;
          // inner tags
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            child = ref2[j];
            this.writeChildNode(child, options, level + 1);
          }
          // close tag
          options.state = WriterState.CloseTag;
          this.stream.write(this.indent(node, options, level) + '</' + node.name + '>');
        }
        this.stream.write(this.endline(node, options, level));
        options.state = WriterState.None;
        return this.closeNode(node, options, level);
      }
  
      processingInstruction(node, options, level) {
        return this.stream.write(super.processingInstruction(node, options, level));
      }
  
      raw(node, options, level) {
        return this.stream.write(super.raw(node, options, level));
      }
  
      text(node, options, level) {
        return this.stream.write(super.text(node, options, level));
      }
  
      dtdAttList(node, options, level) {
        return this.stream.write(super.dtdAttList(node, options, level));
      }
  
      dtdElement(node, options, level) {
        return this.stream.write(super.dtdElement(node, options, level));
      }
  
      dtdEntity(node, options, level) {
        return this.stream.write(super.dtdEntity(node, options, level));
      }
  
      dtdNotation(node, options, level) {
        return this.stream.write(super.dtdNotation(node, options, level));
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 5913:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var XMLStringWriter, XMLWriterBase;
  
    XMLWriterBase = __nccwpck_require__(6752);
  
    // Prints XML nodes as plain text
    module.exports = XMLStringWriter = class XMLStringWriter extends XMLWriterBase {
      // Initializes a new instance of `XMLStringWriter`
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation string
      // `options.newline` newline sequence
      // `options.offset` a fixed number of indentations to add to every line
      // `options.allowEmpty` do not self close empty element tags
      // 'options.dontPrettyTextNodes' if any text is present in node, don't indent or LF
      // `options.spaceBeforeSlash` add a space before the closing slash of empty elements
      constructor(options) {
        super(options);
      }
  
      document(doc, options) {
        var child, i, len, r, ref;
        options = this.filterOptions(options);
        r = '';
        ref = doc.children;
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          r += this.writeChildNode(child, options, 0);
        }
        // remove trailing newline
        if (options.pretty && r.slice(-options.newline.length) === options.newline) {
          r = r.slice(0, -options.newline.length);
        }
        return r;
      }
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 8594:
  /***/ (function(module) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    // Converts values to strings
    var XMLStringifier,
      hasProp = {}.hasOwnProperty;
  
    module.exports = XMLStringifier = (function() {
      class XMLStringifier {
        // Initializes a new instance of `XMLStringifier`
  
        // `options.version` The version number string of the XML spec to validate against, e.g. 1.0
        // `options.noDoubleEncoding` whether existing html entities are encoded: true or false
        // `options.stringify` a set of functions to use for converting values to strings
        // `options.noValidation` whether values will be validated and escaped or returned as is
        // `options.invalidCharReplacement` a character to replace invalid characters and disable character validation
        constructor(options) {
          var key, ref, value;
          // Checks whether the given string contains legal characters
          // Fails with an exception on error
  
          // `str` the string to check
          this.assertLegalChar = this.assertLegalChar.bind(this);
          // Checks whether the given string contains legal characters for a name
          // Fails with an exception on error
  
          // `str` the string to check
          this.assertLegalName = this.assertLegalName.bind(this);
          options || (options = {});
          this.options = options;
          if (!this.options.version) {
            this.options.version = '1.0';
          }
          ref = options.stringify || {};
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue;
            value = ref[key];
            this[key] = value;
          }
        }
  
        // Defaults
        name(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalName('' + val || '');
        }
  
        text(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar(this.textEscape('' + val || ''));
        }
  
        cdata(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = '' + val || '';
          val = val.replace(']]>', ']]]]><![CDATA[>');
          return this.assertLegalChar(val);
        }
  
        comment(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = '' + val || '';
          if (val.match(/--/)) {
            throw new Error("Comment text cannot contain double-hypen: " + val);
          }
          return this.assertLegalChar(val);
        }
  
        raw(val) {
          if (this.options.noValidation) {
            return val;
          }
          return '' + val || '';
        }
  
        attValue(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar(this.attEscape(val = '' + val || ''));
        }
  
        insTarget(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        insValue(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = '' + val || '';
          if (val.match(/\?>/)) {
            throw new Error("Invalid processing instruction value: " + val);
          }
          return this.assertLegalChar(val);
        }
  
        xmlVersion(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = '' + val || '';
          if (!val.match(/1\.[0-9]+/)) {
            throw new Error("Invalid version number: " + val);
          }
          return val;
        }
  
        xmlEncoding(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = '' + val || '';
          if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
            throw new Error("Invalid encoding: " + val);
          }
          return this.assertLegalChar(val);
        }
  
        xmlStandalone(val) {
          if (this.options.noValidation) {
            return val;
          }
          if (val) {
            return "yes";
          } else {
            return "no";
          }
        }
  
        dtdPubID(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        dtdSysID(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        dtdElementValue(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        dtdAttType(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        dtdAttDefault(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        dtdEntityValue(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        dtdNData(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar('' + val || '');
        }
  
        assertLegalChar(str) {
          var regex, res;
          if (this.options.noValidation) {
            return str;
          }
          if (this.options.version === '1.0') {
            // Valid characters from https://www.w3.org/TR/xml/#charsets
            // any Unicode character, excluding the surrogate blocks, FFFE, and FFFF.
            // #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
            // This ES5 compatible Regexp has been generated using the "regenerate" NPM module:
            //   let xml_10_InvalidChars = regenerate()
            //     .addRange(0x0000, 0x0008)
            //     .add(0x000B, 0x000C)
            //     .addRange(0x000E, 0x001F)
            //     .addRange(0xD800, 0xDFFF)
            //     .addRange(0xFFFE, 0xFFFF)
            regex = /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g;
            if (this.options.invalidCharReplacement !== void 0) {
              str = str.replace(regex, this.options.invalidCharReplacement);
            } else if (res = str.match(regex)) {
              throw new Error(`Invalid character in string: ${str} at index ${res.index}`);
            }
          } else if (this.options.version === '1.1') {
            // Valid characters from https://www.w3.org/TR/xml11/#charsets
            // any Unicode character, excluding the surrogate blocks, FFFE, and FFFF.
            // [#x1-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
            // This ES5 compatible Regexp has been generated using the "regenerate" NPM module:
            //   let xml_11_InvalidChars = regenerate()
            //     .add(0x0000)
            //     .addRange(0xD800, 0xDFFF)
            //     .addRange(0xFFFE, 0xFFFF)
            regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g;
            if (this.options.invalidCharReplacement !== void 0) {
              str = str.replace(regex, this.options.invalidCharReplacement);
            } else if (res = str.match(regex)) {
              throw new Error(`Invalid character in string: ${str} at index ${res.index}`);
            }
          }
          return str;
        }
  
        assertLegalName(str) {
          var regex;
          if (this.options.noValidation) {
            return str;
          }
          str = this.assertLegalChar(str);
          regex = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
          if (!str.match(regex)) {
            throw new Error(`Invalid character in name: ${str}`);
          }
          return str;
        }
  
        // Escapes special characters in text
  
        // See http://www.w3.org/TR/2000/WD-xml-c14n-20000119.html#charescaping
  
        // `str` the string to escape
        textEscape(str) {
          var ampregex;
          if (this.options.noValidation) {
            return str;
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&(lt|gt|amp|apos|quot);)&/g : /&/g;
          return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
        }
  
        // Escapes special characters in attribute values
  
        // See http://www.w3.org/TR/2000/WD-xml-c14n-20000119.html#charescaping
  
        // `str` the string to escape
        attEscape(str) {
          var ampregex;
          if (this.options.noValidation) {
            return str;
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&(lt|gt|amp|apos|quot);)&/g : /&/g;
          return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;');
        }
  
      };
  
      // strings to match while converting from JS objects
      XMLStringifier.prototype.convertAttKey = '@';
  
      XMLStringifier.prototype.convertPIKey = '?';
  
      XMLStringifier.prototype.convertTextKey = '#text';
  
      XMLStringifier.prototype.convertCDataKey = '#cdata';
  
      XMLStringifier.prototype.convertCommentKey = '#comment';
  
      XMLStringifier.prototype.convertRawKey = '#raw';
  
      return XMLStringifier;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 1318:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, XMLCharacterData, XMLText;
  
    NodeType = __nccwpck_require__(9267);
  
    XMLCharacterData = __nccwpck_require__(7709);
  
    // Represents a text node
    module.exports = XMLText = (function() {
      class XMLText extends XMLCharacterData {
        // Initializes a new instance of `XMLText`
  
        // `text` element text
        constructor(parent, text) {
          super(parent);
          if (text == null) {
            throw new Error("Missing element text. " + this.debugInfo());
          }
          this.name = "#text";
          this.type = NodeType.Text;
          this.value = this.stringify.text(text);
        }
  
        // Creates and returns a deep clone of `this`
        clone() {
          return Object.create(this);
        }
  
        // Converts the XML fragment to string
  
        // `options.pretty` pretty prints the result
        // `options.indent` indentation for pretty print
        // `options.offset` how many indentations to add to every line for pretty print
        // `options.newline` newline sequence for pretty print
        toString(options) {
          return this.options.writer.text(this, this.options.writer.filterOptions(options));
        }
  
        // DOM level 1 functions to be implemented later
        splitText(offset) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
        // DOM level 3 functions to be implemented later
        replaceWholeText(content) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
  
      };
  
      // DOM level 3
      Object.defineProperty(XMLText.prototype, 'isElementContentWhitespace', {
        get: function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        }
      });
  
      Object.defineProperty(XMLText.prototype, 'wholeText', {
        get: function() {
          var next, prev, str;
          str = '';
          prev = this.previousSibling;
          while (prev) {
            str = prev.data + str;
            prev = prev.previousSibling;
          }
          str += this.data;
          next = this.nextSibling;
          while (next) {
            str = str + next.data;
            next = next.nextSibling;
          }
          return str;
        }
      });
  
      return XMLText;
  
    }).call(this);
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 6752:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, WriterState, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, assign,
      hasProp = {}.hasOwnProperty;
  
    ({assign} = __nccwpck_require__(8229));
  
    NodeType = __nccwpck_require__(9267);
  
    XMLDeclaration = __nccwpck_require__(6364);
  
    XMLDocType = __nccwpck_require__(1801);
  
    XMLCData = __nccwpck_require__(333);
  
    XMLComment = __nccwpck_require__(4407);
  
    XMLElement = __nccwpck_require__(9437);
  
    XMLRaw = __nccwpck_require__(6329);
  
    XMLText = __nccwpck_require__(1318);
  
    XMLProcessingInstruction = __nccwpck_require__(6939);
  
    XMLDummy = __nccwpck_require__(3590);
  
    XMLDTDAttList = __nccwpck_require__(1015);
  
    XMLDTDElement = __nccwpck_require__(2421);
  
    XMLDTDEntity = __nccwpck_require__(53);
  
    XMLDTDNotation = __nccwpck_require__(2837);
  
    WriterState = __nccwpck_require__(9766);
  
    // Base class for XML writers
    module.exports = XMLWriterBase = class XMLWriterBase {
      // Initializes a new instance of `XMLWriterBase`
  
      // `options.pretty` pretty prints the result
      // `options.indent` indentation string
      // `options.newline` newline sequence
      // `options.offset` a fixed number of indentations to add to every line
      // `options.width` maximum column width
      // `options.allowEmpty` do not self close empty element tags
      // 'options.dontPrettyTextNodes' if any text is present in node, don't indent or LF
      // `options.spaceBeforeSlash` add a space before the closing slash of empty elements
      constructor(options) {
        var key, ref, value;
        options || (options = {});
        this.options = options;
        ref = options.writer || {};
        for (key in ref) {
          if (!hasProp.call(ref, key)) continue;
          value = ref[key];
          this["_" + key] = this[key];
          this[key] = value;
        }
      }
  
      // Filters writer options and provides defaults
  
      // `options` writer options
      filterOptions(options) {
        var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
        options || (options = {});
        options = assign({}, this.options, options);
        filteredOptions = {
          writer: this
        };
        filteredOptions.pretty = options.pretty || false;
        filteredOptions.allowEmpty = options.allowEmpty || false;
        filteredOptions.indent = (ref = options.indent) != null ? ref : '  ';
        filteredOptions.newline = (ref1 = options.newline) != null ? ref1 : '\n';
        filteredOptions.offset = (ref2 = options.offset) != null ? ref2 : 0;
        filteredOptions.width = (ref3 = options.width) != null ? ref3 : 0;
        filteredOptions.dontPrettyTextNodes = (ref4 = (ref5 = options.dontPrettyTextNodes) != null ? ref5 : options.dontprettytextnodes) != null ? ref4 : 0;
        filteredOptions.spaceBeforeSlash = (ref6 = (ref7 = options.spaceBeforeSlash) != null ? ref7 : options.spacebeforeslash) != null ? ref6 : '';
        if (filteredOptions.spaceBeforeSlash === true) {
          filteredOptions.spaceBeforeSlash = ' ';
        }
        filteredOptions.suppressPrettyCount = 0;
        filteredOptions.user = {};
        filteredOptions.state = WriterState.None;
        return filteredOptions;
      }
  
      // Returns the indentation string for the current level
  
      // `node` current node
      // `options` writer options
      // `level` current indentation level
      indent(node, options, level) {
        var indentLevel;
        if (!options.pretty || options.suppressPrettyCount) {
          return '';
        } else if (options.pretty) {
          indentLevel = (level || 0) + options.offset + 1;
          if (indentLevel > 0) {
            return new Array(indentLevel).join(options.indent);
          }
        }
        return '';
      }
  
      // Returns the newline string
  
      // `node` current node
      // `options` writer options
      // `level` current indentation level
      endline(node, options, level) {
        if (!options.pretty || options.suppressPrettyCount) {
          return '';
        } else {
          return options.newline;
        }
      }
  
      attribute(att, options, level) {
        var r;
        this.openAttribute(att, options, level);
        if (options.pretty && options.width > 0) {
          r = att.name + '="' + att.value + '"';
        } else {
          r = ' ' + att.name + '="' + att.value + '"';
        }
        this.closeAttribute(att, options, level);
        return r;
      }
  
      cdata(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<![CDATA[';
        options.state = WriterState.InsideTag;
        r += node.value;
        options.state = WriterState.CloseTag;
        r += ']]>' + this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      comment(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<!-- ';
        options.state = WriterState.InsideTag;
        r += node.value;
        options.state = WriterState.CloseTag;
        r += ' -->' + this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      declaration(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<?xml';
        options.state = WriterState.InsideTag;
        r += ' version="' + node.version + '"';
        if (node.encoding != null) {
          r += ' encoding="' + node.encoding + '"';
        }
        if (node.standalone != null) {
          r += ' standalone="' + node.standalone + '"';
        }
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '?>';
        r += this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      docType(node, options, level) {
        var child, i, len1, r, ref;
        level || (level = 0);
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level);
        r += '<!DOCTYPE ' + node.root().name;
        // external identifier
        if (node.pubID && node.sysID) {
          r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
        } else if (node.sysID) {
          r += ' SYSTEM "' + node.sysID + '"';
        }
        // internal subset
        if (node.children.length > 0) {
          r += ' [';
          r += this.endline(node, options, level);
          options.state = WriterState.InsideTag;
          ref = node.children;
          for (i = 0, len1 = ref.length; i < len1; i++) {
            child = ref[i];
            r += this.writeChildNode(child, options, level + 1);
          }
          options.state = WriterState.CloseTag;
          r += ']';
        }
        // close tag
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '>';
        r += this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      element(node, options, level) {
        var att, attLen, child, childNodeCount, firstChildNode, i, j, len, len1, len2, name, prettySuppressed, r, ratt, ref, ref1, ref2, ref3, rline;
        level || (level = 0);
        prettySuppressed = false;
        // open tag
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<' + node.name;
        // attributes
        if (options.pretty && options.width > 0) {
          len = r.length;
          ref = node.attribs;
          for (name in ref) {
            if (!hasProp.call(ref, name)) continue;
            att = ref[name];
            ratt = this.attribute(att, options, level);
            attLen = ratt.length;
            if (len + attLen > options.width) {
              rline = this.indent(node, options, level + 1) + ratt;
              r += this.endline(node, options, level) + rline;
              len = rline.length;
            } else {
              rline = ' ' + ratt;
              r += rline;
              len += rline.length;
            }
          }
        } else {
          ref1 = node.attribs;
          for (name in ref1) {
            if (!hasProp.call(ref1, name)) continue;
            att = ref1[name];
            r += this.attribute(att, options, level);
          }
        }
        childNodeCount = node.children.length;
        firstChildNode = childNodeCount === 0 ? null : node.children[0];
        if (childNodeCount === 0 || node.children.every(function(e) {
          return (e.type === NodeType.Text || e.type === NodeType.Raw || e.type === NodeType.CData) && e.value === '';
        })) {
          // empty element
          if (options.allowEmpty) {
            r += '>';
            options.state = WriterState.CloseTag;
            r += '</' + node.name + '>' + this.endline(node, options, level);
          } else {
            options.state = WriterState.CloseTag;
            r += options.spaceBeforeSlash + '/>' + this.endline(node, options, level);
          }
        } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw || firstChildNode.type === NodeType.CData) && (firstChildNode.value != null)) {
          // do not indent text-only nodes
          r += '>';
          options.state = WriterState.InsideTag;
          options.suppressPrettyCount++;
          prettySuppressed = true;
          r += this.writeChildNode(firstChildNode, options, level + 1);
          options.suppressPrettyCount--;
          prettySuppressed = false;
          options.state = WriterState.CloseTag;
          r += '</' + node.name + '>' + this.endline(node, options, level);
        } else {
          // if ANY are a text node, then suppress pretty now
          if (options.dontPrettyTextNodes) {
            ref2 = node.children;
            for (i = 0, len1 = ref2.length; i < len1; i++) {
              child = ref2[i];
              if ((child.type === NodeType.Text || child.type === NodeType.Raw || child.type === NodeType.CData) && (child.value != null)) {
                options.suppressPrettyCount++;
                prettySuppressed = true;
                break;
              }
            }
          }
          // close the opening tag, after dealing with newline
          r += '>' + this.endline(node, options, level);
          options.state = WriterState.InsideTag;
          ref3 = node.children;
          // inner tags
          for (j = 0, len2 = ref3.length; j < len2; j++) {
            child = ref3[j];
            r += this.writeChildNode(child, options, level + 1);
          }
          // close tag
          options.state = WriterState.CloseTag;
          r += this.indent(node, options, level) + '</' + node.name + '>';
          if (prettySuppressed) {
            options.suppressPrettyCount--;
          }
          r += this.endline(node, options, level);
          options.state = WriterState.None;
        }
        this.closeNode(node, options, level);
        return r;
      }
  
      writeChildNode(node, options, level) {
        switch (node.type) {
          case NodeType.CData:
            return this.cdata(node, options, level);
          case NodeType.Comment:
            return this.comment(node, options, level);
          case NodeType.Element:
            return this.element(node, options, level);
          case NodeType.Raw:
            return this.raw(node, options, level);
          case NodeType.Text:
            return this.text(node, options, level);
          case NodeType.ProcessingInstruction:
            return this.processingInstruction(node, options, level);
          case NodeType.Dummy:
            return '';
          case NodeType.Declaration:
            return this.declaration(node, options, level);
          case NodeType.DocType:
            return this.docType(node, options, level);
          case NodeType.AttributeDeclaration:
            return this.dtdAttList(node, options, level);
          case NodeType.ElementDeclaration:
            return this.dtdElement(node, options, level);
          case NodeType.EntityDeclaration:
            return this.dtdEntity(node, options, level);
          case NodeType.NotationDeclaration:
            return this.dtdNotation(node, options, level);
          default:
            throw new Error("Unknown XML node type: " + node.constructor.name);
        }
      }
  
      processingInstruction(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<?';
        options.state = WriterState.InsideTag;
        r += node.target;
        if (node.value) {
          r += ' ' + node.value;
        }
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '?>';
        r += this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      raw(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level);
        options.state = WriterState.InsideTag;
        r += node.value;
        options.state = WriterState.CloseTag;
        r += this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      text(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level);
        options.state = WriterState.InsideTag;
        r += node.value;
        options.state = WriterState.CloseTag;
        r += this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      dtdAttList(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<!ATTLIST';
        options.state = WriterState.InsideTag;
        r += ' ' + node.elementName + ' ' + node.attributeName + ' ' + node.attributeType;
        if (node.defaultValueType !== '#DEFAULT') {
          r += ' ' + node.defaultValueType;
        }
        if (node.defaultValue) {
          r += ' "' + node.defaultValue + '"';
        }
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      dtdElement(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<!ELEMENT';
        options.state = WriterState.InsideTag;
        r += ' ' + node.name + ' ' + node.value;
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      dtdEntity(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<!ENTITY';
        options.state = WriterState.InsideTag;
        if (node.pe) {
          r += ' %';
        }
        r += ' ' + node.name;
        if (node.value) {
          r += ' "' + node.value + '"';
        } else {
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"';
          }
          if (node.nData) {
            r += ' NDATA ' + node.nData;
          }
        }
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      dtdNotation(node, options, level) {
        var r;
        this.openNode(node, options, level);
        options.state = WriterState.OpenTag;
        r = this.indent(node, options, level) + '<!NOTATION';
        options.state = WriterState.InsideTag;
        r += ' ' + node.name;
        if (node.pubID && node.sysID) {
          r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
        } else if (node.pubID) {
          r += ' PUBLIC "' + node.pubID + '"';
        } else if (node.sysID) {
          r += ' SYSTEM "' + node.sysID + '"';
        }
        options.state = WriterState.CloseTag;
        r += options.spaceBeforeSlash + '>' + this.endline(node, options, level);
        options.state = WriterState.None;
        this.closeNode(node, options, level);
        return r;
      }
  
      openNode(node, options, level) {}
  
      closeNode(node, options, level) {}
  
      openAttribute(att, options, level) {}
  
      closeAttribute(att, options, level) {}
  
    };
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 2958:
  /***/ (function(module, __unused_webpack_exports, __nccwpck_require__) {
  
  // Generated by CoffeeScript 2.4.1
  (function() {
    var NodeType, WriterState, XMLDOMImplementation, XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction;
  
    ({assign, isFunction} = __nccwpck_require__(8229));
  
    XMLDOMImplementation = __nccwpck_require__(8310);
  
    XMLDocument = __nccwpck_require__(3730);
  
    XMLDocumentCB = __nccwpck_require__(7356);
  
    XMLStringWriter = __nccwpck_require__(5913);
  
    XMLStreamWriter = __nccwpck_require__(8601);
  
    NodeType = __nccwpck_require__(9267);
  
    WriterState = __nccwpck_require__(9766);
  
    // Creates a new document and returns the root node for
    // chain-building the document tree
  
    // `name` name of the root element
  
    // `xmldec.version` A version number string, e.g. 1.0
    // `xmldec.encoding` Encoding declaration, e.g. UTF-8
    // `xmldec.standalone` standalone document declaration: true or false
  
    // `doctype.pubID` public identifier of the external subset
    // `doctype.sysID` system identifier of the external subset
  
    // `options.headless` whether XML declaration and doctype will be included:
    //     true or false
    // `options.keepNullNodes` whether nodes with null values will be kept
    //     or ignored: true or false
    // `options.keepNullAttributes` whether attributes with null values will be
    //     kept or ignored: true or false
    // `options.ignoreDecorators` whether decorator strings will be ignored when
    //     converting JS objects: true or false
    // `options.separateArrayItems` whether array items are created as separate
    //     nodes when passed as an object value: true or false
    // `options.noDoubleEncoding` whether existing html entities are encoded:
    //     true or false
    // `options.stringify` a set of functions to use for converting values to
    //     strings
    // `options.writer` the default XML writer to use for converting nodes to
    //     string. If the default writer is not set, the built-in XMLStringWriter
    //     will be used instead.
    module.exports.create = function(name, xmldec, doctype, options) {
      var doc, root;
      if (name == null) {
        throw new Error("Root element needs a name.");
      }
      options = assign({}, xmldec, doctype, options);
      // create the document node
      doc = new XMLDocument(options);
      // add the root node
      root = doc.element(name);
      // prolog
      if (!options.headless) {
        doc.declaration(options);
        if ((options.pubID != null) || (options.sysID != null)) {
          doc.dtd(options);
        }
      }
      return root;
    };
  
    // Creates a new document and returns the document node for
    // chain-building the document tree
  
    // `options.keepNullNodes` whether nodes with null values will be kept
    //     or ignored: true or false
    // `options.keepNullAttributes` whether attributes with null values will be
    //     kept or ignored: true or false
    // `options.ignoreDecorators` whether decorator strings will be ignored when
    //     converting JS objects: true or false
    // `options.separateArrayItems` whether array items are created as separate
    //     nodes when passed as an object value: true or false
    // `options.noDoubleEncoding` whether existing html entities are encoded:
    //     true or false
    // `options.stringify` a set of functions to use for converting values to
    //     strings
    // `options.writer` the default XML writer to use for converting nodes to
    //     string. If the default writer is not set, the built-in XMLStringWriter
    //     will be used instead.
  
    // `onData` the function to be called when a new chunk of XML is output. The
    //          string containing the XML chunk is passed to `onData` as its single
    //          argument.
    // `onEnd`  the function to be called when the XML document is completed with
    //          `end`. `onEnd` does not receive any arguments.
    module.exports.begin = function(options, onData, onEnd) {
      if (isFunction(options)) {
        [onData, onEnd] = [options, onData];
        options = {};
      }
      if (onData) {
        return new XMLDocumentCB(options, onData, onEnd);
      } else {
        return new XMLDocument(options);
      }
    };
  
    module.exports.stringWriter = function(options) {
      return new XMLStringWriter(options);
    };
  
    module.exports.streamWriter = function(stream, options) {
      return new XMLStreamWriter(stream, options);
    };
  
    module.exports.implementation = new XMLDOMImplementation();
  
    module.exports.nodeType = NodeType;
  
    module.exports.writerState = WriterState;
  
  }).call(this);
  
  
  /***/ }),
  
  /***/ 4091:
  /***/ ((module) => {
  
  "use strict";
  
  module.exports = function (Yallist) {
    Yallist.prototype[Symbol.iterator] = function* () {
      for (let walker = this.head; walker; walker = walker.next) {
        yield walker.value
      }
    }
  }
  
  
  /***/ }),
  
  /***/ 665:
  /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
  
  "use strict";
  
  module.exports = Yallist
  
  Yallist.Node = Node
  Yallist.create = Yallist
  
  function Yallist (list) {
    var self = this
    if (!(self instanceof Yallist)) {
      self = new Yallist()
    }
  
    self.tail = null
    self.head = null
    self.length = 0
  
    if (list && typeof list.forEach === 'function') {
      list.forEach(function (item) {
        self.push(item)
      })
    } else if (arguments.length > 0) {
      for (var i = 0, l = arguments.length; i < l; i++) {
        self.push(arguments[i])
      }
    }
  
    return self
  }
  
  Yallist.prototype.removeNode = function (node) {
    if (node.list !== this) {
      throw new Error('removing node which does not belong to this list')
    }
  
    var next = node.next
    var prev = node.prev
  
    if (next) {
      next.prev = prev
    }
  
    if (prev) {
      prev.next = next
    }
  
    if (node === this.head) {
      this.head = next
    }
    if (node === this.tail) {
      this.tail = prev
    }
  
    node.list.length--
    node.next = null
    node.prev = null
    node.list = null
  
    return next
  }
  
  Yallist.prototype.unshiftNode = function (node) {
    if (node === this.head) {
      return
    }
  
    if (node.list) {
      node.list.removeNode(node)
    }
  
    var head = this.head
    node.list = this
    node.next = head
    if (head) {
      head.prev = node
    }
  
    this.head = node
    if (!this.tail) {
      this.tail = node
    }
    this.length++
  }
  
  Yallist.prototype.pushNode = function (node) {
    if (node === this.tail) {
      return
    }
  
    if (node.list) {
      node.list.removeNode(node)
    }
  
    var tail = this.tail
    node.list = this
    node.prev = tail
    if (tail) {
      tail.next = node
    }
  
    this.tail = node
    if (!this.head) {
      this.head = node
    }
    this.length++
  }
  
  Yallist.prototype.push = function () {
    for (var i = 0, l = arguments.length; i < l; i++) {
      push(this, arguments[i])
    }
    return this.length
  }
  
  Yallist.prototype.unshift = function () {
    for (var i = 0, l = arguments.length; i < l; i++) {
      unshift(this, arguments[i])
    }
    return this.length
  }
  
  Yallist.prototype.pop = function () {
    if (!this.tail) {
      return undefined
    }
  
    var res = this.tail.value
    this.tail = this.tail.prev
    if (this.tail) {
      this.tail.next = null
    } else {
      this.head = null
    }
    this.length--
    return res
  }
  
  Yallist.prototype.shift = function () {
    if (!this.head) {
      return undefined
    }
  
    var res = this.head.value
    this.head = this.head.next
    if (this.head) {
      this.head.prev = null
    } else {
      this.tail = null
    }
    this.length--
    return res
  }
  
  Yallist.prototype.forEach = function (fn, thisp) {
    thisp = thisp || this
    for (var walker = this.head, i = 0; walker !== null; i++) {
      fn.call(thisp, walker.value, i, this)
      walker = walker.next
    }
  }
  
  Yallist.prototype.forEachReverse = function (fn, thisp) {
    thisp = thisp || this
    for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
      fn.call(thisp, walker.value, i, this)
      walker = walker.prev
    }
  }
  
  Yallist.prototype.get = function (n) {
    for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
      // abort out of the list early if we hit a cycle
      walker = walker.next
    }
    if (i === n && walker !== null) {
      return walker.value
    }
  }
  
  Yallist.prototype.getReverse = function (n) {
    for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
      // abort out of the list early if we hit a cycle
      walker = walker.prev
    }
    if (i === n && walker !== null) {
      return walker.value
    }
  }
  
  Yallist.prototype.map = function (fn, thisp) {
    thisp = thisp || this
    var res = new Yallist()
    for (var walker = this.head; walker !== null;) {
      res.push(fn.call(thisp, walker.value, this))
      walker = walker.next
    }
    return res
  }
  
  Yallist.prototype.mapReverse = function (fn, thisp) {
    thisp = thisp || this
    var res = new Yallist()
    for (var walker = this.tail; walker !== null;) {
      res.push(fn.call(thisp, walker.value, this))
      walker = walker.prev
    }
    return res
  }
  
  Yallist.prototype.reduce = function (fn, initial) {
    var acc
    var walker = this.head
    if (arguments.length > 1) {
      acc = initial
    } else if (this.head) {
      walker = this.head.next
      acc = this.head.value
    } else {
      throw new TypeError('Reduce of empty list with no initial value')
    }
  
    for (var i = 0; walker !== null; i++) {
      acc = fn(acc, walker.value, i)
      walker = walker.next
    }
  
    return acc
  }
  
  Yallist.prototype.reduceReverse = function (fn, initial) {
    var acc
    var walker = this.tail
    if (arguments.length > 1) {
      acc = initial
    } else if (this.tail) {
      walker = this.tail.prev
      acc = this.tail.value
    } else {
      throw new TypeError('Reduce of empty list with no initial value')
    }
  
    for (var i = this.length - 1; walker !== null; i--) {
      acc = fn(acc, walker.value, i)
      walker = walker.prev
    }
  
    return acc
  }
  
  Yallist.prototype.toArray = function () {
    var arr = new Array(this.length)
    for (var i = 0, walker = this.head; walker !== null; i++) {
      arr[i] = walker.value
      walker = walker.next
    }
    return arr
  }
  
  Yallist.prototype.toArrayReverse = function () {
    var arr = new Array(this.length)
    for (var i = 0, walker = this.tail; walker !== null; i++) {
      arr[i] = walker.value
      walker = walker.prev
    }
    return arr
  }
  
  Yallist.prototype.slice = function (from, to) {
    to = to || this.length
    if (to < 0) {
      to += this.length
    }
    from = from || 0
    if (from < 0) {
      from += this.length
    }
    var ret = new Yallist()
    if (to < from || to < 0) {
      return ret
    }
    if (from < 0) {
      from = 0
    }
    if (to > this.length) {
      to = this.length
    }
    for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
      walker = walker.next
    }
    for (; walker !== null && i < to; i++, walker = walker.next) {
      ret.push(walker.value)
    }
    return ret
  }
  
  Yallist.prototype.sliceReverse = function (from, to) {
    to = to || this.length
    if (to < 0) {
      to += this.length
    }
    from = from || 0
    if (from < 0) {
      from += this.length
    }
    var ret = new Yallist()
    if (to < from || to < 0) {
      return ret
    }
    if (from < 0) {
      from = 0
    }
    if (to > this.length) {
      to = this.length
    }
    for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
      walker = walker.prev
    }
    for (; walker !== null && i > from; i--, walker = walker.prev) {
      ret.push(walker.value)
    }
    return ret
  }
  
  Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
    if (start > this.length) {
      start = this.length - 1
    }
    if (start < 0) {
      start = this.length + start;
    }
  
    for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
      walker = walker.next
    }
  
    var ret = []
    for (var i = 0; walker && i < deleteCount; i++) {
      ret.push(walker.value)
      walker = this.removeNode(walker)
    }
    if (walker === null) {
      walker = this.tail
    }
  
    if (walker !== this.head && walker !== this.tail) {
      walker = walker.prev
    }
  
    for (var i = 0; i < nodes.length; i++) {
      walker = insert(this, walker, nodes[i])
    }
    return ret;
  }
  
  Yallist.prototype.reverse = function () {
    var head = this.head
    var tail = this.tail
    for (var walker = head; walker !== null; walker = walker.prev) {
      var p = walker.prev
      walker.prev = walker.next
      walker.next = p
    }
    this.head = tail
    this.tail = head
    return this
  }
  
  function insert (self, node, value) {
    var inserted = node === self.head ?
      new Node(value, null, node, self) :
      new Node(value, node, node.next, self)
  
    if (inserted.next === null) {
      self.tail = inserted
    }
    if (inserted.prev === null) {
      self.head = inserted
    }
  
    self.length++
  
    return inserted
  }
  
  function push (self, item) {
    self.tail = new Node(item, self.tail, null, self)
    if (!self.head) {
      self.head = self.tail
    }
    self.length++
  }
  
  function unshift (self, item) {
    self.head = new Node(item, null, self.head, self)
    if (!self.tail) {
      self.tail = self.head
    }
    self.length++
  }
  
  function Node (value, prev, next, list) {
    if (!(this instanceof Node)) {
      return new Node(value, prev, next, list)
    }
  
    this.list = list
    this.value = value
  
    if (prev) {
      prev.next = this
      this.prev = prev
    } else {
      this.prev = null
    }
  
    if (next) {
      next.prev = this
      this.next = next
    } else {
      this.next = null
    }
  }
  
  try {
    // add if support for Symbol.iterator is present
    __nccwpck_require__(4091)(Yallist)
  } catch (er) {}
  
  
  /***/ }),
  
  /***/ 9491:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("assert");
  
  /***/ }),
  
  /***/ 2081:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("child_process");
  
  /***/ }),
  
  /***/ 6113:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("crypto");
  
  /***/ }),
  
  /***/ 2361:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("events");
  
  /***/ }),
  
  /***/ 7147:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("fs");
  
  /***/ }),
  
  /***/ 3685:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("http");
  
  /***/ }),
  
  /***/ 5687:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("https");
  
  /***/ }),
  
  /***/ 1808:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("net");
  
  /***/ }),
  
  /***/ 2037:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("os");
  
  /***/ }),
  
  /***/ 1017:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("path");
  
  /***/ }),
  
  /***/ 4404:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("tls");
  
  /***/ }),
  
  /***/ 3837:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("util");
  
  /***/ })
  
  /******/ 	});
  /************************************************************************/
  /******/ 	// The module cache
  /******/ 	var __webpack_module_cache__ = {};
  /******/ 	
  /******/ 	// The require function
  /******/ 	function __nccwpck_require__(moduleId) {
  /******/ 		// Check if module is in cache
  /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
  /******/ 		if (cachedModule !== undefined) {
  /******/ 			return cachedModule.exports;
  /******/ 		}
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = __webpack_module_cache__[moduleId] = {
  /******/ 			// no module.id needed
  /******/ 			// no module.loaded needed
  /******/ 			exports: {}
  /******/ 		};
  /******/ 	
  /******/ 		// Execute the module function
  /******/ 		var threw = true;
  /******/ 		try {
  /******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
  /******/ 			threw = false;
  /******/ 		} finally {
  /******/ 			if(threw) delete __webpack_module_cache__[moduleId];
  /******/ 		}
  /******/ 	
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/ 	
  /************************************************************************/
  /******/ 	/* webpack/runtime/compat */
  /******/ 	
  /******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
  /******/ 	
  /************************************************************************/
  /******/ 	
  /******/ 	// startup
  /******/ 	// Load entry module and return exports
  /******/ 	// This entry module is referenced by other modules so it can't be inlined
  /******/ 	var __webpack_exports__ = __nccwpck_require__(8472);
  /******/ 	module.exports = __webpack_exports__;
  /******/ 	
  /******/ })()
  ;