import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import useQueryCache from "../../hooks/useQueryCache";
import { useDebounce } from "@uidotdev/usehooks";

import { FixedSizeList } from "react-window";

import ButtonGroup from "@mui/joy/ButtonGroup";
import Button from "@mui/joy/Button";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Switch from "@mui/joy/Switch";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Input from "@mui/joy/Input";

import IconButton from "@mui/joy/IconButton";

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { setFilteredInstances } from "../../reducers/configReducer";

// # tags thinking

// each instance will get given some set of tags, that can be filtered on the instances page
/**
 * tags can be like:
 * - cloudflare: true
 * - hosted in eu: true
 * - hosted in us: true
 *
 * when users turn on the filter,
 *
 */

const LISTBOX_PADDING = 6; // px

const CustomSwitch = React.memo((props) => {
  const { baseUrl, dispatch, ...other } = props;
  const filteredInstances = useSelector((state) => state.configReducer.filteredInstances);

  const filtered = filteredInstances.indexOf(baseUrl) !== -1;

  const changeValue = (event) => {
    console.log("event.target.checked", baseUrl, event.target.checked);

    const removeIndex = filteredInstances.filter((instance) => instance != baseUrl);
    console.log("removeIndex", removeIndex, removeIndex.indexOf(baseUrl));
    if (event.target.checked) {
      dispatch(setFilteredInstances(removeIndex));
    } else {
      dispatch(setFilteredInstances([...removeIndex, baseUrl]));
    }
  };

  return (
    <Switch {...other} checked={!filtered} onChange={(event) => changeValue(event)} sx={{ ml: "auto" }} />
  );
});

function renderRow(props) {
  const { data, index, style } = props;
  const dataSet = data[index];

  const inlineStyle = {
    ...style,
    top: style.top + LISTBOX_PADDING,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <ListItem
      key={index}
      //   {...dataSet[0]}
      sx={{
        ...inlineStyle,
        width: "100%",
        pt: "5px",
      }}
    >
      <FormControl
        orientation="horizontal"
        sx={{
          bgcolor: "background.level2",
          height: "35px",
          p: 1,
          borderRadius: "sm",
          width: "100%",
        }}
      >
        <FormLabel
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <>
            {dataSet.name} ({dataSet.base})
          </>
        </FormLabel>
        <CustomSwitch baseUrl={dataSet.base} />
      </FormControl>
    </ListItem>
  );
}

const InstanceDialog = React.memo(({ isOpen, onClose, dispatch }) => {
  const filterSuspicious = useSelector((state) => state.configReducer.filterSuspicious);

  const {
    isLoading: loadingIns,
    error: errorIns,
    data: dataIns,
  } = useQueryCache("instanceMinData", "instance.min");

  const { isLoading: isLoadingSus, error: errorSus, data: dataSus } = useQueryCache("susData", "sus");

  // debounce the filter text input
  const [filterText, setFilterText] = React.useState("");
  const debounceFilterText = useDebounce(filterText, 100);

  const filteredData = React.useMemo(() => {
    if (!dataIns || !dataSus) {
      return [];
    }

    let filteredData = dataIns;

    if (filterSuspicious) {
      const susBaseArray = dataSus.map((item) => item.base);
      filteredData = filteredData.filter((instance) => !susBaseArray.includes(instance.base));
    }

    if (debounceFilterText) {
      // filter name or base contains
      filteredData = filteredData.filter((item) => {
        return (
          item.name.toLowerCase().includes(debounceFilterText.toLowerCase()) ||
          item.base.toLowerCase().includes(debounceFilterText.toLowerCase())
        );
      });
    }

    console.log("filteredData", filteredData);

    return filteredData.sort((a, b) => b.score - a.score);
  }, [dataIns, dataSus, debounceFilterText]);

  if (loadingIns || isLoadingSus) {
    return null;
  }

  if (errorIns || errorSus) {
    return null;
  }

  const dataCount = filteredData.length;
  const itemSize = 40;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog aria-labelledby="dialog-vertical-scroll-title" sx={{ maxWidth: 500, p: 0 }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <ModalClose />
          <Typography id="dialog-vertical-scroll-title" component="h2">
            Instance Filter
          </Typography>
        </Box>

        <Box sx={{ p: 2, pt: 0 }}>
          <Input
            placeholder="Filter list..."
            fullWidth
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
          />
        </Box>

        <FixedSizeList
          itemData={filteredData}
          height={itemSize * 10}
          innerElementType={(props) => <List {...props} />}
          itemSize={itemSize}
          overscanCount={5}
          itemCount={dataCount}
        >
          {renderRow}
        </FixedSizeList>

        <ButtonGroup
          variant={"outlined"}
          buttonFlex={1}
          aria-label="flex button group"
          sx={{
            p: 2,
            width: 500,
            maxWidth: "100%",
            overflow: "auto",
            resize: "horizontal",
          }}
        >
          <Button
            onClick={() => {
              const allInstances = dataIns.map((item) => item.base);
              console.log("allInstances", allInstances);
              dispatch(setFilteredInstances(allInstances));
            }}
            color="warning"
          >
            Hide All
          </Button>
          <Button
            onClick={() => {
              dispatch(setFilteredInstances([]));
            }}
            color="success"
          >
            Show All
          </Button>
        </ButtonGroup>
      </ModalDialog>
    </Modal>
  );
});

const TagFilter = React.memo(() => {
  const [filterOpen, setFilterOpen] = React.useState(false);

  const filteredInstances = useSelector((state) => state.configReducer.filteredInstances);

  return (
    <>
      <InstanceDialog isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
      <IconButton
        variant={filteredInstances.length > 0 ? "solid" : "soft"}
        color={filteredInstances.length > 0 ? "info" : "neutral"}
        onClick={() => setFilterOpen(true)}
        sx={{
          px: 1,
          py: 0,
          mr: 1,
          // borderRadius: "8px 0 0 8px",
        }}
      >
        {filteredInstances.length > 0 ? <FilterAltOffIcon /> : <FilterAltIcon />} Tags
      </IconButton>
    </>
  );
});
export default TagFilter;
