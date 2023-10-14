import React, { useState, useEffect } from "react";
import { connect, useSelector, useDispatch } from "react-redux";

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

import { setFilteredTags } from "../../reducers/configReducer";

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
  const { tagValue, filteredTags, dispatch, ...other } = props;

  const filtered = filteredTags.indexOf(tagValue) !== -1;

  const changeValue = (event) => {
    console.log("event.target.checked", tagValue, event.target.checked);

    // attempt to remove it from the existing list
    const removeIndex = filteredTags.filter((instance) => instance != tagValue);
    console.log("removeIndex", removeIndex, removeIndex.indexOf(tagValue));

    if (event.target.checked) {
      console.log("setFilteredTags", removeIndex);
      dispatch(setFilteredTags(removeIndex));
    } else {
      console.log("setFilteredTags", [...removeIndex, tagValue]);
      dispatch(setFilteredTags([...removeIndex, tagValue]));
    }
  };

  return (
    <Switch {...other} checked={!filtered} onChange={(event) => changeValue(event)} sx={{ ml: "auto" }} />
  );
});
const ConnectedSwitch = connect((state) => ({
  filteredTags: state.configReducer.filteredTags,
}))(CustomSwitch);

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
            {dataSet.tag} ({dataSet.count})
          </>
        </FormLabel>
        <ConnectedSwitch tagValue={dataSet.tag} />
      </FormControl>
    </ListItem>
  );
}

const TagDialog = React.memo(({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const {
    isLoading: loadingIns,
    error: errorIns,
    data: dataIns,
  } = useQueryCache("tagsMetaData", "tags.meta");

  // debounce the filter text input
  const [filterText, setFilterText] = React.useState("");
  const debounceFilterText = useDebounce(filterText, 100);

  const filteredData = React.useMemo(() => {
    if (!dataIns) {
      return [];
    }

    let filteredData = dataIns;

    if (debounceFilterText) {
      filteredData = filteredData.filter((item) => {
        return item.tag.toLowerCase().includes(debounceFilterText.toLowerCase());
      });
    }

    console.log("filteredData", filteredData);

    return filteredData.sort((a, b) => b.count - a.count);
  }, [dataIns, debounceFilterText]);

  if (loadingIns) {
    return null;
  }

  if (errorIns) {
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
            Tag Filter
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
              const allInstances = dataIns.map((item) => item.tag);
              console.log("allTags", allInstances);
              dispatch(setFilteredTags(allInstances));
            }}
            color="warning"
          >
            Hide All
          </Button>
          <Button
            onClick={() => {
              dispatch(setFilteredTags([]));
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

  const filteredTags = useSelector((state) => state.configReducer.filteredTags);

  return (
    <>
      <TagDialog isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
      <IconButton
        variant={filteredTags.length > 0 ? "solid" : "soft"}
        color={filteredTags.length > 0 ? "info" : "neutral"}
        onClick={() => setFilterOpen(true)}
        sx={{
          px: 1,
          py: 0,
          mr: 1,
          // borderRadius: "8px 0 0 8px",
        }}
      >
        {filteredTags.length > 0 ? <FilterAltOffIcon /> : <FilterAltIcon />} Tags
      </IconButton>
    </>
  );
});
export default TagFilter;
