import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import useStorage from "../hooks/useStorage";
import useQueryCache from "../hooks/useQueryCache";
import { useDebounce } from "@uidotdev/usehooks";

import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";

import ButtonGroup from "@mui/joy/ButtonGroup";
import IconButton from "@mui/joy/IconButton";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewListIcon from "@mui/icons-material/ViewList";

import { PageLoading, PageError, SimpleNumberFormat } from "../components/Display";
import { CommunityGrid } from "../components/GridView";
import { CommunityList } from "../components/ListView";
import TriStateCheckbox from "../components/TriStateCheckbox";

function Communities({ homeBaseUrl }) {
  const { isLoading, isSuccess, isError, error, data } = useQueryCache(
    "communitiesData",
    "/communities.json",
  );

  const [viewType, setViewType] = useStorage("community.viewType", "grid");

  const [orderBy, setOrderBy] = useStorage("community.orderBy", "smart");
  const [showNSFW, setShowNSFW] = useStorage("community.showNSFW", false);

  const [hideNoBanner, setHideNoBanner] = useStorage("community.hideWithNoBanner", false);

  // debounce the filter text input
  const [filterText, setFilterText] = useStorage("community.filterText", "");
  const debounceFilterText = useDebounce(filterText, 500);

  // this applies the filtering and sorting to the data loaded from .json
  const communitiesData = React.useMemo(() => {
    if (isError) return [];
    if (!data) return [];

    console.time("sort+filter communities");
    console.log(`Loaded ${data.length} communities`);

    let communties = [...data];

    // Variable "ShowNSFW" is used to drive this
    //  Default:    Hide NSFW     false
    if (showNSFW == false) {
      console.log(`Hiding NSFW communities`);
      communties = communties.filter((community) => {
        return !community.nsfw;
      });
    }

    //  One Click:  Include NSFW  null
    else if (showNSFW == null) {
      console.log(`Including NSFW communities`);
    }

    //  Two Clicks: NSFW Only     true
    else if (showNSFW == true) {
      console.log(`Showing NSFW communities`);
      communties = communties.filter((community) => {
        return community.nsfw;
      });
    }

    // filter string
    if (debounceFilterText) {
      console.log(`Filtering communities by ${debounceFilterText}`);
      communties = communties.filter((community) => {
        return (
          (community.name && community.name.toLowerCase().includes(debounceFilterText.toLowerCase())) ||
          (community.title && community.title.toLowerCase().includes(debounceFilterText.toLowerCase())) ||
          (community.desc && community.desc.toLowerCase().includes(debounceFilterText.toLowerCase()))
        );
      });
    }

    // hide no banner
    if (hideNoBanner) {
      console.log(`Hiding communities with no banner`);
      communties = communties.filter((community) => {
        return community.banner != null;
      });
    }
    console.log(`Filtered ${communties.length} communities`);

    // sorting

    if (orderBy === "smart") {
      communties = communties.sort((a, b) => b.score - a.score);
    } else if (orderBy === "subscribers") {
      communties = communties.sort((a, b) => b.counts.subscribers - a.counts.subscribers);
    } else if (orderBy === "active") {
      communties = communties.sort((a, b) => b.counts.users_active_week - a.counts.users_active_week);
    } else if (orderBy === "posts") {
      communties = communties.sort((a, b) => b.counts.posts - a.counts.posts);
    } else if (orderBy === "comments") {
      communties = communties.sort((a, b) => b.counts.comments - a.counts.comments);
    }
    console.log(`Sorted ${communties.length} communities`);

    console.log(
      `updating communities data with ${communties.length} communities, removed: ${
        data.length - communties.length
      }`,
    );

    console.timeEnd("sort+filter communities");

    // return a clone so that it triggers a re-render  on sort
    return [...communties];
  }, [data, showNSFW, orderBy, debounceFilterText, hideNoBanner]);

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
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Filter Communities"
          value={filterText}
          sx={{
            width: { xs: "100%", sm: 240 },
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
          <Option value="smart">Smart Sort</Option>
          <Option value="subscribers">Subscribers</Option>
          <Option value="active">Active Users</Option>
          <Option value="posts">Posts</Option>
          <Option value="comments">Comments</Option>
        </Select>

        <Box sx={{ display: "flex", gap: 3 }}>
          <TriStateCheckbox checked={showNSFW} onChange={(checked) => setShowNSFW(checked)} />

          <Checkbox
            label="Hide No Banner"
            checked={hideNoBanner}
            onChange={(event) => setHideNoBanner(event.target.checked)}
          />
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
            <Chip
              sx={{
                borderRadius: "4px",
                mr: 1,
              }}
              color="neutral"
            >
              Showing{" "}
              <SimpleNumberFormat
                value={communitiesData.length}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={","}
              />{" "}
              communities
            </Chip>
          )}

          <ButtonGroup
            sx={{
              "--ButtonGroup-radius": "3px",
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
              variant={viewType == "grid" ? "soft" : "plain"}
              onClick={() => setViewType("grid")}
              sx={{
                p: 1,
              }}
            >
              <ViewCompactIcon /> Grid View
            </IconButton>
            <IconButton
              variant={viewType == "list" ? "soft" : "plain"}
              onClick={() => setViewType("list")}
              sx={{
                p: 1,
              }}
            >
              <ViewListIcon /> List View
            </IconButton>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ my: 4 }}>
        {isLoading && !isError && <PageLoading />}
        {isError && <PageError error={error} />}
        {isSuccess && viewType == "grid" && (
          <CommunityGrid items={communitiesData} homeBaseUrl={homeBaseUrl} />
        )}
        {isSuccess && viewType == "list" && (
          <CommunityList items={communitiesData} homeBaseUrl={homeBaseUrl} />
        )}
      </Box>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(Communities);
