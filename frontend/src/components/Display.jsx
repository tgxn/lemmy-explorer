import React from "react";

import CircularProgress from "@mui/joy/CircularProgress";

import { NumericFormat } from "react-number-format";

import Box from "@mui/material/Box";

export function ContentSkeleton({ radius = "4px" }) {
  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.body2,
        color: theme.palette.text.secondary,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        minHeight: "120px",
        maxHeight: "200px",
        textAlign: "center",
      })}
    >
      <CircularProgress
        variant={"soft"}
        color="neutral"
        sx={{
          marginBottom: "5px",
        }}
      />
    </Box>
  );
}

export function ContentError({ message = false, bgcolor = "#ff55551c" }) {
  return (
    <Box
      component="div"
      sx={(theme) => ({
        ...theme.typography.body2,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        background: bgcolor,
        // color: "white",

        // flexGrow: 1,
        minHeight: "120px",
        maxHeight: "200px",
        textAlign: "center",
      })}
    >
      {message ? (
        message
      ) : (
        <>
          😭
          <br /> Content Error
        </>
      )}
    </Box>
  );
}

export function PageLoading() {
  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.body2,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      })}
    >
      <CircularProgress
        variant={"soft"}
        color="neutral"
        size="lg"
        sx={{
          marginBottom: "5px",
        }}
      />
    </Box>
  );
}

export function PageError() {
  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.body2,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: "1.5rem",
        p: 2,
      })}
    >
      We had an error trying to load this data. 😭
      <br /> You could try reloading the page!
    </Box>
  );
}

export function SimpleNumberFormat({ value }) {
  return <NumericFormat displayType="text" value={value} allowLeadingZeros thousandSeparator="," />;
}
