import React from "react";

import MultiDataLineGraph from "../Shared/MultiDataLineGraph";

function InstanceUserGrowth({ metricsData }) {
  // console.log("userSeries", metricsData);

  // round to closest 1000
  const minUsers = Math.floor(Number(metricsData.users[0].value) / 1000) * 1000;
  const maxUsers = Math.ceil(Number(metricsData.users[metricsData.users.length - 1].value) / 1000) * 1000;

  const minPosts = Math.floor(Number(metricsData.posts[0].value) / 1000) * 1000;
  const maxPosts = Math.ceil(Number(metricsData.posts[metricsData.posts.length - 1].value) / 1000) * 1000;

  // merge the arrays, with any that have the same time going into the same object

  const singleStatsArray = [];

  for (const userData of metricsData.users) {
    singleStatsArray.push({
      time: userData.time,
      users: userData.value,
    });
  }
  for (const postData of metricsData.posts) {
    const time = postData.time;
    const posts = postData.value;

    const existing = singleStatsArray.find((i) => i.time === time);
    if (existing) {
      existing.posts = posts;
    } else {
      singleStatsArray.push({
        time,
        posts,
      });
    }
  }

  // order by time
  singleStatsArray.sort((a, b) => a.time - b.time);

  // console.log("singleStatsArray", singleStatsArray);

  return (
    <MultiDataLineGraph
      dataSeries={singleStatsArray}
      dataSeriesInfo={[
        {
          yAxisName: "Users",
          yAxisKey: "users",
          yAxisColor: "#8884d8",

          minValue: minUsers,
          maxValue: maxUsers,
        },
        {
          yAxisName: "Posts",
          yAxisKey: "posts",
          yAxisColor: "#82ca9d",

          minValue: minPosts,
          maxValue: maxPosts,
        },
      ]}
    />
  );
}

export default React.memo(InstanceUserGrowth, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.metricsData) === JSON.stringify(nextProps.metricsData);
});
