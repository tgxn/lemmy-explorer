import { useState, useEffect } from "react";

import storage from "../lib/storage";

export default function useStorage(storageKey: string, defaultValue: any) {
  const [storageValue, _setStorageValue] = useState<any>(storage.get(storageKey, defaultValue));

  const setStorageValue = (value: any) => {
    storage.set(storageKey, value);
    _setStorageValue(value);
  };

  return [storageValue, setStorageValue];
}
