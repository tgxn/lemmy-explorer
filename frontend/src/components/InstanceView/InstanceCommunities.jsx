import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import Moment from "react-moment";

import useCachedMultipart from "../../hooks/useCachedMultipart";
import Alert from "@mui/joy/Alert";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";

import InfoIcon from "@mui/icons-material/Info";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

import { LinearValueLoader, PageError, SimpleNumberFormat } from "../Shared/Display";
import TriStateCheckbox from "../Shared/TriStateCheckbox";

import CommunityList from "../ListView/Community";

function InstanceCommunities({ instance, homeBaseUrl }) {
  const { isLoading, loadingPercent, isSuccess, isError, error, data } = useCachedMultipart(
    "communityData",
    "community",
  );

  const items = React.useMemo(() => {
    if (!isSuccess) return [];
    if (!data) return [];

    return data.filter((community) => community.baseurl === instance.baseurl);

    // .map((community) => ({
    //   ...community,
    // }));
  }, [data]);

  console.log("items", items);

  return (
    <Box>
      {isLoading && !isError && <LinearValueLoader progress={loadingPercent} />}
      {isError && <PageError error={error} />}
      {isSuccess && <CommunityList items={items} homeBaseUrl={homeBaseUrl} />}
    </Box>
  );
}

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(InstanceCommunities);
