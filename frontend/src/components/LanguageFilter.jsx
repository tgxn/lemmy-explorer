import React from "react";

import Autocomplete from "@mui/joy/Autocomplete";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";

import { DEFAULT_LANGS } from "../lib/const";

export default function LanguageFilter({ languageCodes, setLanguageCodes }) {
  console.log("LanguageFilter", DEFAULT_LANGS, languageCodes, setLanguageCodes);
  return (
    <Autocomplete
      multiple
      startDecorator={<LanguageIcon />}
      indicator={<KeyboardArrowDown />}
      id="tags-default"
      placeholder="Filter Languages"
      options={DEFAULT_LANGS}
      getOptionLabel={(option) => option.name}
      value={languageCodes}
      onChange={(event, newValue) => {
        console.log("onChange", newValue);
        setLanguageCodes(newValue);
      }}
    />
  );
}
