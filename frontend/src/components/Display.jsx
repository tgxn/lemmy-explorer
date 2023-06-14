import React, { useState, useRef } from "react";
import { connect } from "react-redux";

// import lighten from "@material-ui/core/lighten";

import ImageUploading from "react-images-uploading";
import Carousel from "react-material-ui-carousel";

import { useTheme } from "@mui/material/styles";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/joy/CircularProgress";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import WhatshotIcon from "@mui/icons-material/Whatshot";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

import { NumericFormat } from "react-number-format";

import Box from "@mui/material/Box";
// import Skeleton from "@mui/material/Skeleton";

import ErrorIcon from "@mui/icons-material/Error";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

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
