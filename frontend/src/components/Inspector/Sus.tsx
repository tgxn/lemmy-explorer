import React from "react";

import useCachedMultipart from "../../hooks/useCachedMultipart";
import useQueryCache from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import SusTable from "./SusTable";
// import { ScatterGrid, ScatterGrid1 } from "./ScatterGrid";

export default function InspectorOverview() {
  const {
    isLoading: isLoadingSus,
    isSuccess: isSuccessSus,
    isError: isErrorSus,
    error: errorSus,
    data: dataSus,
  } = useQueryCache("susData", "sus");

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
    });

    // sus data
    dataSus.forEach((instance) => {
      totalBadUsers += instance.users;
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography color="danger">
          This page lists instances that could be dangerous, it is provided for visibilty.
        </Typography>
      </Box>

      {isSuccessSus && (
        <SusTable
          susRows={dataSus}
          renderRow={(row, index) => {
            return (
              <tr tabIndex={-1} key={row.name}>
                <th scope="row">{row.name}</th>
                <th scope="row">{row.base}</th>
                <th scope="row">
                  {row.users} ({row.metrics.usersMonth} month)
                </th>
                <th scope="row">{row.metrics.totalActivity}</th>
                <td scope="row">{row.actor_id}</td>
                <td scope="row">
                  {row.reasons.map((item) => {
                    return <div>{item}</div>;
                  })}
                </td>
              </tr>
            );
          }}
          headCells={[
            {
              id: "name",
              numeric: false,
              disablePadding: false,
              label: "Name",
            },
            {
              id: "baseurl",
              numeric: false,
              disablePadding: false,
              label: "Base URL",
            },
            {
              id: "users",
              numeric: true,
              disablePadding: false,
              label: "Users",
            },

            {
              id: "totalActivity",
              numeric: true,
              disablePadding: false,
              label: "Total Activity",
            },
            {
              id: "actor_id",
              numeric: false,
              disablePadding: false,
              label: "Actor ID",
            },
            {
              id: "reasons",
              numeric: false,
              disablePadding: false,
              label: "Reasons",
            },
          ]}
        />
      )}

      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography color="info">
          Instance users growth per minute average vs. User monthly active score
        </Typography>
      </Box>

      {isSuccessIns && <ScatterGrid instances={dataIns} />}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography color="info">
          Instance users growth per minute average vs. User monthly active score
        </Typography>
      </Box>

      {isSuccessIns && <ScatterGrid1 instances={dataIns} />} */}
    </Box>
  );
}
