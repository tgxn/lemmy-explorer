import React, { useState, useEffect } from "react";

import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";

import Checkbox from "@mui/joy/Checkbox";

type IRegModes = "all" | "open" | "registration" | "closed";

type IRegistrationModeProps = {
  regMode: IRegModes[];
  setRegMode: (value: any) => void;
};

const RegistrationModeFilter = React.memo(({ regMode, setRegMode }: IRegistrationModeProps) => {
  // string array of selected options
  // const [selRegMode, setSelRegMode] = useState<string[]>(regMode);
  // console.log("regMode", regMode);

  const handleChange = (event: React.SyntheticEvent | null, newValue: string | null) => {
    console.log(`regMode chose "${newValue}"`);

    // click all directly
    if (newValue === "all") {
      console.log("regMode all");
      setRegMode(["all"]);
      return;
    }

    // if all was selected, and we select another option, replace the chosen option with the new one
    if (regMode.length === 1 && regMode[0] === "all") {
      console.log("regMode first change");
      setRegMode([newValue]);
      return;
    }

    let newArray = [...regMode];

    // if the array already contains the option, remove or add it
    const index = newArray.indexOf(newValue);
    if (index === -1) {
      newArray = [...newArray, newValue];
    } else {
      newArray = newArray.filter((item) => item !== newValue);
    }

    // if the new array is empty, set it to all
    if (newArray.length === 0) {
      setRegMode(["all"]);
      return;
    }

    // if all options are selected, set it to all
    if (newArray.length === 3 && !newArray.includes("all")) {
      setRegMode(["all"]);
      return;
    }

    setRegMode(newArray);

    // otherwise, update the new value into the aarry
    // const newAr

    // if (newValue === "all") {
    //   setRegMode(["all"]);
    //   return;
    // } else {
    //   // if we have all selected, and we select another option, remove all from the array
    //   if (regMode.length === 1 && regMode[0] === "all") {
    //     setRegMode([newValue]);
    //     return;
    //   }
    //   if (regMode.length === 3 && !regMode.includes("all")) {
    //     setRegMode(["all"]);
    //     return;
    //   } else {
    //     const index = regMode.indexOf(newValue);
    //     if (index === -1) {
    //       setRegMode([...regMode, newValue]);
    //       return;
    //     } else {
    //       setRegMode(regMode.filter((item) => item !== newValue));
    //       return;
    //     }
    //   }
    // }
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
      name: "By Application",
      value: "application",
    },
    {
      name: "Closed",
      value: "closed",
    },
  ];

  return (
    // @ts-ignore this component is missing definition for `multiple`
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
      // multiple
      // // value={regMode}
      // value={regMode}
      // defaultValue={regMode}
      // onChange={handleChange}
      // variant="outlined"
      // slotProps={{
      //   listbox: {
      //     sx: {
      //       width: "100%",
      //     },
      //   },
      // }}
      // // input={<OutlinedInput label="Tag" />}
      // renderValue={(selected) => {
      //   console.log("regMode render", selected);
      //   return selected.map((x: any) => x.name).join(", ");
      // }}

      multiple={true}
      onChange={handleChange}
      // @ts-ignore
      value={regMode}
      // placeholder="Registration Modes"
      // defaultValue={regMode}
      // renderValue={(selected) => {
      //   console.log("regMode render selected", selected);
      //   return selected.join(", ");
      // }}
      sx={{ minWidth: "15rem" }}
      slotProps={{
        listbox: {
          sx: {
            width: "100%",
          },
        },
      }}
      MenuProps={MenuProps}
    >
      {menuOptions.map((option, index) => (
        <Option value={option.value}>
          <ListItemDecorator>
            {/* <Avatar size="sm" src={option.src} /> */}
            <Checkbox
              checked={regMode.findIndex((item) => item === option.value) >= 0}
              value={option.value}
            />
          </ListItemDecorator>
          {option.name}
        </Option>
      ))}
    </Select>
  );
});
export default RegistrationModeFilter;
