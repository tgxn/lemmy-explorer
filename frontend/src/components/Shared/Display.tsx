import React from "react";

import { useImage } from "react-image";
import { NumericFormat } from "react-number-format";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import LinearProgress from "@mui/joy/LinearProgress";
import CircularProgress from "@mui/joy/CircularProgress";

type IContentSkeletonProps = {
  radius?: string;
};

export function ContentSkeleton({ radius = "4px" }: IContentSkeletonProps) {
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
}

type IContentErrorProps = {
  message?: string;
  bgcolor?: string;
};

export function ContentError({ message, bgcolor = "#ff55551c" }: IContentErrorProps) {
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
}

export function PageLoading() {
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
        value={100}
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
          Rendering Page...
        </Typography>
      </LinearProgress>
    </Box>
  );
}

type IPageErrorProps = {
  error?: string;
};

export function PageError({ error }: IPageErrorProps) {
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
      {error && (
        <pre>
          <br />
          <br />
          {error}
        </pre>
      )}
    </Box>
  );
}

type ISimpleNumberFormatProps = {
  value: number;
  displayType?: "input" | "text" | undefined;
};

export function SimpleNumberFormat({ value, displayType = "text" }: ISimpleNumberFormatProps) {
  return <NumericFormat displayType={displayType} value={value} allowLeadingZeros thousandSeparator="," />;
}

type ITinyNumberProps = {
  value: number;
};

export function TinyNumber({ value }: ITinyNumberProps) {
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

type IBannerImageProps = {
  imageSrc: string;
};

export function BannerImage({ imageSrc }: IBannerImageProps) {
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
            alt={"Banner Image"}
            style={{
              objectFit: "contain",
              objectPosition: "center center",
            }}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

type ILinerValueLoaderProps = {
  message?: string;
  progress?: number;
};

export function LinearValueLoader({ message = "Loading...", progress = 0 }: ILinerValueLoaderProps) {
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
