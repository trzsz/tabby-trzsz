import { NgModule, Injectable } from "@angular/core";
import { ToolbarButtonProvider, ToolbarButton } from "tabby-core";

@Injectable()
export class MyButtonProvider extends ToolbarButtonProvider {
  provide(): ToolbarButton[] {
    return [
      {
        icon: "star",
        title: "Foobar",
        weight: 10,
        click: () => {
          alert("Woohoo!");
        },
      },
    ];
  }
}

@NgModule({
  providers: [
    { provide: ToolbarButtonProvider, useClass: MyButtonProvider, multi: true },
  ],
})
export default class MyModule {}
