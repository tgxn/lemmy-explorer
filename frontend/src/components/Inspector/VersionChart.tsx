import React, { useMemo, PureComponent } from "react";

// import useCachedMultipart from "../../hooks/useCachedMultipart";
import useQueryCache from "../../hooks/useQueryCache";
import moment from "moment";

import { useWindowSize } from "@react-hook/window-size";

import Box from "@mui/joy/Box";

// import { LineChart } from "@mui/x-charts/LineChart";
// import { ResponsiveStream } from "@nivo/stream";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function VersionChart() {
  const {
    isLoading,
    isSuccess,
    isError,
    error,
    data: metricsData,
  } = useQueryCache("metrics.series", "metrics.series");

  const [windowWidth, windowHeight] = useWindowSize();

  const dataset = useMemo(() => {
    if (!metricsData) return [];

    const versionsAgg = metricsData.versions;

    return versionsAgg;
  }, [metricsData]);

  console.log("dataset", dataset);

  const datasetSeries = useMemo(() => {
    if (!metricsData) return [];

    // const uniqueVersions = Object.keys(metricsData.versions);
    console.log("metricsData", metricsData);

    const acc = [];

    // map each row and get the keys
    Object.values(metricsData.versions).forEach((key: any) => {
      // console.log("1234123412341234", key);

      Object.keys(key).forEach((key) => {
        if (key !== "time" && acc.indexOf(key) === -1) {
          acc.push(key);
        }
      });

      // if (key !== "time" && acc.indexOf(key) === -1) {
      //   acc.push(key);
      // }
    });

    //   console.log(acc);

    //   // // map each row and get the keys
    //   // const acc1 = Object.keys(row).forEach((key) => {
    //   //   if (key !== "time") {
    //   //     acc.push(key);
    //   //   }
    //   // });

    return acc;

    //   // return acc.map((version) => {
    //   //   console.log("version", version);
    //   //   return {
    //   //     id: version,
    //   //     label: version,
    //   //     dataKey: version,
    //   //     stack: "total",
    //   //     area: true,
    //   //     showMark: false,
    //   //   };
    //   // });
  }, [metricsData]);

  // console.log(dataset);
  // console.log("datasetSeries", datasetSeries);

  if (isLoading) return "Loading...";
  if (isError || !isSuccess) return "An error has occurred: " + error.message;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={600}>
        <AreaChart
          width={windowWidth - 100}
          height={400}
          data={dataset}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            // reversed={true}
            domain={["auto", "auto"]}
            name="Time"
            tickFormatter={(unixTime) => moment(unixTime).format("HH:mm Do")}
            type="number"
          />
          <YAxis />
          <Tooltip />
          {datasetSeries.map((version) => {
            return (
              <Area
                type="monotone"
                dataKey={version}
                stackId="1"
                // stroke="#8884d8"
                // fill="#8884d8"
                key={version}
              />
            );
          })}
          {/* <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" /> */}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
