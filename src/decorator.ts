import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { ConfigService, HotkeysService } from "tabby-core";
import { TrzszSessionMiddleware } from "./middleware";
import { ElectronHostWindow, ElectronService } from "tabby-electron";
import { TerminalDecorator, BaseTerminalTabComponent } from "tabby-terminal";

@Injectable() // eslint-disable-line new-cap
export class TrzszDecorator extends TerminalDecorator {
  private cancelEvent: Observable<any>;

  constructor(
    private config: ConfigService,
    hotkeys: HotkeysService,
    private hostWindow: ElectronHostWindow,
    private electron: ElectronService
  ) {
    super();
    this.cancelEvent = hotkeys.hotkey$.pipe(filter((x) => x === "ctrl-c"));
  }

  attach(terminal: BaseTerminalTabComponent<any>): void {
    const isWindowsShell = process.platform === "win32" && (terminal as any).profile?.type === "local";
    setTimeout(() => {
      terminal.element.nativeElement.querySelector(".terminal").addEventListener("drop", (event: any) => {
        if (this.config.store.trzszPlugin.enableDragUpload) {
          event.stopPropagation();
          if ((terminal as any).trzsz) {
            (terminal as any).trzsz.uploadFiles(event.dataTransfer.items).catch((err: any) => console.log(err));
          }
        }
      });
      this.attachToSession(terminal, isWindowsShell);
      this.subscribeUntilDetached(
        terminal,
        terminal.resize$.subscribe((size) => {
          if ((terminal as any).trzsz) {
            (terminal as any).trzsz.setTerminalColumns(size.columns);
          }
        })
      );
      this.subscribeUntilDetached(
        terminal,
        terminal.sessionChanged$.subscribe(() => this.attachToSession(terminal, isWindowsShell))
      );
      this.subscribeUntilDetached(
        terminal,
        this.cancelEvent.subscribe(() => {
          if (terminal.hasFocus && (terminal as any).trzsz) {
            (terminal as any).trzsz.stopTransferringFiles();
          }
        })
      );
    });
  }

  private attachToSession(terminal: BaseTerminalTabComponent<any>, isWindowsShell: boolean) {
    if (!terminal.session) {
      return;
    }
    const middleware = new TrzszSessionMiddleware(
      this.config,
      this.hostWindow,
      this.electron,
      terminal,
      isWindowsShell
    );
    terminal.session.middleware.push(middleware);
    (terminal as any).trzsz = middleware.trzsz;
  }
}
