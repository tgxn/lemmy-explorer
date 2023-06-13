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

export default function Overview() {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["overviewData"],
    queryFn: () =>
      axios.get("/overview.json").then((res) => {
        return res.data;
      }),
    refetchOnWindowFocus: false,
  });

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <Container maxWidth={false} sx={{}}>
      Site Overview Data
    </Container>
  );
}
