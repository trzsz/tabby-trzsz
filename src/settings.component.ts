import { Component } from "@angular/core";
import { ConfigService } from "tabby-core";

// eslint-disable-next-line new-cap
@Component({
  template: require("./settings.component.pug"),
  styles: [require("./settings.component.scss")],
})
export class TrzszSettingsTabComponent {
  constructor(public config: ConfigService) {}
}
