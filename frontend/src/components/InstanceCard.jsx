/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import Avatar from "@mui/joy/Avatar";

import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import CardHeader from "@mui/material/CardHeader";
import CardCover from "@mui/joy/CardCover";

function InstanceCard({ instance }) {
  return (
    <Card variant="outlined">
      <CardHeader
        sx={{ p: 0 }}
        avatar={<Avatar alt={instance.name} src={instance.icon} />}
        title={instance.name}
      />

      <CardOverflow>
        <AspectRatio
          sx={{
            borderRadius: 0,
          }}
          minHeight="120px"
          maxHeight="200px"
        >
          <img src={instance.banner} srcSet={instance.banner} loading="lazy" alt="" />
        </AspectRatio>
      </CardOverflow>
      <CardContent orientation="horizontal">
        <div>
          <Typography level="body3">{instance.desc}</Typography>
          {/* <Typography fontSize="lg" fontWeight="lg">
            $2,900
          </Typography> */}
        </div>
        <Button
          variant="solid"
          size="sm"
          color="primary"
          aria-label="Explore Bahamas Islands"
          sx={{ ml: "auto", fontWeight: 600 }}
          onClick={() => {
            window.open(instance.url, "_blank");
          }}
        >
          Visit
        </Button>
      </CardContent>
      <CardOverflow variant="soft" sx={{ bgcolor: "background.level1" }}>
        <Divider inset="context" />
        <CardContent orientation="horizontal">
          <Typography level="body3" fontWeight="md" textColor="text.secondary">
            6.3k views
          </Typography>
          <Divider orientation="vertical" />
          <Typography level="body3" fontWeight="md" textColor="text.secondary">
            {instance.date}
          </Typography>
        </CardContent>
      </CardOverflow>
    </Card>
  );
}

export default InstanceCard;
