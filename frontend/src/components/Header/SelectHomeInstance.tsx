import React from "react";
import { useSelector, useDispatch } from "react-redux";

import useQueryCache from "../../hooks/useQueryCache";

import { FixedSizeList } from "react-window";

import { Popper } from "@mui/base/Popper";
import Autocomplete, { createFilterOptions } from "@mui/joy/Autocomplete";
import AutocompleteListbox from "@mui/joy/AutocompleteListbox";
import AutocompleteOption from "@mui/joy/AutocompleteOption";
import FormControl from "@mui/joy/FormControl";
import ListItemDecorator from "@mui/joy/ListItemDecorator";

import Add from "@mui/icons-material/Add";

import { setHomeInstance } from "../../reducers/configReducer";

import InstanceTypeIcon from "../Shared/InstanceTypeIcon";

/**
 * This component renders a button that allows the user to select a home instance.
 *
 * It uses a react-window Virtualized List to render the list of instances.
 */

const filterOptions = createFilterOptions({
  //   matchFrom: "start",
  stringify: (option: any) => option.base,
  trim: true,
  ignoreCase: true,
});

const LISTBOX_PADDING = 6; // px

function renderRow(props) {
  const { data, index, style } = props;
  const option = data[index];
  const inlineStyle = {
    ...style,
    top: style.top + LISTBOX_PADDING,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return React.cloneElement(option, {
    style: { ...option.props.style, ...inlineStyle },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return (
    <AutocompleteListbox
      {...props}
      {...outerProps}
      component="div"
      sx={{
        "& ul": {
          padding: 0,
          margin: 0,
          flexShrink: 0,
        },
      }}
    />
  );
});

type IListboxComponentProps = {
  children: any;
  anchorEl: any;
  open: boolean;
  modifiers: any;
  ref: any;
};

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props: IListboxComponentProps) {
  const { children, anchorEl, open, modifiers, ref, ...other } = props;
  const itemData = [];

  children[0].forEach((item) => {
    if (item) {
      itemData.push(item);
      // itemData.push(...(item.children || []));
    }
  });

  const itemCount = itemData.length;
  const itemSize = 40;

  return (
    <Popper ref={ref} anchorEl={anchorEl} open={open} modifiers={modifiers} style={{ zIndex: 10000 }}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          itemData={itemData}
          height={itemSize * 8}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={itemSize}
          overscanCount={5}
          itemCount={itemCount}
          sx={(theme) => ({
            zIndex: theme.zIndex.modal + 1000,
          })}
        >
          {renderRow}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </Popper>
  );
});

export default function SelectHomeInstance() {
  const homeBaseUrl = useSelector((state: any) => state.configReducer.homeBaseUrl);
  const dispatch = useDispatch();

  const {
    isLoading: loadingIns,
    error: errorIns,
    data: dataIns,
  } = useQueryCache("instanceMinData", "instance.min");

  const {
    isLoading: loadingMBin,
    error: errorMBin,
    data: dataMBin,
  } = useQueryCache("mbinMinData", "mbin.min");

  const {
    isLoading: loadingPiefed,
    error: errorPiefed,
    data: dataPiefed,
  } = useQueryCache("piefedMinData", "piefed.min");

  const data = React.useMemo(() => {
    if (loadingIns || loadingMBin || loadingPiefed) {
      return null;
    }

    if (errorIns || errorMBin || errorPiefed) {
      return null;
    }

    let data = [];

    data = data.concat(dataIns.map((item) => ({ ...item, type: "lemmy" })));

    for (const item of dataMBin) {
      data.push({
        base: item,
        name: item,
        type: "mbin",
      });
    }

    for (const item of dataPiefed) {
      data.push({
        base: item,
        name: item,
        type: "piefed",
      });
    }

    return data;
  }, [dataIns, dataMBin, dataPiefed]);

  const onChange = (newValue) => {
    console.log("onChange", newValue);

    if (newValue == null) {
      dispatch(setHomeInstance(null));
      return;
    }

    // send the base url to upstream
    dispatch(setHomeInstance(newValue.base, newValue.type));
  };

  return (
    <FormControl>
      <Autocomplete
        sx={{ zIndex: 10000 }}
        value={homeBaseUrl || ""}
        onChange={(event, newValue) => onChange(newValue)}
        selectOnFocus //to help the user clear the selected value.
        handleHomeEndKeys // to move focus inside the popup with the Home and End keys.
        freeSolo
        disableListWrap
        placeholder="Select your home instance"
        slots={{
          listbox: ListboxComponent,
        }}
        options={data || []}
        loading={data == null}
        renderOption={(props, option) => (
          <AutocompleteOption {...props} key={typeof option === "string" ? option : option.base}>
            {typeof option !== "string" && option.name?.startsWith('Add "') ? (
              <ListItemDecorator>
                <Add />
              </ListItemDecorator>
            ) : (
              <ListItemDecorator>
                <InstanceTypeIcon type={option.type} />
              </ListItemDecorator>
            )}

            {typeof option === "string" && option}
            {typeof option !== "string" && option.base && (
              <>
                {option.name}&nbsp;<i>({option.base})</i>
              </>
            )}
          </AutocompleteOption>
        )}
        filterOptions={(options, params) => {
          const filtered = filterOptions(options, params);

          const { inputValue } = params;

          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.base);
          if (inputValue !== "" && !isExisting) {
            const cleanedUrl = inputValue
              .replace("http:", "")
              .replace("https:", "")
              .replace("//", "")
              .replace("/", "");
            filtered.push({
              name: `Add "${cleanedUrl}"`,
              base: cleanedUrl,
            });
          }

          return filtered;
        }}
        getOptionLabel={(option) => {
          //   console.log("getOptionLabel", option);
          // Value selected with enter, right from the input
          if (typeof option === "string") {
            return option;
          }

          // Regular option
          return option.base;
        }}
      />
    </FormControl>
  );
}
