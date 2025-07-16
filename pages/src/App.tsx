import React from "react";

import Moment from "react-moment";
import { NumericFormat } from "react-number-format";

import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Container from "@mui/joy/Container";
import Link from "@mui/joy/Link";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";

import GitHubIcon from "@mui/icons-material/GitHub";

import useQueryCache from "./hooks/useQueryCache";

type ISimpleNumberFormatProps = {
  value: number | string;
};

const SimpleNumberFormat = React.memo(({ value }: ISimpleNumberFormatProps) => {
  return <NumericFormat displayType="text" value={value} allowLeadingZeros thousandSeparator="," />;
});

type ILinkLineProps = {
  file: any;
  count: number;
  chip: string;
};

function LinkLine({ file, count = null, chip = undefined }: ILinkLineProps) {
  return (
    <ListItem
      key={file.path}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <ListItemContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {chip && (
            <Chip
              size={"sm"}
              variant="solid"
              color={chip === "Full" ? "primary" : "warning"}
              sx={{
                borderRadius: 0,
                marginRight: 1,
              }}
            >
              {chip}
            </Chip>
          )}
          <Link href={`data/${file.path}`}>{file.name}</Link>
        </Box>
        {file.desc && <Typography noWrap>{file.desc}</Typography>}
      </ListItemContent>
      <Typography>
        <SimpleNumberFormat value={count} />
      </Typography>
    </ListItem>
  );
}

export default function App() {
  const fullFiles = [
    {
      name: "Instance",
      chip: "Full",
      desc: "all known instances, with all fields",
      path: "instance.full.json",
      count: "instances",
    },
    {
      name: "Instance",
      chip: "Min",
      desc: "only name, baseurl, score",
      path: "instance.min.json",
      count: "instances",
    },
    {
      name: "Community",
      chip: "Full",
      desc: "an array of known communities, with all fields",
      path: "community.full.json",
      count: "communities",
    },
    {
      name: "MBin Instances",
      chip: "Min",
      desc: "an array of known mbin instances",
      path: "mbin.min.json",
      count: "mbin_instances",
    },
    {
      name: "MBin Magazines",
      chip: "Full",
      desc: "an array of known mbin magazines",
      path: "magazines.full.json",
      count: "magazines",
    },
  ];

  const partialFiles = [
    {
      name: "Overall Lemmy metadata",
      desc: "federated servers, counts, etc",
      path: "meta.json",
    },
    {
      name: "Suspicious sites metadata",
      desc: "sites that have certain suspicious traits",
      path: "sus.json",
    },
    {
      name: "All known fediverse servers & versions",
      path: "fediverse.json",
      count: "fediverse",
    },
    {
      name: "Fediverse software instances by software",
      path: "fediverse_software_sites.json",
      count: "fediverse",
    },
    {
      name: "Fediverse software by count",
      path: "fediverse_software_counts.json",
      count: "fediverse",
    },
  ];

  const { isLoading, isSuccess, isError, data: metaData } = useQueryCache("metaData", "meta");

  return (
    <Container
      maxWidth={"sm"}
      disableGutters={true}
      sx={{
        height: "100%",
        width: "100%",
        position: "absolute",
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        display: "block",
      }}
    >
      <Box>
        <h1>
          Lemmy Explorer Data
          <Link href="https://lemmyverse.net" target="_blank" sx={{ ml: 2 }}>
            https://lemmyverse.net
          </Link>
        </h1>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ color: "text.secondary", fontWeight: "bold" }}>Data Last Updated</Typography>
          {isSuccess && <Moment fromNow>{metaData.time}</Moment>}
        </Box>
        <Box
          sx={{
            p: 2,
            textAlign: "center",
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
        </Box>
      </Box>

      <h2>Main (Full) Files</h2>

      <List>
        {fullFiles.map((file) => {
          let count = null;
          if (file.count && metaData) {
            count = metaData[file.count];
          }
          return <LinkLine file={file} count={count} key={file.path} chip={file.chip} />;
        })}
      </List>

      <h2>Secondary (Partial, Supporting) Files</h2>

      <List>
        {partialFiles.map((file: any) => {
          let count: number = null;
          if (file.count && metaData) {
            count = metaData[file.count];
          }
          return <LinkLine file={file} count={count} key={file.path} chip={file.chip} />;
        })}
      </List>

      <h3>JSON ZIP File</h3>
      <Box
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ mb: 2 }}>
          This is a zip file containing all the JSON files listed above, as well as some additional files that
          might be useful.
        </Typography>
        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="data/json-bundle.zip" target="_lv_lemmyverse_zip" download>
            Download json-bundle.zip
          </Link>
          {/* Raw size would have to be calculated externally in the pipeline, so it's not available here. */}
          {/* <Typography sx={{ fontWeight: "bold" }}>
            <SimpleNumberFormat value={150} /> MB
          </Typography> */}
        </ListItem>
      </Box>

      <h3>Raw Data File</h3>
      <Box
        sx={{
          p: 2,
          // textAlign: "center",
        }}
      >
        <Typography sx={{ mb: 2 }} color="danger">
          Here Be Dragons.
        </Typography>
        <Typography sx={{ mb: 2 }}>
          This file is a raw dump of the Lemmyverse database. It's only really meant to use with a clone of
          this project.
        </Typography>
        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="data/lemmyverse.rdb" target="_lv_lemmyverse_rdb" download>
            Download lemmyverse.rdb
          </Link>
          {/* Raw size would have to be calculated externally in the pipeline, so it's not available here. */}
          {/* <Typography sx={{ fontWeight: "bold" }}>
            <SimpleNumberFormat value={150} /> MB
          </Typography> */}
        </ListItem>
      </Box>
    </Container>
  );
}
