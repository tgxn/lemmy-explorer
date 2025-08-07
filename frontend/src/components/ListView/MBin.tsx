import React from "react";

import { Column } from "react-virtualized";

import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

import type { IMBinMagazineOutput } from "../../../../types/output";

import VirtualTable from "./VirtualTable";
import { TinyNumber } from "../Shared/Display";
import { CopyLink, ExtCommunityLink } from "../Shared/Link";

type IMBinListProps = {
  items: IMBinMagazineOutput[];
};

function MBinList({ items }: IMBinListProps) {
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
          cellRenderer={({ rowData }: { rowData: IMBinMagazineOutput }) => {
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
                      baseType="mbin"
                      community={{
                        baseurl: rowData.baseurl, // for link
                        name: rowData.name, // for link
                        title: rowData.title, // for display
                      }}
                    />
                  </Typography>

                  <Typography level="body3">
                    <CopyLink
                      copyText={`!${rowData.name}@${rowData.baseurl}`}
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
          label="Subscriptions"
          dataKey="subscriptions"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          cellRenderer={({ rowData }) => <TinyNumber value={rowData.subscriptions} />}
        />,
        <Column
          label="Posts"
          dataKey="posts"
          width={width}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          cellRenderer={({ rowData }) => <TinyNumber value={rowData.posts} />}
        />,
      ]}
    </VirtualTable>
  );
}

export default React.memo(MBinList);
