import React, { useState, useEffect, forwardRef } from "react";
import { connect } from "react-redux";

import useStorage from "../hooks/useStorage";
import useQueryCache from "../hooks/useQueryCache";
import { useDebounce } from "@uidotdev/usehooks";

import Tooltip from "@mui/joy/Tooltip";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";

import { PageLoading, PageError } from "../components/Display";

import { CommunityGrid } from "../components/GridView";

const TriStateCheckbox = ({ checked, onChange, onBlur }, ref) => {
  const [localChecked, setLocalChecked] = useState(checked ?? null);
  useEffect(() => setLocalChecked(checked ?? null), [checked]);

  // Variable "ShowNSFW" is used to drive this
  //  Default:    Hide NSFW     false
  //  One Click:  Include NSFW  null
  //  Two Clicks: NSFW Only     true
  const handleChange = () => {
    switch (localChecked) {
      case false:
        setLocalChecked(null);
        onChange(null);
        break;
      case null:
        setLocalChecked(true);
        onChange(true);
        break;
      case true:
        setLocalChecked(false);
        onChange(false);
        break;
    }
  };

  let label = "NSFW Hidden";
  if (localChecked === true) {
    label = "Only NSFW Shown";
  } else if (localChecked === null) {
    label = "NSFW Included";
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur(localChecked);
    }
  };
  return (
    <Tooltip title={label} placement="top">
      <Checkbox
        inputRef={ref}
        label={"Show NSFW"}
        color={localChecked == null ? "info" : localChecked == true ? "danger" : "neutral"}
        checked={!!localChecked}
        indeterminate={localChecked === null}
        // onFocus={onFocus}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Tooltip>
  );
};

export default forwardRef(TriStateCheckbox);
