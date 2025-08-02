/* global localStorage */

class Storage {
  private keyName: string;
  private store: any;
  private writeTimeout?: number;

  constructor() {
    this.keyName = "explorer_storage";
    this.store = {};

    const existing = localStorage.getItem(this.keyName);
    if (existing) {
      try {
        this.store = JSON.parse(existing);
        console.log("loaded config", this.store);
      } catch (e) {
        console.warn("corrupted config in localstorage", e);
        this.store = {};
      }
    } else {
      console.log("no config found in localstorage");
    }

    window.addEventListener("storage", (event: StorageEvent) => {
      if (event.key === this.keyName && event.newValue) {
        try {
          this.store = JSON.parse(event.newValue);
        } catch (e) {
          console.warn("corrupted config in storage event", e);
          this.store = {};
        }
      }
    });
  }

  /**
   * Write the config to localstorage immediately
   *
   * @returns {void}
   */
  writeConfig(): void {
    const writeConfigData = JSON.stringify(this.store);

    console.log("wrote config", writeConfigData);

    localStorage.setItem(this.keyName, writeConfigData);
  }

  /**
   * Debounce writes to localstorage
   *
   * @returns {void}
   */
  private scheduleWrite(): void {
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }

    this.writeTimeout = window.setTimeout(() => {
      this.writeTimeout = undefined;
      this.writeConfig();
    }, 200);
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

    return this.scheduleWrite();
  }

  /**
   * Remove a config value
   *
   * @param configKey {string}
   * @returns {void}
   */
  remove(configKey: string): void {
    delete this.store[configKey];

    return this.scheduleWrite();
  }
}

const storage = new Storage();
export default storage;
