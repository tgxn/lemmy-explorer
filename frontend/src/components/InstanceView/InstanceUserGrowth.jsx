import React from "react";
import { connect } from "react-redux";

import Moment from "react-moment";
import moment from "moment";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Avatar from "@mui/joy/Avatar";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/joy/Box";

import Link from "@mui/joy/Link";
import IconButton from "@mui/joy/IconButton";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import HomeIcon from "@mui/icons-material/Home";

import { TinyNumber, BannerImage } from "../Shared/Display";
import CopyLink from "../Shared/CopyLink";

import { setHomeInstance } from "../../reducers/configReducer";

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
