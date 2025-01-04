import React from "react";

import useCachedMultipart from "../../hooks/useCachedMultipart";
import useQueryCache from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import CardContent from "@mui/joy/CardContent";

import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";

import { SimpleNumberFormat } from "../Shared/Display";

export function StringStat({ title, value, icon = false, color = "primary", description = "", sx = {} }) {
  let iconClone = null;

  if (icon)
    iconClone = React.cloneElement(icon, {
      sx: {
        ...icon.props.sx,
        fontSize: "xl5",
        color: "#fff",
        p: 0,

        // mb: "var(--Card-padding)",
        // display: "inline",
      },
    });

  return (
    <Card
      size="lg"
      variant="solid"
      color={color}
      orientation="horizontal"
      sx={{
        ...sx,
        borderRadius: "8px",
        display: "flex",
        flexDirection: "row",

        // justifyContent: "center",
        alignItems: "center",

        // space aroudn
        justifyContent: "space-between",

        maxWidth: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {iconClone && (
        <CardContent
          variant="solid"
          color={color}
          sx={{
            ...sx,
            // flex: "1",
            display: "flex",
            m: 0,
            p: 0,
            pl: 2,
            flexGrow: 0,
            // justifyContent: "center",
            // alignItems: "center",
            flexDirection: "row",
            height: "100%",
            // justifyContent: "center",
            // alignItems: "center",
            // px: "var(--Card-padding)",
          }}
        >
          {iconClone}
        </CardContent>
      )}
      <CardContent
        variant="solid"
        color={color}
        sx={{
          ...sx,
          // flex: "1",
          borderRadius: "8px",
          display: "flex",
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          // width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          px: 1,
        }}
      >
        <Typography textColor="primary.100">{title}</Typography>
        <Typography fontSize="xl5" fontWeight="xl" textColor="#fff">
          {value}
        </Typography>
        {description && <Typography textColor="primary.200">{description}</Typography>}
      </CardContent>
    </Card>
  );
}

export function NumberStat({ value, ...props }) {
  return <StringStat {...props} value={<SimpleNumberFormat value={value} />} />;
}
