import React from "react";
import { useColorScheme } from "@mui/joy/styles";

import Box from "@mui/joy/Box";

import moment from "moment";
import { SimpleNumberFormat } from "../Shared/Display";

import { CartesianGrid, ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  console.info(payload);
  if (active && payload && payload.length) {
    return (
      <Box>
        {payload.map((i) => (
          <p className="label">
            {i.name}: <SimpleNumberFormat value={i.value} />{" "}
          </p>
        ))}
      </Box>
    );
  }

  return null;
};

export default function LineGraph({ dataSeries }) {
  const { mode } = useColorScheme();

  const minUsers = Number(dataSeries[0].value);
  const maxUsers = Number(dataSeries[dataSeries.length - 1].value);

  // round to closest 1000
  const minUsersRounded = Math.floor(minUsers / 1000) * 1000;
  const maxUsersRounded = Math.ceil(maxUsers / 1000) * 1000;

  console.log("userSeries", dataSeries);

  const scale = "linear"; //scaleLog().base(Math.E);

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={dataSeries}>
        <CartesianGrid strokeDasharray="3 3" />

        {/* Time Axis */}
        <XAxis
          dataKey="time"
          domain={["dataMin", "dataMax"]}
          name="Time"
          tickFormatter={(unixTime) => moment(unixTime).format("DD-MM-YYYY")}
          type="number"
          padding={{ left: 30, right: 30 }}
        />

        <Tooltip
          cursor={{ stroke: "#999", strokeWidth: 2, strokeDasharray: "7,5" }}
          content={CustomTooltip}
        />

        {/* Count Axis */}
        <YAxis
          dataKey="value"
          type="number"
          domain={[minUsersRounded, maxUsersRounded]}
          scale={scale}
          tickFormatter={(unixTime) => unixTime.toLocaleString()}
        />

        <Line
          dataKey="value"
          dot={false}
          stroke={mode === "dark" ? "#8884d8" : "#82ca9d"}
          strokeDasharray="3 3"
          name="Users"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
