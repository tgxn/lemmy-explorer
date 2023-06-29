import React from "react";

import Moment from "react-moment";

import { AutoSizer, Column, Table as VirtualTable, WindowScroller } from "react-virtualized";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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

import { TinyNumber } from "../Shared/Display";
import CopyLink from "../Shared/CopyLink";

// based on https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultRowRenderer.js
const RenderRow = ({
  className,
  columns,
  index,
  key,
  onRowClick,
  onRowDoubleClick,
  onRowMouseOut,
  onRowMouseOver,
  onRowRightClick,
  rowData,
  style,
}) => {
  const odd = !(index % 2);

  const a11yProps = { "aria-rowindex": index + 1 };

  if (onRowClick || onRowDoubleClick || onRowMouseOut || onRowMouseOver || onRowRightClick) {
    a11yProps["aria-label"] = "row";
    a11yProps.tabIndex = 0;

    if (onRowClick) {
      a11yProps.onClick = (event) => onRowClick({ event, index, rowData });
    }
    if (onRowDoubleClick) {
      a11yProps.onDoubleClick = (event) => onRowDoubleClick({ event, index, rowData });
    }
    if (onRowMouseOut) {
      a11yProps.onMouseOut = (event) => onRowMouseOut({ event, index, rowData });
    }
    if (onRowMouseOver) {
      a11yProps.onMouseOver = (event) => onRowMouseOver({ event, index, rowData });
    }
    if (onRowRightClick) {
      a11yProps.onContextMenu = (event) => onRowRightClick({ event, index, rowData });
    }
  }

  let bgContainerStyles = {
    backgroundImage: rowData.banner ? `url(${rowData.banner})` : null,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "var(--joy-palette-primary-50)",
  };

  let bgStyles = {
    backgroundColor: odd ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.55)",
    color: "var(--joy-palette-primary-50)",
  };

  if (rowData.banner) {
    bgStyles.backgroundColor = "rgba(0, 0, 0, 0.75)";
  }

  return (
    <div
      {...a11yProps}
      key={key}
      role="row"
      className={className}
      style={{
        ...style, // original style

        display: "block",
        height: "70px",
        overflow: "hidden",
        marginBottom: "4px",
        borderRadius: "8px",

        ...bgContainerStyles,
      }}
    >
      <div
        style={{
          display: "flex",
          overflow: "hidden",
          justifyContent: "space-between",
          alignItems: "center",
          height: "70px",

          ...bgStyles,
        }}
      >
        {columns}
      </div>
    </div>
  );
};

const RenderHeaderRow = ({ className, columns, style }) => {
  return (
    <div
      className={className}
      role="row"
      style={{
        ...style,
        fontWeight: "bold",

        color: "var(--joy-palette-primary-50)",
        fontSize: "16px",
        height: "40px",
        margin: 0,
        marginBottom: "4px",
      }}
    >
      {columns}
    </div>
  );
};

const CommunityList = React.memo(function ({ items, homeBaseUrl }) {
  const theme = useTheme();
  const smallDisplay = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <WindowScroller>
      {({ height, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <VirtualTable
              autoHeight
              headerHeight={44}
              headerStyle={{
                display: "flex",
                justifyContent: "center",
                alignItems: "top",
                padding: "10px",
                backgroundColor: "rgba(0, 0, 0, .45)",
              }}
              headerRowRenderer={RenderHeaderRow}
              height={height}
              width={width}
              scrollTop={scrollTop}
              overscanRowCount={10}
              rowCount={items.length}
              rowGetter={({ index }) => items[index]}
              rowHeight={74}
              rowStyle={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "8px",
              }}
              rowRenderer={RenderRow}
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
                          <Tooltip
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
                          </Tooltip>
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

              {!smallDisplay && (
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
              )}

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
export default CommunityList;
