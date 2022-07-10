import { ConfigProvider } from "tabby-core";

export class TrzszConfigProvider extends ConfigProvider {
  defaults = {
    trzszPlugin: {
      defaultUploadPath: "",
      defaultDownloadPath: "",
      enableDragUpload: false,
    },
  };
}
