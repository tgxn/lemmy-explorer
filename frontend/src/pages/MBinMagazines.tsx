import React, { useEffect, useState, useRef } from "react";

import { useSearchParams } from "react-router-dom";
import useStorage from "../hooks/useStorage";

import useCachedMultipart from "../hooks/useCachedMultipart";
import { useDebounce } from "@uidotdev/usehooks";

import Typography from "@mui/joy/Typography";
import Container from "@mui/joy/Container";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Box from "@mui/joy/Box";
import ButtonGroup from "@mui/joy/ButtonGroup";
import IconButton from "@mui/joy/IconButton";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewListIcon from "@mui/icons-material/ViewList";

import type { IMBinMagazineOutput } from "../../../types/output";

import TriStateCheckbox from "../components/Shared/TriStateCheckbox";
import { LinearValueLoader, PageLoading, PageError, SimpleNumberFormat } from "../components/Shared/Display";

const MBinGrid = React.lazy(() => import("../components/GridView/MBin"));
const MBinList = React.lazy(() => import("../components/ListView/MBin"));

import { sortItems, ISorterDefinition, filterByText } from "../lib/utils";

export default function MBinMagazines() {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    isLoading,
    loadingPercent,
    isSuccess,
    isError,
    error,
    data: magData,
  } = useCachedMultipart<IMBinMagazineOutput>("magazinesData", "magazines");

  const [viewType, setViewType] = useStorage<string>("mbin.viewType", "grid");
  const [orderBy, setOrderBy] = useState<string>("subscriptions");
  const [showNSFW, setShowNSFW] = useState<boolean | null>(false);

  // debounce the filter text input
  const [filterText, setFilterText] = useState<string>("");
  const debounceFilterText = useDebounce<string>(filterText, 500);

  // load query params
  useEffect(() => {
    if (searchParams.has("query")) setFilterText(searchParams.get("query"));
    if (searchParams.has("order")) setOrderBy(searchParams.get("order"));
    if (searchParams.has("nsfw"))
      setShowNSFW(
        searchParams.get("nsfw") == "true" ? true : searchParams.get("nsfw") == "null" ? null : false,
      );
  }, []);

  // update query params
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const parms: any = {};

    if (filterText) parms.query = filterText;
    if (orderBy != "subscriptions") parms.order = orderBy;
    if (showNSFW != false) parms.nsfw = showNSFW;

    const newParams = new URLSearchParams(parms);
    if (newParams.toString() !== searchParams.toString()) {
      console.log(`Updating query params: ${JSON.stringify(parms)}`);
      setSearchParams(parms);
    }
  }, [orderBy, showNSFW, debounceFilterText]);

  // this applies the filtering and sorting to the data loaded from .json
  const magazinesData = React.useMemo(() => {
    if (isError) return [];
    if (!magData) return [];

    console.time("sort+filter magazines");
    console.log(`Loaded ${magData.length} magazines`);

    let communties = [...magData];

    console.log(`Sorting magazines by ${orderBy}`);

    // Variable "ShowNSFW" is used to drive this
    //  Default:    Hide NSFW     false
    if (showNSFW == false) {
      console.log(`Hiding isAdult magazines`);
      communties = communties.filter((community) => {
        return !community.isAdult;
      });
    }

    //  One Click:  Include NSFW  null
    else if (showNSFW == null) {
      console.log(`Including isAdult magazines`);
    }

    //  Two Clicks: NSFW Only     true
    else if (showNSFW == true) {
      console.log(`Showing NSFW magazines`);
      communties = communties.filter((community) => {
        return community.isAdult;
      });
    }

    // filter string
    if (debounceFilterText) {
      console.log(`Filtering magazines by ${debounceFilterText}`);

      communties = filterByText(communties, debounceFilterText, (magazine) => [
        magazine.name,
        magazine.title,
        magazine.baseurl,
        magazine.description,
      ]);
    }
    console.log(`Filtered ${communties.length} magazines`);

    // sorting
    const sorters: ISorterDefinition = {
      subscriptions: (a, b) => b.subscriptions - a.subscriptions,
      posts: (a, b) => b.posts - a.posts,
      name: (a, b) => a.name.localeCompare(b.name),
    };

    communties = sortItems(communties, orderBy, sorters);

    console.log(`Sorted ${communties.length} magazines`);

    console.log(
      `updating magazines data with ${communties.length} magazines, removed: ${
        magData.length - communties.length
      }`,
    );

    console.timeEnd("sort+filter magazines");

    // return a clone so that it triggers a re-render  on sort
    return [...communties];
  }, [magData, orderBy, showNSFW, debounceFilterText]);

  return (
    <Container
      maxWidth={false}
      style={{
        paddingRight: "16px",
        paddingLeft: "16px",
      }}
    >
      <Box
        component="header"
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Filter Magazines"
          value={filterText}
          sx={{
            width: { xs: "100%", sm: 285 },
            flexShrink: 0,
          }}
          onChange={(event) => setFilterText(event.target.value)}
        />

        <Select
          placeholder="Order By"
          startDecorator={<SortIcon />}
          indicator={<KeyboardArrowDown />}
          value={orderBy}
          onChange={(event, newValue) => {
            setOrderBy(newValue);
          }}
          sx={{
            minWidth: 120,
            width: { xs: "100%", sm: 240 },
            flexShrink: 0,
            flexGrow: 0,
            [`& .${selectClasses.indicator}`]: {
              transition: "0.2s",
              [`&.${selectClasses.expanded}`]: {
                transform: "rotate(-180deg)",
              },
            },
          }}
        >
          {/* <Option value="smart">Smart Sort</Option> */}
          <Option value="subscriptions">Subscriptions</Option>
          <Option value="posts">Posts</Option>
          <Option value="name">Name</Option>
        </Select>

        <Box sx={{ display: "flex", gap: 3 }}>
          <TriStateCheckbox checked={showNSFW} onChange={(checked) => setShowNSFW(checked)} />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {isSuccess && (
            <Typography
              level="body2"
              sx={{
                borderRadius: "4px",
                mr: 2,
              }}
            >
              showing{" "}
              <SimpleNumberFormat
                value={magazinesData.length}
                // displayType={"text"}
                // decimalScale={2}
                // thousandSeparator={","}
              />{" "}
              magazines
            </Typography>
          )}

          <ButtonGroup
            sx={{
              "--ButtonGroup-radius": "8px",
              "--ButtonGroup-separatorSize": "0px",
              "--ButtonGroup-connected": "0",
              "--joy-palette-neutral-plainHoverBg": "transparent",
              "--joy-palette-neutral-plainActiveBg": "transparent",
              "&:hover": {
                boxShadow: "inset 0px 0px 0px 1px var(--joy-palette-neutral-softBg)",
                "--ButtonGroup-connected": "1",
              },
            }}
          >
            <IconButton
              variant={viewType == "grid" ? "solid" : "soft"}
              color={viewType == "grid" ? "warning" : "neutral"}
              onClick={() => setViewType("grid")}
              sx={{
                p: 1,
                borderRadius: "8px 0 0 8px",
              }}
            >
              <ViewCompactIcon /> Grid View
            </IconButton>
            <IconButton
              variant={viewType == "list" ? "solid" : "soft"}
              color={viewType == "list" ? "warning" : "neutral"}
              onClick={() => setViewType("list")}
              sx={{
                p: 1,
                borderRadius: "0 8px 8px 0",
              }}
            >
              <ViewListIcon /> List View
            </IconButton>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        {isLoading && !isError && <LinearValueLoader progress={loadingPercent} />}
        {isError && <PageError error={error} />}

        {isSuccess && viewType == "grid" && (
          <React.Suspense fallback={<PageLoading />}>
            <MBinGrid items={magazinesData} />
          </React.Suspense>
        )}
        {isSuccess && viewType == "list" && (
          <React.Suspense fallback={<PageLoading />}>
            <MBinList items={magazinesData} />
          </React.Suspense>
        )}
      </Box>
    </Container>
  );
}
