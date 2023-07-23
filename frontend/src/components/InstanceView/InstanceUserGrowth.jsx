import React from "react";

import moment from "moment";

import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

export default function InstanceUserGrowth({ userSeries }) {
  const minUsers = Number(userSeries[0].value);
  const maxUsers = Number(userSeries[userSeries.length - 1].value);

  // round to closest 1000
  const minUsersRounded = Math.floor(minUsers / 1000) * 1000;
  const maxUsersRounded = Math.ceil(maxUsers / 1000) * 1000;

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ScatterChart
      // margin={{
      //   top: 5,
      //   right: 30,
      //   left: 20,
      //   bottom: 5,
      // }}
      >
        <XAxis
          dataKey="time"
          domain={["auto", "dataMax"]}
          name="Time"
          tickFormatter={(unixTime) => moment(unixTime).format("HH:mm DD-MM-YYYY")}
          type="number"
        />

        <Tooltip />
        <YAxis dataKey="value" name="Value" type="number" domain={[minUsersRounded, maxUsersRounded]} />

        <Scatter
          data={userSeries}
          lineType="joint"
          line={{ stroke: "#eee" }}
          // lineJointType="monotoneX"
          name="Values"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
