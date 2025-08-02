import React from "react";

import Moment from "react-moment";

import { Column } from "react-virtualized";

import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Tooltip from "@mui/joy/Tooltip";

import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RestoreIcon from "@mui/icons-material/Restore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import VirtualTable from "./VirtualTable";

import { TinyNumber } from "../Shared/Display";
import { CopyLink, ExtInstanceLink } from "../Shared/Link";

type IInstanceListProps = {
  items: any[];
};

function InstanceList({ items }: IInstanceListProps) {
  return (
    <VirtualTable items={items}>
      {({ width }) => [
        <Column
          key="title"
          label="Title"
          dataKey="title"
          flexGrow={1}
          flexShrink={1}
          width={width}
          minWidth={350}
          headerStyle={{
            justifyContent: "left",
          }}
          cellRenderer={({ rowData }) => {
            // console.log(rowData);
            return (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    // pt: 1.5,

                    p: 1,
                    px: 3,
                  }}
                >
                  <Avatar
                    alt={rowData.name}
                    src={rowData.icon}
                    sx={{
                      display: "flex",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 0.5,
                    flexGrow: 1,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    level="body3"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <ExtInstanceLink
                      instance={rowData}
                      sx={{
                        color: "var(--joy-palette-primary-50)",
                      }}
                    />
                  </Typography>

                  <Typography level="body3">
                    <CopyLink
                      copyText={rowData.baseurl}
                      linkProps={{
                        variant: "plain",
                        color: "neutral",
                        sx: {
                          color: "var(--joy-palette-primary-50)",
                        },
                      }}
                    />
                  </Typography>
                </Box>
              </Box>
            );
          }}
        />,

        <Column
          key="users"
          label="Active Users"
          dataKey="counts"
          width={width}
          flexShrink={1}
          headerStyle={{
            justifyContent: "left",
          }}
          cellRenderer={({ rowData }) => (
            <>
              Week: <TinyNumber value={rowData.counts.users_active_week} /> / Month:{" "}
              <TinyNumber value={rowData.counts.users_active_month} />
            </>
          )}
        />,

        <Column
          key="posts"
          label="Posts"
          dataKey="posts"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.posts} />}
        />,

        <Column
          key="comments"
          label="Comments"
          dataKey="comments"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.comments} />}
        />,

        <Column
          key="blocks"
          label="Blocks"
          dataKey="blocks"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          cellRenderer={({ rowData }) => (
            <Box
              sx={{
                px: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Tooltip title="This instance's blocklist" variant="soft" placement="top-start">
                <Box
                  sx={{
                    px: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <KeyboardDoubleArrowUpIcon /> {rowData.blocks.outgoing}
                </Box>
              </Tooltip>

              <Tooltip title="Instances blocking this one" variant="soft" placement="top-start">
                <Box
                  sx={{
                    px: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <KeyboardDoubleArrowDownIcon /> {rowData.blocks.incoming}
                </Box>
              </Tooltip>
            </Box>
          )}
        />,

        <Column
          key="version"
          label="Version"
          dataKey="version"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          cellRenderer={({ rowData }) => <TinyNumber value={rowData.version} />}
        />,

        <Column
          key="first_seen"
          label="First Seen"
          dataKey="first_seen"
          width={width}
          headerStyle={{
            justifyContent: "flex-start",
          }}
          style={{
            display: "flex",
            justifyContent: "flex-start",
          }}
          cellRenderer={({ rowData }) => {
            if (rowData.uptime?.uptime_alltime)
              return (
                <>
                  <Tooltip title="First Seen" variant="soft" placement="top-start">
                    <Box
                      sx={{
                        cursor: "default",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <RestoreIcon />
                        <Moment fromNow>{rowData.uptime?.date_created}</Moment>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <TrendingUpIcon />
                        {rowData.uptime?.uptime_alltime}%
                      </Box>
                    </Box>
                  </Tooltip>
                </>
              );

            if (!rowData.uptime?.uptime_alltime)
              return (
                <>
                  <ThumbDownIcon />
                </>
              );
          }}
        />,
      ]}
    </VirtualTable>
  );
}

export default React.memo(InstanceList);
