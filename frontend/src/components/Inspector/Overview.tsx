import React from "react";

import useCachedMultipart from "../../hooks/useCachedMultipart";
import useQueryCache, { IQueryCache } from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";

import { NumberStat } from "../Shared/StatGridCards";

export default function InspectorOverview() {
  const {
    isLoading: isLoadingSus,
    isSuccess: isSuccessSus,
    isError: isErrorSus,
    error: errorSus,
    data: dataSus,
  }: IQueryCache = useQueryCache("susData", "sus");

  const {
    isLoading: isLoadingIns,
    isSuccess: isSuccessIns,
    loadingPercent: loadingPercentIns,
    isError: isErrorIns,
    error: errorIns,
    data: dataIns,
  } = useCachedMultipart("instanceData", "instance");

  const [totalUsers, totalBadUsers] = React.useMemo(() => {
    if (!dataSus || !dataIns) return [0, 0, 0];

    let totalUsers = 0;
    let totalBadUsers = 0;

    // instance data
    dataIns.forEach((instance) => {
      totalUsers += instance.counts.users;

      const susInstance = dataSus.find((susInstance) => susInstance.base === instance.baseurl);
      if (susInstance) totalBadUsers += susInstance.users;
    });

    return [totalUsers, totalBadUsers];
  }, [dataIns, dataSus]);

  const [totalComments, totalPosts, totalCommunities] = React.useMemo(() => {
    if (!dataSus || !dataIns) return [0, 0];

    let totalComments = 0;
    let totalPosts = 0;
    let totalCommunities = 0;

    // instance data
    dataIns.forEach((instance) => {
      totalComments += instance.counts.comments;
      totalPosts += instance.counts.posts;
      totalCommunities += instance.counts.communities;
    });

    return [totalComments, totalPosts, totalCommunities];
  }, [dataIns, dataSus]);

  if (isLoadingSus || isLoadingIns) return "Loading...";
  if (isErrorSus) return "An error has occurred: " + errorSus.message;
  if (isErrorIns) return "An error has occurred: " + errorIns.message;

  return (
    <Box>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ width: "100%" }}>
        <Grid xs={12} md={6} xl={4}>
          <NumberStat
            color="primary"
            title="Total Instances"
            value={dataIns.length}
            description="Total count of all instances scanned in the last 24 hours."
          />
        </Grid>
        <Grid xs={12} md={6} xl={4}>
          <Sheet
            sx={{
              display: "flex",
            }}
          >
            <NumberStat
              color="info"
              title="Total Users"
              value={totalUsers}
              description="A total count from all known instances."
            />
          </Sheet>
        </Grid>
        <Grid xs={12} md={6} xl={4}>
          <Sheet
            sx={{
              display: "flex",
            }}
          >
            <NumberStat
              color="primary"
              title="Total Comments"
              value={totalComments}
              description="A total comment count for all known instances."
            />
          </Sheet>
        </Grid>
        <Grid xs={12} md={6} xl={4}>
          <Sheet
            sx={{
              display: "flex",
            }}
          >
            <NumberStat
              color="info"
              title="Total Posts"
              value={totalPosts}
              description="A total post count for all known instances."
            />
          </Sheet>
        </Grid>
        <Grid xs={12} md={6} xl={4}>
          <Sheet
            sx={{
              display: "flex",
            }}
          >
            <NumberStat
              color="success"
              title="Total Communities"
              value={totalCommunities}
              description="A total count for all known instances."
            />
          </Sheet>
        </Grid>
      </Grid>
    </Box>
  );
}
