import React from "react";

import useQueryCache from "../hooks/useQueryCache";

import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";

import GitHubIcon from "@mui/icons-material/GitHub";
import ForumIcon from "@mui/icons-material/Forum";

export default function Overview() {
  const {
    isLoading,
    isSuccess,
    isError,
    error,
    data: overviewData,
  } = useQueryCache("overviewData", "/overview.json");

  if (isLoading) return "Loading...";
  if (isError) return "An error has occurred: " + error.message;

  return (
    <Container maxWidth={"md"} sx={{}}>
      <Typography
        level="h2"
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 2,
        }}
      >
        Lemmy Explorer
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          m: 3,
        }}
      >
        <Button
          startDecorator={<GitHubIcon />}
          href="https://github.com/tgxn/lemmy-explorer"
          target="_lv_github"
          component="a"
        >
          View Code on GitHub
        </Button>
        <Button
          startDecorator={<ForumIcon />}
          color="info"
          href="https://github.com/tgxn/lemmy-explorer/discussions"
          target="_lv_github"
          component="a"
        >
          Discussions on GitHub
        </Button>
      </Box>
      <Typography
        level="h3"
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        About
      </Typography>

      <Typography
        level="body1"
        sx={{
          display: "flex",
          p: 2,
          mb: 2,
        }}
      >
        This is a project that aims to provide a simple way to explore Lemmy Instances and Communities.
      </Typography>

      <Typography level="body1" sx={{ display: "flex", p: 2, mb: 2 }}>
        All data was retrieved within 24 hours of the last updated time shown in the menu.
      </Typography>

      <Typography
        level="h3"
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        Crawler Info
      </Typography>

      <Box
        sx={{
          display: "flex",

          flexDirection: "column",
          p: 2,
          mb: 2,
        }}
      >
        <Typography level="body1" sx={{ mb: 2 }}>
          We use a web crawler to power the Lemmyverse Explorer.
        </Typography>

        <Typography
          level="body1"
          sx={{
            mb: 2,
          }}
        >
          We do not crawl or store user accounts or other PII, just publically-available statistical instance
          data.
        </Typography>

        <Typography level="body1" sx={{ mb: 2 }}>
          We run a crawler across all Lemmy Fediverse servers, scanning each server no more than once every 12
          hours.
        </Typography>

        <Typography
          level="body1"
          sx={{
            mb: 1,
          }}
        >
          We use the following headers when scraping websites:
        </Typography>

        <Card variant="outlined" sx={{ m: 0 }}>
          <Typography component="pre">"User-Agent": "lemmy-explorer-crawler/1.0.0"</Typography>
          <Typography component="pre">"X-Lemmy-SiteUrl": "https://lemmyverse.net"</Typography>
        </Card>
      </Box>
    </Container>
  );
}
