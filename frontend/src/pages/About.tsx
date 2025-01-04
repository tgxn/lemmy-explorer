import React from "react";

import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Link from "@mui/joy/Link";
import Divider from "@mui/joy/Divider";

import GitHubIcon from "@mui/icons-material/GitHub";
import ForumIcon from "@mui/icons-material/Forum";
import PaidIcon from "@mui/icons-material/Paid";

export default function About() {
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

      {/* top links section */}
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
          startDecorator={<PaidIcon />}
          color="info"
          href="https://paypal.me/tgxn"
          target="_lv_paypal"
          component="a"
        >
          Buy me a coffee
        </Button>
        {/* <Button
          startDecorator={<ForumIcon />}
          color="info"
          href="https://github.com/tgxn/lemmy-explorer/discussions"
          target="_lv_github"
          component="a"
        >
          Discussions on GitHub
        </Button> */}
      </Box>

      {/* About section */}
      <Box
        sx={{
          py: 2,
          "& .MuiTypography-root": {
            pb: 1,
          },
        }}
      >
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

        <Typography>
          This is a project that aims to provide a simple way to explore Lemmy Instances and Communities.
        </Typography>

        <Typography>
          All data was retrieved within 24 hours of the last updated time shown in the menu.
        </Typography>

        <Typography>
          Some data we use comes from other sources:
          <ul>
            <li>
              <Link component="a" href="https://fediverse.observer/" target="_lv_fediverse">
                Fediverse Explorer API
              </Link>
            </li>
            <li>
              <Link component="a" href="https://fediseer.com/" target="_lv_fediseer">
                Fediseer API
              </Link>
            </li>
          </ul>
        </Typography>
      </Box>

      <Divider />

      {/* Crawler info */}
      <Box
        sx={{
          py: 2,
          "& .MuiTypography-root": {
            pb: 1,
          },
        }}
      >
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

        <Typography>We use a web crawler to power the Lemmyverse Explorer.</Typography>

        <Typography>
          We don't crawl or store user accounts or other PII, just publically-available statistical instance
          data.
        </Typography>

        <Typography>
          We run a crawler across all Lemmy Fediverse servers, scanning each server no more than once every 12
          hours.
        </Typography>

        <Typography>We use the following headers when scraping websites:</Typography>

        <Card variant="outlined" sx={{ m: 0 }}>
          <Typography component="pre">"User-Agent": "lemmy-explorer-crawler/1.0.0"</Typography>
          <Typography component="pre">"X-Lemmy-SiteUrl": "https://lemmyverse.net"</Typography>
        </Card>
      </Box>

      <Divider />

      {/* Credits */}
      <Box
        sx={{
          py: 2,
          "& .MuiTypography-root": {
            pb: 1,
          },
        }}
      >
        <Typography
          level="h3"
          gutterBottom
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          Credits
        </Typography>

        <Typography>
          <ul>
            <li>Logo made by Andy Cuccaro (@andycuccaro) under the CC-BY-SA 4.0 license.</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
}
