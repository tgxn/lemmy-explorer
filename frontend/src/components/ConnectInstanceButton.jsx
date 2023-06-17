import React from "react";
import { connect } from "react-redux";

import useQueryCache from "../hooks/useQueryCache";

import { FixedSizeList, ListChildComponentProps } from "react-window";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";
import FormControl from "@mui/joy/FormControl";
import Autocomplete, { createFilterOptions } from "@mui/joy/Autocomplete";
import AutocompleteOption from "@mui/joy/AutocompleteOption";

import Add from "@mui/icons-material/Add";
import CottageIcon from "@mui/icons-material/Cottage";
import HomeIcon from "@mui/icons-material/Home";

import { setHomeInstance } from "../reducers/configReducer";

import VirtualisedSelect from "./VirtualisedSelect";

const filterOptions = createFilterOptions({
  matchFrom: "start",
  stringify: (option) => option.baseurl,
  trim: true,
  ignoreCase: true,
});

function SelectHomeAddress({ value, setValue }) {
  const { isLoading, isSuccess, isError, error, data } = useQueryCache("instanceData", "/instances.json");

  const [localValue, _setLocalValue] = React.useState(value);

  const setLocalValue = (newValue) => {
    console.log("setLocalValue", newValue);

    if (newValue == null) {
      setValue(null);
      _setLocalValue(null);
      return;
    }

    // send the base url to upstream
    setValue(newValue.baseurl);

    // local value is an object with title
    _setLocalValue(newValue);
  };

  return (
    <FormControl>
      <Autocomplete
        options={data || null}
        value={value || ""}
        placeholder="Select a home instance"
        sx={{ width: 300 }}
        selectOnFocus //to help the user clear the selected value.
        handleHomeEndKeys // to move focus inside the popup with the Home and End keys.
        freeSolo
        onChange={(event, newValue) => {
          console.log("onChange", newValue, event);

          // string input
          if (typeof newValue === "string") {
            setLocalValue({
              name: newValue,
              baseurl: newValue,
            });
          }

          // Create a new value from the user input
          else if (newValue && newValue.inputValue) {
            setLocalValue({
              name: newValue.inputValue,
              baseurl: newValue.inputValue,
            });
          }

          // probably object?
          else {
            setLocalValue(newValue);
          }
        }}
        // get the string label for the option
        getOptionLabel={(option) => {
          console.log("getOptionLabel", option);
          // Value selected with enter, right from the input
          if (typeof option === "string") {
            return option;
          }

          // Regular option
          return option.baseurl;
        }}
        filterOptions={(options, params) => {
          const filtered = filterOptions(options, params);

          const { inputValue } = params;

          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.baseurl);
          if (inputValue !== "" && !isExisting) {
            filtered.push({
              name: `Add "${inputValue}"`,
              baseurl: inputValue,
            });
          }

          return filtered;
        }}
        renderOption={(props, option) => (
          <AutocompleteOption key={option.baseurl} {...props}>
            {option.name?.startsWith('Add "') && (
              <ListItemDecorator>
                <Add />
              </ListItemDecorator>
            )}
            {typeof option == "string" && option}
            {option.baseurl && (
              <>
                {option.name} ({option.baseurl})
              </>
            )}
          </AutocompleteOption>
        )}
      />
    </FormControl>
  );
}

// a popup menu that lets the user login using username, instance address and password
// the button should have a home icon
function ConnectInstanceButton({ homeBaseUrl, dispatch }) {
  const [isOpen, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const currentInstance = homeBaseUrl;

  // const setInstanceUrl = (url) => {
  //   dispatch(setHomeInstance(url));
  // };

  const handleClick = (event) => {
    if (isOpen) setOpen(false);

    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  return (
    <>
      <Tooltip
        title={currentInstance ? `Home instance: ${currentInstance}` : "Set Home Instance"}
        variant="soft"
      >
        <IconButton
          variant="outlined"
          color={currentInstance ? "success" : "neutral"}
          sx={{ mr: 2, p: 1 }}
          onClick={handleClick}
        >
          {!homeBaseUrl && <HomeIcon />}
          {homeBaseUrl && <CottageIcon />}
        </IconButton>
      </Tooltip>
      <Menu
        id="positioned-demo-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => setOpen(false)}
        aria-labelledby="positioned-demo-button"
        placement="bottom-end"
        // MenuListProps={{
        //   sx: {
        //     "& .MuiMenuItem-root": {
        //       whiteSpace: "unset",
        //     },
        //   },
        // }}
      >
        <MenuItem disabled>
          <ListItemDecorator>
            <CottageIcon />
          </ListItemDecorator>
          Set Home Instance
        </MenuItem>

        <ListDivider />
        <Box
          sx={{
            px: 2,
            py: 1,
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          <VirtualisedSelect />
        </Box>
      </Menu>
    </>
  );
}

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(ConnectInstanceButton);
