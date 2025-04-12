import React from "react";

import { useSelector } from "react-redux";

import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Link from "@mui/joy/Link";
import Divider from "@mui/joy/Divider";

import GitHubIcon from "@mui/icons-material/GitHub";
import PaidIcon from "@mui/icons-material/Paid";
import DataObjectIcon from "@mui/icons-material/DataObject";

// this is a Button that links to a Lemmy instance
// it should be outlined, green and have a Lemmy icon
function LemmyLink({ children }: { children: React.ReactNode }) {
  return (
    <Button
      startDecorator={<img src="/icons/Lemmy_Logo.svg" alt="Lemmy" width="16" height="16" />}
      color="success"
      variant="outlined"
      href="https://join-lemmy.org/"
      component="a"
      target="_lv_join-lemmy"
      sx={{
        mx: 1,
        height: 28,
        minHeight: 28,
      }}
    >
      {children}
    </Button>
  );
}

export default function About() {
  // get state.configReducer.homeBaseUrl
  const homeBaseUrl = useSelector((state: any) => state.configReducer.homeBaseUrl);
  const instanceType = useSelector((state: any) => state.configReducer.instanceType);

  const authorMessageLink = React.useMemo(() => {
    let baseLink = "https://lemmy.tgxn.net/u/tgxn";

    // user has a home instance
    if (homeBaseUrl && instanceType != "mbin") {
      baseLink = `https://${homeBaseUrl}/u/tgxn@lemmy.tgxn.net`;
    }

    return baseLink;
  }, [homeBaseUrl, instanceType]);

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
          startDecorator={
            <Box
              component="div"
              sx={{
                width: 30,
                height: 30,
                // dont change item size on flex
                flexShrink: 0,
                pr: 2,
                ml: 2,
                mr: 2,
                background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
                backgroundSize: "contain",
              }}
            />
          }
          color="warning"
          href={authorMessageLink}
          target="_lv_message"
          component="a"
        >
          Message me on Lemmy
        </Button>
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
          Donate
        </Button>
        <Button
          startDecorator={<DataObjectIcon />}
          color="neutral"
          href="https://data.lemmyverse.net"
          target="_lv_data"
          component="a"
        >
          Data Access
        </Button>
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
          This is a project that aims to provide a simple way to explore <LemmyLink>Lemmy</LemmyLink>
          Instances and Communities.
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
            <li>Logo made by Andy Cuccaro (@andycuccaro) under the CC-BY-SA 4.0 license.</li>{" "}
            <li>
              Lemmy Developers and Community for creating{" "}
              <Link component="a" href="https://github.com/LemmyNet" target="_lv_lemmy">
                Lemmy
              </Link>
              .
            </li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
}
