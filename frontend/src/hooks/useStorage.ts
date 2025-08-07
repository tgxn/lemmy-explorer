import { useState, Dispatch, SetStateAction } from "react";
import storage from "../lib/storage";

export default function useStorage<T>(storageKey: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storageValue, _setStorageValue] = useState<T>(storage.get(storageKey, defaultValue));

  const setStorageValue: Dispatch<SetStateAction<T>> = (value) => {
    const newValue = value instanceof Function ? value(storageValue) : value;
    storage.set(storageKey, newValue);
    _setStorageValue(newValue);
  };

  return [storageValue, setStorageValue];
}
