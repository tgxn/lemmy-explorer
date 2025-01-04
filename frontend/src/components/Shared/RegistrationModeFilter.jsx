import React, { useState, useEffect } from "react";

import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
// import OutlinedInput from "@mui/joy/OutlinedInput";

// import OutlinedInput from "@mui/joy/OutlinedInput";
// import InputLabel from "@mui/joy/InputLabel";
import MenuItem from "@mui/joy/MenuItem";
// import FormControl from "@mui/joy/FormControl";
// import ListItemText from "@mui/base/ListItemText";
// import Select from "@mui/joy/Select";
import Checkbox from "@mui/joy/Checkbox";

const RegistrationModeFilter = React.memo(({ regMode, setRegMode }) => {
  // console.log("RegistrationModeFilter", DEFAULT_LANGS, languageCodes, setLanguageCodes);

  const handleChange = (event) => {
    if (!event) return;

    console.log("handleChange event", event);

    const value = event.target.value;
    console.log("handleChange value", value);

    // const {
    //   target: { value },
    // } = event;
    // const preventDuplicate = value.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

    // const filterdValue = value.filter((item) => variantName.findIndex((o) => o.id === item.id) >= 0);
    // let duplicatesRemoved = value.filter((item, itemIndex) =>
    //   value.findIndex((o, oIndex) => o.id === item.id && oIndex !== itemIndex),
    // );
    // console.log(duplicatesRemoved);
    // let map = {};
    // for (let list of value) {
    //   map[Object.values(list).join('')] = list;
    // }
    // console.log('Using Map', Object.values(map));
    // let duplicateRemoved = [];
    // value.forEach((item) => {
    //   if (duplicateRemoved.findIndex((o) => o.id === item.id) >= 0) {
    //     duplicateRemoved = duplicateRemoved.filter((x) => x.id === item.id);
    //   } else {
    //     duplicateRemoved.push(item);
    //   }
    // });
    // setVariantName(duplicateRemoved);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const menuOptions = [
    {
      name: "All",
      value: "all",
    },
    {
      name: "Open",
      value: "open",
    },
    {
      name: "Application",
      value: "application",
    },
    {
      name: "Closed",
      value: "closed",
    },
  ];

  return (
    <Select
      // placeholder="Registration Modes"
      // startDecorator={<SortIcon />}
      // indicator={<KeyboardArrowDown />}
      // value={orderBy}
      // onChange={(event, newValue) => {
      // ListItemText/   width: { xs: "100%", sm: 240 },
      //   flexShrink: 0,
      //   [`& .${selectClasses.indicator}`]: {
      //     transition: "0.2s",
      //     [`&.${selectClasses.expanded}`]: {
      //       transform: "rotate(-180deg)",
      //     },
      //   },
      // }}

      // labelId="demo-multiple-checkbox-label"
      // id="demo-multiple-checkbox"
      multiple
      value={regMode}
      onChange={handleChange}
      variant="outlined"
      // input={<OutlinedInput label="Tag" />}
      renderValue={(selected) => selected.map((x) => x.name).join(", ")}
      MenuProps={MenuProps}
    >
      {menuOptions.map((option, index) => (
        // <Option key={option.value} value={option.value}>
        //   <Checkbox checked={regMode.findIndex((item) => item.value === option.value) >= 0} />
        //   {/* <ListItemText primary={option.name} /> */}
        //   {option.name}
        // </Option>
        <React.Fragment key={option.value}>
          {index !== 0 ? <ListDivider role="none" inset="startContent" /> : null}
          <Option value={option.value} label={option.name}>
            <ListItemDecorator>
              {/* <Avatar size="sm" src={option.src} /> */}
              <Checkbox checked={regMode.findIndex((item) => item.value === option.value) >= 0} />
            </ListItemDecorator>
            {option.name}
          </Option>
        </React.Fragment>
      ))}
    </Select>
  );
});
export default RegistrationModeFilter;
