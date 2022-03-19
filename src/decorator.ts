import { TrzszFilter } from "trzsz";
import { Injectable } from "@angular/core";
import { Observable, filter } from "rxjs";
import { HotkeysService } from "tabby-core";
import { ElectronHostWindow, ElectronService } from "tabby-electron";
import { TerminalDecorator, BaseTerminalTabComponent } from "tabby-terminal";

@Injectable() // eslint-disable-line new-cap
export class TrzszDecorator extends TerminalDecorator {
  private cancelEvent: Observable<any>;

  constructor(hotkeys: HotkeysService, private hostWindow: ElectronHostWindow, private electron: ElectronService) {
    super();
    this.cancelEvent = hotkeys.hotkey$.pipe(filter((x) => x === "ctrl-c"));
  }

  attach(terminal: BaseTerminalTabComponent): void {
    const trzsz = new TrzszFilter({
      writeToTerminal: (data) => {
        if (!terminal.enablePassthrough) {
          terminal.write(data);
        }
      },
      sendToServer: (data) => terminal.session!.feedFromTerminal(Buffer.from(data)),
      terminalColumns: terminal.size.columns,
      onTrzszAttach: () => (terminal.enablePassthrough = false),
      onTrzszDetach: () => (terminal.enablePassthrough = true),
      chooseSendFiles: async () => {
        const result = await this.electron.dialog.showOpenDialog(this.hostWindow.getWindow(), {
          title: "Choose some files to send",
          message: "Choose some files to send",
          properties: [
            "openFile",
            "multiSelections",
            "showHiddenFiles",
            "noResolveAliases",
            "treatPackageAsDirectory",
            "dontAddToRecent",
          ],
        });
        return result.filePaths;
      },
      chooseSaveDirectory: async () => {
        const result = await this.electron.dialog.showOpenDialog(this.hostWindow.getWindow(), {
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

    setTimeout(() => {
      this.attachToSession(trzsz, terminal);
      this.subscribeUntilDetached(
        terminal,
        terminal.resize$.subscribe((size) => trzsz.setTerminalColumns(size.columns))
      );
      this.subscribeUntilDetached(
        terminal,
        terminal.sessionChanged$.subscribe(() => this.attachToSession(trzsz, terminal))
      );
      this.subscribeUntilDetached(
        terminal,
        this.cancelEvent.subscribe(() => {
          if (terminal.hasFocus) {
            trzsz.stopTransferringFiles();
          }
        })
      );
    });
  }

  private attachToSession(trzsz, terminal) {
    if (!terminal.session) {
      return;
    }
    this.subscribeUntilDetached(
      terminal,
      terminal.session.binaryOutput$.subscribe((data) => trzsz.processServerOutput(data))
    );
  }
}
