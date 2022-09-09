import { TrzszFilter } from "trzsz";
import { ConfigService } from "tabby-core";
import { ElectronHostWindow, ElectronService } from "tabby-electron";
import { SessionMiddleware, BaseTerminalTabComponent } from "tabby-terminal";

export class TrzszSessionMiddleware extends SessionMiddleware {
  public trzsz: TrzszFilter;

  constructor(
    private config: ConfigService,
    hostWindow: ElectronHostWindow,
    electron: ElectronService,
    terminal: BaseTerminalTabComponent,
    isWindowsShell: boolean
  ) {
    super();
    this.trzsz = new TrzszFilter({
      writeToTerminal: (data) => super.feedFromSession(data as Buffer),
      sendToServer: (data) => super.feedFromTerminal(data as Buffer),
      terminalColumns: terminal.size.columns,
      isWindowsShell: isWindowsShell,
      chooseSendFiles: async (directory) => {
        const properties = [
          "openFile",
          "multiSelections",
          "showHiddenFiles",
          "noResolveAliases",
          "treatPackageAsDirectory",
          "dontAddToRecent",
        ];
        if (directory) {
          properties.push("openDirectory");
        }
        const result = await electron.dialog.showOpenDialog(hostWindow.getWindow(), {
          defaultPath: this.config.store.trzszPlugin.defaultUploadPath,
          title: "Choose some files to send",
          message: "Choose some files to send",
          properties: properties,
        });
        return result.filePaths;
      },
      chooseSaveDirectory: async () => {
        const defaultPath = this.config.store.trzszPlugin.defaultDownloadPath;
        if (defaultPath && defaultPath.length) {
          return defaultPath;
        }
        const result = await electron.dialog.showOpenDialog(hostWindow.getWindow(), {
          title: "Choose a folder to save file(s)",
          message: "Choose a folder to save file(s)",
          properties: [
            "openDirectory",
            "showHiddenFiles",
            "createDirectory",
            "noResolveAliases",
            "treatPackageAsDirectory",
            "dontAddToRecent",
          ],
        });
        if (!result.filePaths.length) {
          return undefined;
        }
        return result.filePaths[0];
      },
    });
  }

  feedFromSession(data: Buffer): void {
    this.trzsz.processServerOutput(data);
  }

  feedFromTerminal(data: Buffer): void {
    this.trzsz.processTerminalInput(data as any);
  }
}
