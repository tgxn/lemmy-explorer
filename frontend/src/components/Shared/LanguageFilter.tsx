import React from "react";

import Autocomplete from "@mui/joy/Autocomplete";

import LanguageIcon from "@mui/icons-material/Language";

import { BETTER_LANGS_LIST } from "../../lib/const";

type ILanguageFilterProps = {
  languageCodes: string[];
  setLanguageCodes: (codes: string[]) => void;
};

const LanguageFilter = React.memo(({ languageCodes, setLanguageCodes }: ILanguageFilterProps) => {
  // console.log("LanguageFilter", DEFAULT_LANGS, languageCodes, setLanguageCodes);
  return (
    <Autocomplete
      multiple
      startDecorator={<LanguageIcon />}
      // indicator={<KeyboardArrowDown />}
      id="tags-default"
      sx={{
        width: { xs: "100%", sm: "auto" },
        flexShrink: 0,
      }}
      placeholder="Filter Languages"
      options={Object.values(BETTER_LANGS_LIST)}
      getOptionLabel={(option: any) => `${option.name} (${option.nativeName})`}
      // custom search
      filterOptions={(options: any, params) => {
        const filtered = options.filter((option) => {
          if (params.inputValue === "") return true;
          if (option.name.toLowerCase().includes(params.inputValue.toLowerCase())) return true;
          if (option.code.toLowerCase().includes(params.inputValue.toLowerCase())) return true;
          return false;
        });
        return filtered;
      }}
      value={languageCodes}
      onChange={(event, newValue: any) => {
        console.log("onChange", newValue);
        setLanguageCodes(newValue);
      }}
    />
  );
});
export default LanguageFilter;
