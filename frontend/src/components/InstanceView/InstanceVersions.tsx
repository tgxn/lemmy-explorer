import React from "react";

import Moment from "react-moment";

import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";

import InfoIcon from "@mui/icons-material/Info";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

export default function InstanceVersions({ instance, versionSeries }) {
  versionSeries = versionSeries.sort((a, b) => {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  return (
    <Box>
      <Alert
        sx={{ alignItems: "flex-start" }}
        startDecorator={<InfoIcon sx={{ mt: "2px", mx: "4px" }} />}
        variant="soft"
        color={"primary"}
      >
        <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
          Current Version: {instance.version}
        </Typography>
      </Alert>

      <List
        sx={{
          p: 2,
        }}
      >
        {versionSeries.map((version) => (
          <ListItem>
            <ListItemDecorator>
              <TipsAndUpdatesIcon />
            </ListItemDecorator>
            <ListItemContent>
              <Typography>
                <Moment
                  // Monday, July 25, 2103, 25:22
                  format="MMMM Do, YYYY - HH:mm"
                >
                  {version.time}
                </Moment>
              </Typography>
              <Typography level="body2" noWrap>
                Version Detected: {version.value}
              </Typography>
            </ListItemContent>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
