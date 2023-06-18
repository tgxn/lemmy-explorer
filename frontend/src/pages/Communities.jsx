import React, { useState, useEffect } from "react";

import useStorage from "../hooks/useStorage";
import useQueryCache from "../hooks/useQueryCache";
import { useDebounce } from "@uidotdev/usehooks";

import Container from "@mui/joy/Container";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Grid from "@mui/joy/Grid";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";

import CommunityCard from "../components/CommunityCard";
import Pagination from "../components/Pagination";
import { PageLoading, PageError } from "../components/Display";

import CommunityGrid from "../components/CommunityGrid";

// const CommunityGrid = React.memo(function (props) {
//   const { items } = props;

//   return (
//     <Grid container spacing={2}>
//       {items.map((community, index) => (
//         <CommunityCard key={index} community={community} />
//       ))}
//     </Grid>
//   );
// });

export default function Communities() {
  const { isLoading, isSuccess, isError, error, data } = useQueryCache(
    "communitiesData",
    "/communities.json",
  );
  const [processingData, setProcessingData] = React.useState(true);

  const [orderBy, setOrderBy] = useStorage("community.orderBy", "smart");
  const [showNsfw, setShowNsfw] = useStorage("community.showNsfw", false);

  const [hideNoBanner, setHideNoBanner] = useStorage("community.hideWithNoBanner", false);

  // debounce the filter text input
  const [filterText, setFilterText] = useStorage("community.filterText", "");
  const debounceFilterText = useDebounce(filterText, 500);

  const [communitiesData, setCommunitiesData] = React.useState([]);

  // this applies the filtering and sorting to the data loaded from .json
  React.useEffect(() => {
    if (isError) return;
    if (!data) return;

    console.time("sort+filter");

    setProcessingData(true);

    console.log(`Loaded ${data.length} communities`);

    let communties = [...data];

    // hide nsfw
    if (!showNsfw) {
      console.log(`Hiding NSFW communities`);
      communties = communties.filter((community) => {
        return !community.nsfw;
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

    setProcessingData(false);
    setCommunitiesData(communties);

    console.timeEnd("sort+filter");
    // console.log("sort+filter", communties);
  }, [data, showNsfw, orderBy, debounceFilterText, hideNoBanner]);

  return (
    <Container maxWidth={false} sx={{}}>
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
          <Checkbox
            label="Show NSFW"
            checked={showNsfw}
            onChange={(event) => setShowNsfw(event.target.checked)}
          />

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
            justifyContent: { xs: "center", sm: "flex-end" },
            alignItems: "center",
          }}
        >
          {/* right side - view change buttons here */}
        </Box>
      </Box>

      <Box sx={{ my: 4 }}>
        {(isLoading || (processingData && !isError)) && <PageLoading />}
        {isError && <PageError error={error} />}

        {isSuccess && <CommunityGrid items={communitiesData} />}
      </Box>
    </Container>
  );
}
