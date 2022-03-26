import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import TabbyCoreModule, { ConfigProvider } from "tabby-core";
import { TerminalDecorator } from "tabby-terminal";
import { SettingsTabProvider } from "tabby-settings";
import { TrzszDecorator } from "./decorator";
import { TrzszConfigProvider } from "./config";
import { TrzszSettingsTabProvider } from "./settings";
import { TrzszSettingsTabComponent } from "./settings.component";

// eslint-disable-next-line new-cap
@NgModule({
  imports: [CommonModule, FormsModule, TabbyCoreModule],
  providers: [
    { provide: ConfigProvider, useClass: TrzszConfigProvider, multi: true },
    { provide: SettingsTabProvider, useClass: TrzszSettingsTabProvider, multi: true },
    { provide: TerminalDecorator, useClass: TrzszDecorator, multi: true },
  ],
  entryComponents: [TrzszSettingsTabComponent],
  declarations: [TrzszSettingsTabComponent],
})
export default class TrzszModule {}
