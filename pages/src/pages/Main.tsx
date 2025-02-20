import React from "react";

import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

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
import IconButton from "@mui/joy/IconButton";

import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import GitHubIcon from "@mui/icons-material/GitHub";
import InfoIcon from "@mui/icons-material/Info";

import useQueryCache from "../hooks/useQueryCache";

import DocsModal from "../components/DocsModal";

import { IFileMeta } from "../types";

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
  openDocs?: () => void;
};

function LinkLine({ file, count = null, chip = undefined, openDocs }: ILinkLineProps) {
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
        {openDocs && (
          <IconButton
            size="md"
            variant="outlined"
            color={"neutral"}
            // sx={{ ml: "auto", alignSelf: "flex-start", flexShrink: 1 }}
            onClick={() => {
              openDocs();
            }}
          >
            <InfoIcon />
          </IconButton>
        )}
      </Typography>
    </ListItem>
  );
}

export default function Main() {
  const navigate = useNavigate();

  const [docsTypeOpen, setDocsTypeOpen] = React.useState<IFileMeta | null>(null);

  const fullFiles: IFileMeta[] = [
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
          <Link
            href="https://lemmyverse.net"
            target="_blank"
            sx={{
              marginLeft: 1,
            }}
          >
            https://lemmyverse.net
          </Link>
        </h1>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          m: 3,
        }}
      >
        <Button
          startDecorator={<GitHubIcon />}
          color="neutral"
          href="https://github.com/tgxn/lemmy-explorer"
          target="_lv_github"
          component="a"
        >
          View Code on GitHub
        </Button>
      </Box>

      <Box
        sx={{
          p: 2,
        }}
      >
        <Box
          sx={{
            fontWeight: "bold",
          }}
        >
          Data Last Updated
        </Box>
        {isSuccess && <Moment fromNow>{metaData.time}</Moment>}
      </Box>

      <h2>Main (Full) Files</h2>

      <List>
        {fullFiles.map((file) => {
          let count = null;
          if (file.count && metaData) {
            count = metaData[file.count];
          }
          return (
            <LinkLine
              file={file}
              count={count}
              key={file.path}
              chip={file.chip}
              openDocs={() => setDocsTypeOpen(file)}
            />
          );
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

      <DocsModal
        isOpen={!!docsTypeOpen}
        setOpen={() => {
          setDocsTypeOpen(false);
        }}
        docsFile={docsTypeOpen}
      />
    </Container>
  );
}
