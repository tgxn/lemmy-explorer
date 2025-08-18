import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import useQueryCache from "../../hooks/useQueryCache";
import { useDebounce } from "@uidotdev/usehooks";

// https://github.com/bvaughn/react-window/issues/654#issuecomment-2846225272
import { FixedSizeList as _FixedSizeList, FixedSizeListProps } from "react-window";
const FixedSizeList = _FixedSizeList as unknown as React.ComponentType<FixedSizeListProps>;

import ButtonGroup from "@mui/joy/ButtonGroup";
import Button from "@mui/joy/Button";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
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

import VisibilityIcon from "@mui/icons-material/Visibility";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Tooltip } from "@mui/joy";

type ICustomFilterToggleProps = {
  tagValue: string;
};

const CustomFilterToggle = React.memo(({ tagValue }: ICustomFilterToggleProps) => {
  const filteredTags = useSelector((state: any) => state.configReducer.filteredTags);
  const dispatch = useDispatch();

  const currentFilter = React.useMemo(() => {
    return filteredTags.find((instance) => instance.tag == tagValue);
  }, [filteredTags, tagValue]);

  // const changeValue = (event) => {
  //   console.log("event.target.checked", tagValue, event.target.checked);

  //   // attempt to remove it from the existing list
  //   const removeIndex = filteredTags.filter((instance) => instance != tagValue);
  //   console.log("removeIndex", removeIndex, removeIndex.indexOf(tagValue));

  //   if (event.target.checked) {
  //     console.log("setFilteredTags", removeIndex);
  //     dispatch(setFilteredTags(removeIndex));
  //   } else {
  //     console.log("setFilteredTags", [...removeIndex, tagValue]);
  //     dispatch(setFilteredTags([...removeIndex, tagValue]));
  //   }
  // };

  const setValue = (filter) => {
    console.log("setValue", filter);

    // hide / show - add filter
    if (filter == "hide" || filter == "show") {
      // pop existing items
      const newTags = filteredTags.filter((instance) => instance.tag != tagValue);

      newTags.push({
        tag: tagValue,
        action: filter,
      });

      dispatch(setFilteredTags(newTags));
    }

    // include - remove filter
    else if (filter == "include") {
      // pop existing items
      const newTags = filteredTags.filter((instance) => instance.tag != tagValue);

      dispatch(setFilteredTags(newTags));
    }
  };

  return (
    <ButtonGroup size="sm" aria-label="outlined button group" sx={{ display: "flex", ml: "auto" }}>
      <Tooltip title="Hide Tag">
        <Button
          color="warning"
          variant="solid"
          onClick={() => setValue("hide")}
          disabled={currentFilter && currentFilter.action == "hide"}
        >
          <VisibilityOffIcon />
        </Button>
      </Tooltip>

      <Tooltip title="Ignore Tag">
        <Button
          color="neutral"
          variant="solid"
          onClick={() => setValue("include")}
          disabled={
            !currentFilter ||
            (currentFilter && currentFilter.action != "hide" && currentFilter.action != "show")
          }
        >
          <CompareArrowsIcon />
        </Button>
      </Tooltip>

      <Tooltip title="Show Tag">
        <Button
          color="success"
          variant="solid"
          onClick={() => setValue("show")}
          disabled={currentFilter && currentFilter.action == "show"}
        >
          <VisibilityIcon />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
});

function renderRow(props) {
  const { data, index, style } = props;
  const dataSet = data[index];

  const filteredTags = useSelector((state: any) => state.configReducer.filteredTags);
  const currentFilter = React.useMemo(() => {
    return filteredTags.find((instance) => instance.tag == dataSet.tag);
  }, [filteredTags, dataSet]);

  const inlineStyle = {
    ...style,
    top: style.top + LISTBOX_PADDING,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  let bgColor = "background.level2";

  if (currentFilter) {
    if (currentFilter.action == "hide") {
      bgColor = "#ac2f2f73";
    } else if (currentFilter.action == "show") {
      bgColor = "#39ac2f73";
    }
  }

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
          bgcolor: bgColor,
          height: "45px",
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
        <CustomFilterToggle tagValue={dataSet.tag} />
      </FormControl>
    </ListItem>
  );
}

const TagDialog = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
  const itemSize = 50;

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
          width="100%"
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
              const allTagNames = dataIns.map((item) => ({ tag: item.tag, action: "hide" }));
              dispatch(setFilteredTags(allTagNames));
            }}
            color="warning"
          >
            Hide All
          </Button>
          <Button
            onClick={() => {
              dispatch(setFilteredTags([]));
            }}
            color="neutral"
          >
            Reset All
          </Button>
          <Button
            onClick={() => {
              const allTagNames = dataIns.map((item) => ({ tag: item.tag, action: "show" }));
              dispatch(setFilteredTags(allTagNames));
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

  const filteredTags = useSelector((state: any) => state.configReducer.filteredTags);

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
