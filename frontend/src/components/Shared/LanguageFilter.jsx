import React from "react";

import Autocomplete from "@mui/joy/Autocomplete";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";

import { DEFAULT_LANGS, BETTER_LANGS_LIST } from "../../lib/const";

const LanguageFilter = React.memo(({ languageCodes, setLanguageCodes }) => {
  console.log("LanguageFilter", DEFAULT_LANGS, languageCodes, setLanguageCodes);
  return (
    <Autocomplete
      multiple
      startDecorator={<LanguageIcon />}
      indicator={<KeyboardArrowDown />}
      id="tags-default"
      sx={{
        width: { xs: "100%", sm: "auto" },
        flexShrink: 0,
      }}
      placeholder="Filter Languages"
      options={Object.values(BETTER_LANGS_LIST)}
      getOptionLabel={(option) => `${option.name} (${option.nativeName})`}
      // custom search
      filterOptions={(options, params) => {
        const filtered = options.filter((option) => {
          if (params.inputValue === "") return true;
          if (option.name.toLowerCase().includes(params.inputValue.toLowerCase())) return true;
          if (option.code.toLowerCase().includes(params.inputValue.toLowerCase())) return true;
          return false;
        });
        return filtered;
      }}
      value={languageCodes}
      onChange={(event, newValue) => {
        console.log("onChange", newValue);
        setLanguageCodes(newValue);
      }}
    />
  );
});
export default LanguageFilter;
