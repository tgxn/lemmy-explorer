import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

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
import Checkbox from "@mui/joy/Checkbox";

import ButtonGroup from "@mui/joy/ButtonGroup";
import IconButton from "@mui/joy/IconButton";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewListIcon from "@mui/icons-material/ViewList";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { LinearValueLoader, PageError, SimpleNumberFormat } from "../components/Shared/Display";
import TriStateCheckbox from "../components/Shared/TriStateCheckbox";
import InstanceFilter from "../components/Shared/InstanceFilter";

import CommunityGrid from "../components/GridView/Community";
import CommunityList from "../components/ListView/Community";

function Communities({ filterSuspicious, filteredInstances }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { isLoading, loadingPercent, isSuccess, isError, error, data } = useCachedMultipart(
    "communityData",
    "community",
  );

  const [viewType, setViewType] = useStorage("community.viewType", "grid");

  const [orderBy, setOrderBy] = React.useState("smart");
  const [showNSFW, setShowNSFW] = React.useState(false);
  const [hideNoBanner, setHideNoBanner] = React.useState(false);

  // debounce the filter text input
  const [filterText, setFilterText] = React.useState("");
  const debounceFilterText = useDebounce(filterText, 100);

  // load query params
  useEffect(() => {
    if (searchParams.has("query")) setFilterText(searchParams.get("query"));
    if (searchParams.has("order")) setOrderBy(searchParams.get("order"));
    if (searchParams.has("nsfw"))
      setShowNSFW(
        searchParams.get("nsfw") == "true" ? true : searchParams.get("nsfw") == "null" ? null : false,
      );
    if (searchParams.has("banner")) setHideNoBanner(searchParams.get("banner"));
  }, []);

  // update query params
  useEffect(() => {
    const parms = {};

    if (filterText) parms.query = filterText;
    if (orderBy != "smart") parms.order = orderBy;
    if (showNSFW != false) parms.nsfw = showNSFW;
    if (hideNoBanner != false) parms.banner = hideNoBanner;

    setSearchParams(parms);
  }, [orderBy, showNSFW, hideNoBanner, filterText]);

  // this applies the filtering and sorting to the data loaded from .json
  const communitiesData = React.useMemo(() => {
    if (isError) return [];
    if (!data) return [];

    console.time("sort+filter communities");
    console.log(`Loaded ${data.length} communities`);

    let communties = [...data];

    // hide sus instances by default
    if (filterSuspicious) {
      communties = communties.filter((community) => !community.isSuspicious);
    }

    console.log(`Sorting communities by ${orderBy}`, filteredInstances);
    if (filteredInstances.length > 0) {
      console.log(`Filtering oucommunities`, filteredInstances);

      communties = communties.filter((community) => !filteredInstances.includes(community.baseurl));
    }

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

      // split the value on spaces, look for values starting with "-"
      // if found, remove the "-" and add to the exclude list
      // if not found, apend to the search query
      let exclude = [];
      let include = [];

      let searchTerms = debounceFilterText.toLowerCase().split(" ");
      searchTerms.forEach((term) => {
        if (term.startsWith("-") && term.substring(1) !== "") {
          exclude.push(term.substring(1));
        } else if (term !== "") {
          include.push(term);
        }
      });
      console.log(`Include: ${include.join(", ")}`);
      console.log(`Exclude: ${exclude.join(", ")}`);

      // search for any included terms
      if (include.length > 0) {
        console.log(`Searching for ${include.length} terms`);
        include.forEach((term) => {
          communties = communties.filter((community) => {
            return (
              (community.name && community.name.toLowerCase().includes(term)) ||
              (community.title && community.title.toLowerCase().includes(term)) ||
              (community.baseurl && community.baseurl.toLowerCase().includes(term)) ||
              (community.desc && community.desc.toLowerCase().includes(term))
            );
          });
        });
      }

      // filter out every excluded term
      if (exclude.length > 0) {
        console.log(`Filtering out ${exclude.length} terms`);
        exclude.forEach((term) => {
          communties = communties.filter((community) => {
            return !(
              (community.name && community.name.toLowerCase().includes(term)) ||
              (community.title && community.title.toLowerCase().includes(term)) ||
              (community.baseurl && community.baseurl.toLowerCase().includes(term)) ||
              (community.desc && community.desc.toLowerCase().includes(term))
            );
          });
        });
      }
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
  }, [data, showNSFW, orderBy, debounceFilterText, hideNoBanner, filterSuspicious, filteredInstances]);

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

        <InstanceFilter />

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
            <Typography
              level="body2"
              sx={{
                borderRadius: "4px",
                mr: 2,
              }}
            >
              showing{" "}
              <SimpleNumberFormat
                value={communitiesData.length}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={","}
              />{" "}
              communities
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
              color={viewType == "grid" ? "primary" : "neutral"}
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
              color={viewType == "list" ? "primary" : "neutral"}
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

        {isSuccess && viewType == "grid" && <CommunityGrid items={communitiesData} />}
        {isSuccess && viewType == "list" && <CommunityList items={communitiesData} />}
      </Box>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  filterSuspicious: state.configReducer.filterSuspicious,
  filteredInstances: state.configReducer.filteredInstances,
});
export default connect(mapStateToProps)(Communities);
