import React from "react";

import { AutoSizer, Table, WindowScroller } from "react-virtualized";

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

  const a11yProps: any = { "aria-rowindex": index + 1 };

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

type IVirtualTableProps = {
  items: any[];
  children: (props: { width: number }) => React.ReactNode;
};

const VirtualTable = React.memo(function ({ items, children }: IVirtualTableProps) {
  return (
    <WindowScroller>
      {({ height, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
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
              {children({ width })}
            </Table>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
});
export default VirtualTable;
