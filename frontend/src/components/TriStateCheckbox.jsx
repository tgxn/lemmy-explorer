import React, { useState, useEffect, forwardRef } from "react";

import Tooltip from "@mui/joy/Tooltip";
import Checkbox from "@mui/joy/Checkbox";

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

  return (
    <Tooltip title={label} placement="top">
      <Checkbox
        inputRef={ref}
        label={"Show NSFW"}
        color={localChecked == null ? "warning" : localChecked == true ? "danger" : "neutral"}
        checked={!!localChecked}
        indeterminate={localChecked === null}
        onChange={handleChange}
      />
    </Tooltip>
  );
};

export default forwardRef(TriStateCheckbox);
