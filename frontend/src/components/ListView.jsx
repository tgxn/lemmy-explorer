import React from "react";

import {
  defaultTableRowRenderer,
  AutoSizer,
  Column,
  Table as VirtualTable,
  WindowScroller,
} from "react-virtualized";

import Avatar from "@mui/joy/Avatar";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/joy/Box";
import Tooltip from "@mui/joy/Tooltip";
import Link from "@mui/joy/Link";
import IconButton from "@mui/joy/IconButton";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import HomeIcon from "@mui/icons-material/Home";

import { TinyNumber, BannerImage } from "./Display";
import CopyLink from "./CopyLink";

export const CommunityList = React.memo(function CommunityList({ items, homeBaseUrl }) {
  return (
    <WindowScroller>
      {({ height, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <VirtualTable
              autoHeight
              headerHeight={40}
              // header center and center
              headerStyle={{
                display: "flex",
                justifyContent: "center",
                alignItems: "top",
                padding: "10px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
              gridStyle={{
                // odd even
                "&:nth-of-type(odd)": {
                  backgroundColor: "rgba(224, 224, 224, 1)",
                },
              }}
              height={height}
              overscanRowCount={5}
              rowCount={items.length}
              rowGetter={({ index }) => items[index]}
              rowHeight={70}
              width={width}
              scrollTop={scrollTop}
              rowStyle={{
                display: "flex",
                // padding: "10px",
                justifyContent: "space-between",
                alignItems: "center",
                // border: "1px solid rgba(224, 224, 224, 1)",
                borderRadius: "8px",
              }}
              rowRenderer={(props) => {
                const { key, columns, index, rowIndex, style, rowData } = props;
                const odd = !(index % 2);
                return (
                  <div style={{}}>
                    {defaultTableRowRenderer({
                      ...props,
                      style: {
                        ...props.style,
                        // bg image as banner
                        opacity: 1,
                        m: "4px",
                        height: "60px",

                        backgroundImage: rowData.banner ? `url(${rowData.banner}) 50%` : null,
                        opacity: rowData.banner ? 0.85 : 1,
                        backgroundSize: "cover",
                        backgroundPosition: "left",
                        backgroundRepeat: "no-repeat",
                        backgroundColor: odd ? "rgba(0, 0, 0, 0.1)" : "rgba(25, 25, 25, .5)",
                        "&::before": {
                          content: `''`,
                          display: "block",
                          position: "absolute",
                          top: "0px",
                          right: "0px",
                          bottom: "0px",
                          left: "0px",
                          backgroundColor: "#000000bf",
                        },
                      },
                    })}
                  </div>
                );
              }}
              style={{}}
            >
              <Column
                label="Title"
                dataKey="title"
                flexGrow={1}
                flexShrink={1}
                width={width}
                headerStyle={{
                  justifyContent: "left",
                }}
                cellRenderer={({ rowData }) => {
                  console.log(rowData);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          pt: 1.5,
                          px: 0.25,
                          pr: 1,
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
                          <Link
                            level="body1"
                            variant="plain"
                            alt={rowData.name}
                            color="neutral"
                            href={rowData.url}
                            target="_blank"
                            // sx={{
                            //   fontWeight: "bold",
                            //   fontSize: "16px",
                            //   textOverflow: "ellipsis",
                            // }}
                          >
                            {rowData.name} <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
                          </Link>
                        </Typography>

                        <Typography level="body3">
                          <CopyLink
                            copyText={rowData.baseurl}
                            linkProps={{
                              variant: "plain",
                              color: "neutral",
                            }}
                          />
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />

              <Column
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
              />

              <Column
                label="Subscribers"
                dataKey="subscribers"
                width={width}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
                cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.subscribers} />}
              />

              <Column
                label="Posts"
                dataKey="posts"
                width={width}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
                cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.posts} />}
              />

              <Column
                label="Comments"
                dataKey="comments"
                width={width}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
                cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.comments} />}
              />
            </VirtualTable>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
});
