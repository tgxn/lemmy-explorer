// import React, { PureComponent } from "react";
// import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// import { Treemap } from "recharts";

// type ICustomTooltipProps = {
//   active: boolean;
//   payload: any;
//   label?: any;
// };

// const CustomTooltip = ({ active, payload, label }: ICustomTooltipProps) => {
//   if (active && payload && payload.length) {
//     return (
//       <div
//         style={{
//           backgroundColor: "black",
//         }}
//       >
//         {/* <p className="label">ActiveMonth: {payload[0].metrics.userActiveMonthScore}</p> */}
//         <p className="label">{JSON.stringify(payload[0].payload.instance.baseurl)}</p>
//         <p className="label">
//           userActiveMonthScore {JSON.stringify(payload[0].payload.instance.metrics.userActiveMonthScore)}
//         </p>
//         <p className="label">
//           averagePerMinute {JSON.stringify(payload[0].payload.instance.metrics.averagePerMinute)}
//         </p>
//       </div>
//     );
//   }

//   return null;
// };

// const CustomTooltip1 = ({ active, payload, label }: ICustomTooltipProps) => {
//   if (active && payload && payload.length) {
//     return (
//       <div
//         style={{
//           backgroundColor: "black",
//         }}
//       >
//         <p className="label">{JSON.stringify(payload[0].payload.instance.baseurl)}</p>
//         <p className="label">
//           totalActivity {JSON.stringify(payload[0].payload.instance.metrics.totalActivity)}
//         </p>
//         <p className="label">
//           userActivityScore {JSON.stringify(payload[0].payload.instance.metrics.userActivityScore)}
//         </p>
//       </div>
//     );
//   }

//   return null;
// };

// type IScatterGridProps = {
//   instances: any[];
// };

// export function ScatterGrid({ instances }: IScatterGridProps) {
//   // x: instance users userActiveMonthScore
//   // y: instance sus score userActivityScore

//   const data = [];

//   instances.forEach((instance) => {
//     data.push({
//       x: instance.metrics.userActiveMonthScore,
//       y: instance.metrics.averagePerMinute,
//       instance: instance,
//     });
//   });

//   // const data = [
//   //     { x: 100, y: 200, z: 200 },
//   //     { x: 120, y: 100, z: 260 },
//   //     { x: 170, y: 300, z: 400 },
//   //     { x: 140, y: 250, z: 280 },
//   //     { x: 150, y: 400, z: 500 },
//   //     { x: 110, y: 280, z: 200 },
//   //   ];

//   return (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart
//         margin={{
//           top: 20,
//           right: 20,
//           bottom: 20,
//           left: 20,
//         }}
//       >
//         <CartesianGrid />
//         <XAxis type="number" dataKey="x" name="userActiveMonthScore" unit="" />
//         <YAxis type="number" dataKey="y" name="averagePerMinute" unit="" />
//         {/* <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} /> */}
//         <Scatter name="A school" data={data} fill="#8884d8" />
//       </ScatterChart>
//     </ResponsiveContainer>
//   );
// }

// export function ScatterGrid1({ instances }: IScatterGridProps) {
//   // x: instance users userActiveMonthScore
//   // y: instance sus score userActivityScore

//   const data = [];

//   instances.forEach((instance) => {
//     data.push({
//       x: instance.metrics.totalActivity,
//       y: instance.metrics.usersTotal,
//       instance: instance,
//     });
//   });

//   // const data = [
//   //     { x: 100, y: 200, z: 200 },
//   //     { x: 120, y: 100, z: 260 },
//   //     { x: 170, y: 300, z: 400 },
//   //     { x: 140, y: 250, z: 280 },
//   //     { x: 150, y: 400, z: 500 },
//   //     { x: 110, y: 280, z: 200 },
//   //   ];

//   return (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart
//         margin={{
//           top: 20,
//           right: 20,
//           bottom: 20,
//           left: 20,
//         }}
//       >
//         <CartesianGrid />
//         <XAxis type="number" dataKey="x" name="totalActivity" unit="" />
//         <YAxis type="number" dataKey="y" name="totalUsers" unit="" />
//         {/* <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip1 />} /> */}
//         <Scatter name="A school" data={data} fill="#8884d8" />
//       </ScatterChart>
//     </ResponsiveContainer>
//   );
// }
