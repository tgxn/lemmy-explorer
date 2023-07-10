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

import useQueryCache from "./hooks/useQueryCache";

const SimpleNumberFormat = React.memo(({ value }) => {
  return (
    <NumericFormat
      displayType="text"
      value={value}
      allowLeadingZeros
      thousandSeparator=","
    />
  );
});

function LinkLine({ file, count }) {
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
        <Typography>
          <Link href={`data/${file.path}`}>{file.name}</Link>
        </Typography>
        {file.desc && (
          <Typography level="body2" noWrap>
            {file.desc}
          </Typography>
        )}
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
      name: "Instance - Full",
      desc: "all known instances, with all fields",
      path: "instance.full.json",
      count: "instances",
    },
    {
      name: "Instance - Min",
      desc: "only name, baseurl, score",
      path: "instance.min.json",
      count: "instances",
    },
    {
      name: "Community - Full",
      desc: "an array of known communities, with all fields",
      path: "community.full.json",
      count: "communities",
    },
    {
      name: "KBin Instances - Min",
      desc: "an array of known kbin instances",
      path: "kbin.min.json",
      count: "instances",
    },
    {
      name: "KBin Magazines - Full",
      desc: "an array of known kbin magazines",
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

  const {
    isLoading,
    isSuccess,
    isError,
    data: metaData,
  } = useQueryCache("metaData", "meta");

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
          Lemmyverse Data{" "}
          <Link href="https://lemmyverse.net" target="_blank">
            https://lemmyverse.net
          </Link>
        </h1>
      </Box>

      <Box>
        <Box>Data Last Updated</Box>
        {isSuccess && <Moment fromNow>{metaData.time}</Moment>}
      </Box>

      <h2>Main (Full) Files</h2>

      <List>
        {fullFiles.map((file) => {
          let count = null;
          if (file.count && metaData) {
            count = metaData[file.count];
          }
          return <LinkLine file={file} count={count} key={file.path} />;
        })}
      </List>

      <h2>Secondary (Partial, Supporting) Files</h2>

      <List>
        {partialFiles.map((file) => {
          let count = null;
          if (file.count && metaData) {
            count = metaData[file.count];
          }
          return <LinkLine file={file} count={count} key={file.path} />;
        })}
      </List>
    </Container>
  );
}
