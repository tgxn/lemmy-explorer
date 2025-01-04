import { useState, useEffect } from "react";

import storage from "../lib/storage";

export default function useStorage(storageKey, defaultValue) {
  const [storageValue, _setStorageValue] = useState(storage.get(storageKey, defaultValue));

  const setStorageValue = (value) => {
    storage.set(storageKey, value);
    _setStorageValue(value);
  };

  return [storageValue, setStorageValue];
}
