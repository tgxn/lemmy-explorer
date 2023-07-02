import React from "react";
import { connect } from "react-redux";

import useCachedMultipart from "../../hooks/useCachedMultipart";
import Box from "@mui/joy/Box";

import { LinearValueLoader, PageError, SimpleNumberFormat } from "../Shared/Display";

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
