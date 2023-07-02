import React from "react";

import useCachedMultipart from "../../hooks/useCachedMultipart";
import useQueryCache from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";

import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";

import { SimpleNumberFormat } from "../Shared/Display";

export function NumberStat({ title, value, color = "primary", description = "", sx = {} }) {
  return (
    <Card
      size="lg"
      variant="plain"
      orientation="horizontal"
      sx={{
        textAlign: "center",
        borderRadius: "8px",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <CardOverflow
        variant="solid"
        color={color}
        sx={{
          ...sx,
          flex: "1",
          borderRadius: "8px",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          px: "var(--Card-padding)",
        }}
      >
        <Typography textColor="primary.100">{title}</Typography>
        <Typography fontSize="xl5" fontWeight="xl" textColor="#fff">
          <SimpleNumberFormat value={value} />
        </Typography>
        {description && <Typography textColor="primary.200">{description}</Typography>}
      </CardOverflow>
    </Card>
  );
}
