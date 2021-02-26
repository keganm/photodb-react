import { GoogleDrive } from "./GoogleDrive";
import { GoogleParents } from "./parentManager";

class GoogleInterface {
  constructor(props) {
    this.isInit = false;
  }

  Init = (props) => {
    GoogleDrive.Init(props, () => {
      GoogleParents.Init(GoogleDrive, props);
    });
  };
}

export const GapiInterface = new GoogleInterface();
