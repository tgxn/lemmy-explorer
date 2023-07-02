import React from "react";

import { useImage } from "react-image";
import { NumericFormat } from "react-number-format";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import LinearProgress from "@mui/joy/LinearProgress";
import CircularProgress from "@mui/joy/CircularProgress";

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
          <img
            src={src}
            loading="lazy"
            width={"100%"}
            height={"100%"}
            alt={"Banner"}
            //scaling
            style={{
              // consdytr
              objectFit: "contain",
              objectPosition: "center center",
              // aligh
            }}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
});

export function LinearValueLoader({ message = "Loading...", progress = 0 }) {
  return (
    <Box
      sx={{
        p: 0,
        mt: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LinearProgress
        determinate
        variant="outlined"
        color="neutral"
        thickness={32}
        value={progress}
        sx={{
          maxWidth: "80%",
          "--LinearProgress-radius": "8px",
          "--LinearProgress-progressThickness": "24px",
          boxShadow: "sm",
          borderColor: "grey.500",
        }}
      >
        <Typography
          level="body3"
          fontWeight="xl"
          textColor="common.white"
          sx={{ mixBlendMode: "difference" }}
        >
          {message} {`${Math.round(progress)}%`}
        </Typography>
      </LinearProgress>
    </Box>
  );
}
