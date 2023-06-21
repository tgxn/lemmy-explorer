import React from "react";

import { useImage } from "react-image";

import CircularProgress from "@mui/joy/CircularProgress";

import { NumericFormat } from "react-number-format";

import Box from "@mui/joy/Box";

export const ContentSkeleton = React.memo(function ({ radius = "4px" }) {
  return (
    <Box
      sx={(theme) => ({
        ...theme.typography.body2,
        color: theme.palette.text.secondary,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        height: "100%",
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
});

export const ContentError = React.memo(function ({ message = false, bgcolor = "#ff55551c" }) {
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

        height: "100%",
        textAlign: "center",
      })}
    >
      <>
        😭
        <br /> {message ? message : "Content Error"}
      </>
    </Box>
  );
});

export const PageLoading = React.memo(function () {
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
});

export const PageError = React.memo(function () {
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
});

export const SimpleNumberFormat = React.memo(function SimpleNumberFormat({ value }) {
  return <NumericFormat displayType="text" value={value} allowLeadingZeros thousandSeparator="," />;
});

export function TinyNumber({ value }) {
  const number = React.useMemo(() => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return value;
  }, [value]);

  return <React.Fragment>{number}</React.Fragment>;
}

export const BannerImage = React.memo(function BannerImage({ imageSrc }) {
  const { src, isLoading, error } = useImage({
    srcList: imageSrc,
    useSuspense: false,
  });

  return (
    <React.Fragment>
      {!imageSrc && <ContentError message={"No Banner"} bgcolor={"#ff55fc21"} />}
      {imageSrc && (
        <React.Fragment>
          {isLoading && <ContentSkeleton />}
          {error && <ContentError />}
          <img src={src} loading="lazy" width={"100%"} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
});
