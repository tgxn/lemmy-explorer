import React from "react";
import { useColorScheme } from "@mui/joy/styles";

import Badge from "@mui/joy/Badge";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import moment from "moment";

// import { ResponsiveContainer, Line, LineChart, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import LineGraph from "../Shared/LineGraph";

// const CustomTooltip = ({ active, payload, label }) => {
//   console.info(payload);
//   if (active && payload && payload.length) {
//     return (
//       <Box>
//         {payload.map((i) => (
//           <p className="label">{`${i.name} : ${i.value}`}</p>
//         ))}
//       </Box>
//     );
//   }

//   return null;
// };

export default function InstanceUserGrowth({ metricsData }) {
  console.log("userSeries", metricsData);

  return <LineGraph dataSeries={metricsData.users} />;
}
