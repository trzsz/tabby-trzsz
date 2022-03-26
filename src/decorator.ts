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

  attach(terminal: BaseTerminalTabComponent): void {
    const middleware = new TrzszSessionMiddleware(this.config, this.hostWindow, this.electron, terminal);
    setTimeout(() => {
      this.attachToSession(middleware, terminal);
      this.subscribeUntilDetached(
        terminal,
        terminal.resize$.subscribe((size) => middleware.trzsz.setTerminalColumns(size.columns))
      );
      this.subscribeUntilDetached(
        terminal,
        terminal.sessionChanged$.subscribe(() => this.attachToSession(middleware, terminal))
      );
      this.subscribeUntilDetached(
        terminal,
        this.cancelEvent.subscribe(() => {
          if (terminal.hasFocus) {
            middleware.trzsz.stopTransferringFiles();
          }
        })
      );
    });
  }

  private attachToSession(middleware, terminal) {
    if (!terminal.session) {
      return;
    }
    terminal.session.middleware.push(middleware);
  }
}
