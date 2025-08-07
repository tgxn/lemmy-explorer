import React from "react";

import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Tooltip from "@mui/joy/Tooltip";

import PersonIcon from "@mui/icons-material/Person";

import { TinyNumber } from "../Shared/Display";

export default function CardStatBox({ name, icon = <PersonIcon />, value }) {
  return (
    <Tooltip title={name} variant="soft">
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 1,
        }}
      >
        <Typography
          level="body3"
          fontWeight="md"
          textColor="text.secondary"
          sx={{
            cursor: "default",
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: 0.5,
          }}
        >
          {icon}
        </Typography>
        <Typography
          level="body3"
          fontWeight="md"
          textColor="text.secondary"
          sx={{
            cursor: "default",
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: 0.5,
          }}
        >
          <TinyNumber value={value} />
        </Typography>
      </Box>
    </Tooltip>
  );
}
