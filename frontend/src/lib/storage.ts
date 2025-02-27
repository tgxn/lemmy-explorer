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

  /**
   * Write the config to localstorage
   *
   * @returns {void}
   */
  writeConfig(): void {
    const writeConfigData = JSON.stringify(this.store);

    console.log("wrote config", writeConfigData);

    return localStorage.setItem(this.keyName, writeConfigData);
  }

  /**
   * Get a config value
   *
   * @param configKey {string}
   * @param defaultValue {any}
   * @returns {any}
   */
  get(configKey: string, defaultValue: any = false): any {
    if (this.store.hasOwnProperty(configKey)) {
      return this.store[configKey];
    }

    return defaultValue;
  }

  /**
   * Set a config value
   *
   * @param configKey {string}
   * @param configValue {any}
   * @returns {void}
   */
  set(configKey: string, configValue: any): void {
    this.store[configKey] = configValue;

    return this.writeConfig();
  }

  /**
   * Remove a config value
   *
   * @param configKey {string}
   * @returns {void}
   */
  remove(configKey: string): void {
    delete this.store[configKey];

    return this.writeConfig();
  }
}

const storage = new Storage();
export default storage;
