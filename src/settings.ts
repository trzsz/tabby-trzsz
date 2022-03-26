import { Injectable } from "@angular/core";
import { SettingsTabProvider } from "tabby-settings";

import { TrzszSettingsTabComponent } from "./settings.component";

@Injectable() // eslint-disable-line new-cap
export class TrzszSettingsTabProvider extends SettingsTabProvider {
  id = "trzsz";
  icon = "copy";
  title = "Trzsz";

  getComponentType(): any {
    return TrzszSettingsTabComponent;
  }
}
