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

import InstanceCard from "../components/InstanceCard";
import Pagination from "../components/Pagination";

export default function Instances() {
  const [orderBy, setOrderBy] = React.useState("users");
  const [showOpenOnly, setShowOpenOnly] = React.useState(false);

  const [pageLimit, setPagelimit] = React.useState(100);
  const [page, setPage] = React.useState(0);

  const [filterText, setFilterText] = React.useState("");

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["instanceData"],
    queryFn: () =>
      axios.get("/instances.json").then((res) => {
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

  let instances = data;
  if (showOpenOnly) {
    instances = instances.filter((instance) => instance.open);
  }

  if (orderBy === "users") {
    instances = instances.sort((a, b) => b.usage.users.total - a.usage.users.total);
  } else if (orderBy === "active") {
    instances = instances.sort((a, b) => b.usage.users.activeMonth - a.usage.users.activeMonth);
  } else if (orderBy === "posts") {
    instances = instances.sort((a, b) => b.usage.localPosts - a.usage.localPosts);
  } else if (orderBy === "comments") {
    instances = instances.sort((a, b) => b.usage.localComments - a.usage.localComments);
  }

  if (filterText) {
    instances = instances.filter((instance) => {
      if (instance.name && instance.name.toLowerCase().includes(filterText.toLowerCase())) return true;
      if (instance.desc && instance.desc.toLowerCase().includes(filterText.toLowerCase())) return true;
      if (instance.url && instance.url.toLowerCase().includes(filterText.toLowerCase())) return true;
      return false;
    });
  }

  // pagination
  const all_instances = instances;
  instances = instances.slice(page * pageLimit, (page + 1) * pageLimit);

  return (
    <Container maxWidth={false} sx={{}}>
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
          placeholder="Filter Instances"
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
            <Option value="users">Users</Option>
            <Option value="active">Active Users</Option>
            <Option value="posts">Posts</Option>
            <Option value="comments">Comments</Option>
          </Select>
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Checkbox
            label="Open Only"
            checked={showOpenOnly}
            onChange={(event) => setShowOpenOnly(event.target.checked)}
          />
        </Box>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end", alignItems: "center" }}>
          <Pagination
            page={page}
            count={all_instances.length}
            setPage={(value) => setPage(value)}
            limit={pageLimit}
          />
        </Box>
      </Box>

      <ReactQueryDevtools initialIsOpen={false} />
      <Box sx={{ my: 4 }}>
        <div>{isFetching ? "Updating..." : ""}</div>

        <Grid container spacing={2}>
          {instances.map((instance) => (
            <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
              <InstanceCard instance={instance} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
