import React from "react";

import axios from "axios";

import { useQuery } from "@tanstack/react-query";

import Container from "@mui/joy/Container";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Grid from "@mui/joy/Grid";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";
import Typography from "@mui/joy/Typography";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";

import CommunityCard from "../components/CommunityCard";
import Pagination from "../components/Pagination";

export default function Communities() {
  const [orderBy, setOrderBy] = React.useState("subscribers");
  const [showNsfw, setShowNsfw] = React.useState(false);
  const [hideNoBanner, setHideNoBanner] = React.useState(true);

  const [pageLimit, setPagelimit] = React.useState(100);
  const [page, setPage] = React.useState(0);

  const [filterText, setFilterText] = React.useState("");

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["communitiesData"],
    queryFn: () =>
      axios.get("/communities.json").then((res) => {
        return res.data;
      }),
    refetchOnWindowFocus: false,
  });

  const [totalFiltered, setTotalFiltered] = React.useState(0);
  const [communitiesData, setCommunitiesData] = React.useState([]);

  React.useEffect(() => {
    // process data

    if (!data) return;

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
          (community.name && community.name.toLowerCase().includes(filterText.toLowerCase())) ||
          (community.title && community.title.toLowerCase().includes(filterText.toLowerCase())) ||
          (community.desc && community.desc.toLowerCase().includes(filterText.toLowerCase()))
        );
      });
    }

    // hide no banner
    if (hideNoBanner) {
      communties = communties.filter((community) => {
        return community.banner != null;
      });
    }

    // pagination
    // const all_communties = communties;
    setTotalFiltered(communties.length);

    communties = communties.slice(page * pageLimit, (page + 1) * pageLimit);

    setCommunitiesData(communties);
  }, [data, showNsfw, orderBy, filterText, hideNoBanner, page, pageLimit]);

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

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
        <Box sx={{ display: "flex", gap: 3 }}>
          <Checkbox
            label="Hide No Banner"
            checked={hideNoBanner}
            onChange={(event) => setHideNoBanner(event.target.checked)}
          />
        </Box>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end", alignItems: "center" }}>
          <Pagination
            page={page}
            count={totalFiltered}
            setPage={(value) => setPage(value)}
            limit={pageLimit}
          />
        </Box>
      </Box>

      <Box sx={{ my: 4 }}>
        <div>{isFetching ? "Updating..." : ""}</div>

        <Grid container spacing={2}>
          {communitiesData.map((community) => (
            <CommunityCard community={community} />
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
