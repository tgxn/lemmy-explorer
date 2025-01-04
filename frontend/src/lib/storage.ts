/* global localStorage */

class Storage {
  private keyName: string;
  private store: any;
  private userConfig: any;

  constructor() {
    this.keyName = "explorer_storage";
    this.store = {};

    if (localStorage.getItem(this.keyName)) {
      this.store = JSON.parse(localStorage.getItem(this.keyName));
      console.log("loaded config", this.userConfig);
    } else {
      console.log("no config found in localstorage");
    }
  }

  writeConfig() {
    const writeConfigData = JSON.stringify(this.store);

    console.log("wrote config", writeConfigData);

    return localStorage.setItem(this.keyName, writeConfigData);
  }

  get(configKey, defaultValue = false) {
    if (this.store.hasOwnProperty(configKey)) {
      return this.store[configKey];
    }

    return defaultValue;
  }

  set(configKey, configValue) {
    this.store[configKey] = configValue;

    return this.writeConfig();
  }
  remove(configKey) {
    delete this.store[configKey];

    return this.writeConfig();
  }
}

const storage = new Storage();
export default storage;
