import { NgModule } from "@angular/core";
import { TerminalDecorator } from "tabby-terminal";
import { TrzszDecorator } from "./decorator";

// eslint-disable-next-line new-cap
@NgModule({
  providers: [{ provide: TerminalDecorator, useClass: TrzszDecorator, multi: true }],
})
export default class TrzszModule {}
