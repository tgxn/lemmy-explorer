import React from "react";

import { Column } from "react-virtualized";

import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Tooltip from "@mui/joy/Tooltip";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import VirtualTable from "./VirtualTable";

import { TinyNumber } from "../Shared/Display";
import { CopyLink, ExtCommunityLink } from "../Shared/Link";

const KBin = React.memo(function ({ items }) {
  return (
    <VirtualTable items={items}>
      {({ width }) => [
        <Column
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
                    alt={rowData.title}
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
                    <ExtCommunityLink
                      community={{
                        baseurl: rowData.baseurl, // for link
                        name: rowData.preferred, // for link
                        title: rowData.name, // for display
                      }}
                    />
                    {/* <Tooltip
                      title={"Visit: " + rowData.title + (homeBaseUrl ? " inside " + homeBaseUrl : "")}
                      variant="soft"
                      placement="top-start"
                    >
                      <Link
                        level="body1"
                        variant="plain"
                        alt={rowData.name}
                        color="neutral"
                        href={
                          homeBaseUrl
                            ? `https://${homeBaseUrl}/c/${rowData.name}@${
                                rowData.url && rowData.url.split("/")[2]
                              }`
                            : rowData.url
                        }
                        target="_blank"
                        sx={{
                          color: "var(--joy-palette-primary-50)",
                        }}
                      >
                        {rowData.name} <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
                      </Link>
                    </Tooltip> */}
                  </Typography>

                  <Typography level="body3">
                    <CopyLink
                      copyText={`!${rowData.preferred}@${rowData.baseurl}`}
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
          label="Followers"
          dataKey="followers"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          cellRenderer={({ rowData }) => <TinyNumber value={rowData.followers} />}
        />,
      ]}
    </VirtualTable>
  );
});
export default KBin;
