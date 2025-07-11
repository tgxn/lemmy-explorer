import React from "react";
import { useColorScheme } from "@mui/joy/styles";

import Box from "@mui/joy/Box";

import moment from "moment";
import { SimpleNumberFormat } from "./Display";

import { ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

// import { scaleLog } from "d3-scale";

// const CustomTooltip = ({ active, payload, label }) => {
//   console.info(payload);
//   if (active && payload && payload.length) {
//     return (
//       <Box>
//         {payload.map((i) => (
//           <p className="label">
//             {i.name}: <SimpleNumberFormat value={i.value} />{" "}
//           </p>
//         ))}
//       </Box>
//     );
//   }

//   return null;
// };

type IMultiDataLineGraphProps = {
  dataSeries: any[];
  dataSeriesInfo: {
    yAxisName: string;
    yAxisKey: string;
    yAxisColor: string;
    minValue?: number;
    maxValue?: number;
  }[];
};

export default function MultiDataLineGraph({ dataSeries, dataSeriesInfo }: IMultiDataLineGraphProps) {
  const { mode } = useColorScheme();

  const scale = "linear"; //scaleLog().base(Math.E);

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={dataSeries}>
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
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <Box>
                  <p>{moment(label).format("DD-MM-YYYY")}</p>
                  {payload.map((i) => (
                    <p key={i.name} style={{ color: i.stroke }}>
                      {i.name}: <SimpleNumberFormat value={Number(i.value)} />
                    </p>
                  ))}
                </Box>
              );
            }
            return null;
          }}
        />

        {/* Count Axis */}
        {dataSeriesInfo.map((dataSeries, index) => (
          <YAxis
            key={index}
            dataKey={dataSeries.yAxisKey}
            type="number"
            label={{
              value: dataSeries.yAxisName,
              angle: index % 2 === 0 ? -90 : 90,
              position: index % 2 === 0 ? "insideLeft" : "insideRight",
            }}
            domain={[dataSeries.minValue, dataSeries.maxValue]}
            scale={scale}
            orientation={index % 2 === 0 ? "left" : "right"}
            tickFormatter={(value) => value.toLocaleString()}
            yAxisId={index + 1}
          />
        ))}

        {dataSeriesInfo.map((dataSeries, index) => (
          <Line
            key={index}
            dataKey={dataSeries.yAxisKey}
            dot={false}
            connectNulls={true}
            stroke={dataSeries.yAxisColor} // Use the color defined in dataSeriesInfo
            name={dataSeries.yAxisName}
            yAxisId={index + 1}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
