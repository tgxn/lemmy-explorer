import React from "react";

import axios from "axios";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Container from "@mui/joy/Container";

import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

// import Pagination from "@mui/material/Pagination";
import Input from "@mui/joy/Input";
import Autocomplete from "@mui/joy/Autocomplete";

import Grid from "@mui/joy/Grid";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";

import Chip from "@mui/joy/Chip";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";

import { useColorScheme } from "@mui/joy/styles";

import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import SortIcon from "@mui/icons-material/Sort";

import CommunityCard from "../components/CommunityCard";

function Pagination({ page, setPage, count, limit }) {
  const handleChange = (event, value) => {
    setPage(value - 1);
  };
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 2,
      }}
    >
      <Chip>One Page</Chip>
      {/* <Chip slotProps={{ action: { component: "a", href: "" } }}>Anchor chip</Chip>
      <Chip slotProps={{ action: { component: "a", href: "" } }}>Anchor chip</Chip> */}
    </Box>
  );
}

export default function Communities() {
  const [orderBy, setOrderBy] = React.useState("subscribers");
  const [showNsfw, setShowNsfw] = React.useState(false);

  const [pagelimit, setPagelimit] = React.useState(100);
  const [page, setPage] = React.useState(0);

  const [filterText, setFilterText] = React.useState("");

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["communitiesData"],
    queryFn: () =>
      axios.get("/communities.json").then((res) => {
        return res.data;
      }),
    // dont update
    // refetchInterval: 1000,
    // refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    // refetchOnMount: true,
  });

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  // process data

  let communties = data;
  console.log(communties);

  if (!showNsfw) {
    communties = communties.filter((community) => {
      return !community.nsfw;
    });
  }

  if (orderBy === "subscribers") {
    communties = communties.sort((a, b) => b.counts.subscribers - a.counts.subscribers);
  } else if (orderBy === "active") {
    communties = communties.sort((a, b) => b.counts.users_active_week - a.counts.users_active_week);
  } else if (orderBy === "posts") {
    communties = communties.sort((a, b) => b.counts.posts - a.counts.posts);
  } else if (orderBy === "comments") {
    communties = communties.sort((a, b) => b.counts.comments - a.counts.comments);
  }

  if (filterText) {
    communties = communties.filter((community) => {
      return (
        community.name.toLowerCase().includes(filterText.toLowerCase()) ||
        community.title.toLowerCase().includes(filterText.toLowerCase()) ||
        community.description.toLowerCase().includes(filterText.toLowerCase())
      );
    });
  }

  // first 1000 only HARDCODE
  communties = communties.slice(0, 50);

  return (
    <Container
      maxWidth="xl"
      sx={{
        overflow: "auto",
        height: "100%",
      }}
    >
      <Box
        component="header"
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Input
          placeholder="Filter Communities"
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
        />
        <Typography fontWeight="lg">
          <Select
            placeholder="Order By"
            startDecorator={<SortIcon />}
            indicator={<KeyboardArrowDown />}
            value={orderBy}
            onChange={(event, newValue) => {
              setOrderBy(newValue);
            }}
            sx={{
              width: 240,
              [`& .${selectClasses.indicator}`]: {
                transition: "0.2s",
                [`&.${selectClasses.expanded}`]: {
                  transform: "rotate(-180deg)",
                },
              },
            }}
          >
            <Option value="subscribers">Subscribers</Option>
            <Option value="active">Active Users</Option>
            <Option value="posts">Posts</Option>
            <Option value="comments">Comments</Option>
          </Select>
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Checkbox
            label="Show NSFW"
            checked={showNsfw}
            onChange={(event) => setShowNsfw(event.target.checked)}
          />
        </Box>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end", alignItems: "center" }}>
          <Pagination />
        </Box>
      </Box>

      <ReactQueryDevtools initialIsOpen={false} />
      <Box sx={{ my: 4 }}>
        <div>{isFetching ? "Updating..." : ""}</div>

        <Grid container spacing={2}>
          {communties.map((community) => (
            <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
              <CommunityCard community={community} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
