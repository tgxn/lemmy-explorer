import { useState, useEffect } from "react";

import storage from "../lib/storage";

type IUseStorage = [any, (value: any) => void];

export default function useStorage(storageKey: string, defaultValue: any): IUseStorage {
  const [storageValue, _setStorageValue] = useState<any>(storage.get(storageKey, defaultValue));

  const setStorageValue = (value: any) => {
    storage.set(storageKey, value);
    _setStorageValue(value);
  };

  return [storageValue, setStorageValue];
}
