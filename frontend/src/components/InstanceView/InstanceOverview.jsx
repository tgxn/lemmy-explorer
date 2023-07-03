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

function getChangeOverTime(attributeArray, oldestTimeTs) {
  // sort oldest first
  const sortedArray = attributeArray.sort((a, b) => a.time - b.time);

  // get newest item
  const latestValue = sortedArray[sortedArray.length - 1].value;

  // filter results before cutoff
  let filteredResults = sortedArray.filter((u) => u.time >= oldestTimeTs);

  // get oldest item within cutoff
  const maxOneWeekValue = filteredResults[0];

  // return difference
  return latestValue - maxOneWeekValue.value;
}

function plusMinusIndicator(value) {
  return value > 0 ? "+" : value < 0 ? "-" : "";
}

export default function InstanceOverview({ metricsData }) {
  const { instance, users, comments, posts } = metricsData;

  const usersWeekChange = React.useMemo(() => {
    return getChangeOverTime(users, moment().subtract(1, "week").unix());
  }, [users]);

  const commentsWeekChange = React.useMemo(() => {
    return getChangeOverTime(comments, moment().subtract(1, "week").unix());
  }, [comments]);

  const postsWeekChange = React.useMemo(() => {
    return getChangeOverTime(posts, moment().subtract(1, "week").unix());
  }, [posts]);

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
            description={
              <>
                Weekly Change: {plusMinusIndicator(usersWeekChange)}
                <SimpleNumberFormat value={usersWeekChange} />
              </>
            }
          />
        </Grid>
        {/* 
        <Grid xs={12} md={6}>
          <NumberStat
            color="success"
            icon={<PersonAddAltIcon />}
            title="User Growth Week"
            value={usersWeekChange}
          />
        </Grid> */}

        <Grid xs={12} md={6}>
          <NumberStat
            color="primary"
            icon={<MessageIcon />}
            title="Posts"
            value={instance.usage.localPosts}
            description={
              <>
                Weekly Change: {plusMinusIndicator(postsWeekChange)}
                <SimpleNumberFormat value={postsWeekChange} />
              </>
            }
          />
        </Grid>

        <Grid xs={12} md={6}>
          <NumberStat
            color="primary"
            icon={<ForumIcon />}
            title="Comments"
            value={instance.usage.localComments}
            description={
              <>
                Weekly Change: {plusMinusIndicator(commentsWeekChange)}
                <SimpleNumberFormat value={commentsWeekChange} />
              </>
            }
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
