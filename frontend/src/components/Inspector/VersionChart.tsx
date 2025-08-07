import React, { useMemo } from "react";

import useQueryCache from "../../hooks/useQueryCache";
import moment from "moment";

import { useWindowSize } from "@react-hook/window-size";

import Box from "@mui/joy/Box";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = (props) => {
  const { active, payload, label } = props;

  console.info("SITEETEte", props, moment(Number(label)));
  if (active && payload && payload.length) {
    return (
      <Box
        style={{
          backgroundColor: "background",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <p>{moment(Number(label)).format("DD-MM-YYYY HH:mm")}</p>
        {payload.map((i) => (
          <p className="label">
            {i.name}: {i.value}
          </p>
        ))}
      </Box>
    );
  }

  return null;
};

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

  const datasetSeries = useMemo(() => {
    if (!metricsData) return [];

    const versionKeys = metricsData.versionKeys;

    return versionKeys;
  }, [metricsData]);

  // console.log(dataset);
  console.log("datasetSeries", datasetSeries, dataset);

  if (isLoading) return "Loading...";
  if (isError || !isSuccess) return "An error has occurred: " + error.message;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={600}>
        <AreaChart
          width={windowWidth - 100}
          height={400}
          data={dataset}
          //  stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            domain={["dataMin", "dataMax"]}
            name="Time"
            tickFormatter={(unixTime) => moment(unixTime).format("DD-MM-YYYY")}
            type="number"
            padding={{ left: 30, right: 30 }}
          />

          <YAxis />

          <Tooltip
            cursor={{ stroke: "#999", strokeWidth: 2, strokeDasharray: "7,5" }}
            content={CustomTooltip}
          />

          {datasetSeries.map((version, index) => {
            return (
              <Area
                // type="monotone"
                dataKey={version}
                stackId="1"
                // stroke="#8884d8"
                // fill="#8884d8"
                key={version}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
