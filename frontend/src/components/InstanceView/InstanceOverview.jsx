import React from "react";

import moment from "moment";
import Moment from "react-moment";

import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InfoIcon from "@mui/icons-material/Info";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import { SimpleNumberFormat, BannerImage } from "../Shared/Display";
import { StringStat, NumberStat } from "../Shared/StatGridCards";

export default function InstanceOverview({ instance, userSeries }) {
  const userWeekChange = React.useMemo(() => {
    const sortedUsers = userSeries.sort((a, b) => a.time - b.time);

    const latestValue = sortedUsers[sortedUsers.length - 1].value;

    const tsWeekAgo = moment().subtract(7, "days").unix();

    let users = sortedUsers.filter((u) => u.time >= tsWeekAgo);

    const maxOneWeekValue = users[0];

    return latestValue - maxOneWeekValue.value;
  }, [userSeries]);

  // generate uptime card
  let uptimeCard = <StringStat color="danger" icon={<ThumbDownIcon />} title="Uptime" value={"Not Found"} />;
  if (instance.uptime?.uptime_alltime) {
    uptimeCard = (
      <StringStat
        color="success"
        icon={<TrendingUpIcon />}
        title="Uptime"
        value={instance.uptime?.uptime_alltime + "%"}
        description={
          <>
            First seen <Moment fromNow>{instance.uptime?.date_created}</Moment>
          </>
        }
      />
    );
  }

  return (
    <Box>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ width: "100%" }}>
        <Grid xs={12} md={6}>
          <NumberStat
            color="primary"
            icon={<PersonIcon />}
            title="Users"
            value={instance.usage.users.total}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <NumberStat
            color="success"
            icon={<PersonAddAltIcon />}
            title="User Growth Week"
            value={userWeekChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <NumberStat
            color="primary"
            icon={<MessageIcon />}
            title="Posts"
            value={instance.usage.localPosts}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <NumberStat
            color="primary"
            icon={<ForumIcon />}
            title="Comments"
            value={instance.usage.localComments}
          />
        </Grid>

        <Grid xs={12} md={6}>
          {uptimeCard}
        </Grid>

        <Grid xs={12} md={6}>
          <StringStat
            icon={
              <SystemUpdateAltIcon
                sx={{
                  //rotate 180 degrees
                  transform: "rotate(180deg)",
                }}
              />
            }
            color="info"
            title="Current Version"
            value={instance.version}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
