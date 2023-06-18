import React from "react";

// import withStyles from "@material-ui/core/styles/withStyles";
// import TableCell from "@material-ui/core/TableCell";
// import TableSortLabel from "@material-ui/core/TableSortLabel";

import { AutoSizer, Column, SortDirection, Table as VirtualTable, WindowScroller } from "react-virtualized";

import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Link from "@mui/joy/Link";
import Tooltip from "@mui/joy/Tooltip";

import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import RestoreIcon from "@mui/icons-material/Restore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { TinyNumber } from "./Display";

// import "react-virtualized/styles.css"; // only needs to be imported once

export const CommunityList = React.memo(function CommunityList({ items, homeBaseUrl }) {
  return (
    <WindowScroller>
      {({ height, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <VirtualTable
              autoHeight
              headerHeight={40}
              height={height}
              width={width}
              scrollTop={scrollTop}
              rowHeight={50}
              className={["MuiTable-root"]}
              rowStyle={{
                display: "flex",
                //  alignItems: "left"
              }}
              rowCount={items.length}
              rowGetter={({ index }) => items[index]}
            >
              <Column
                label="Title"
                dataKey="title"
                width={width}
                // headerRenderer={({ label }) => {
                //   return [
                //     <span
                //       className="ReactVirtualized__Table__headerTruncatedText"
                //       key="label"
                //       title={typeof label === "string" ? label : null}
                //     >
                //       {label}
                //     </span>,
                //   ];
                // }}
                cellRenderer={({ rowData }) => {
                  console.log(rowData);
                  return (
                    <Box sx={{ display: "inline" }}>
                      <Avatar
                        alt={rowData.title}
                        src={rowData.icon}
                        sx={{
                          display: "inline-flex",
                        }}
                      />
                      {rowData.title}
                    </Box>
                  );
                }}
              />

              <Column
                label="Subscribers"
                width={width}
                cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.subscribers} />}
              />

              <Column
                label="Posts"
                width={width}
                cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.posts} />}
              />

              <Column
                label="Comments"
                width={width}
                cellRenderer={({ rowData }) => <TinyNumber value={rowData.counts.comments} />}
              />
            </VirtualTable>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
});
