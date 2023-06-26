/* eslint-disable max-classes-per-file */
import React, { PureComponent } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#8889DD", "#9597E4", "#8DC77B", "#A5D297", "#E2CF45", "#F8C12D"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "black",
        }}
      >
        {/* <p className="label">ActiveMonth: {payload[0].metrics.userActiveMonthScore}</p> */}
        <p className="label">{JSON.stringify(payload[0].payload.name)}</p>
        <p className="label">{JSON.stringify(payload[0].payload.value)}</p>
      </div>
    );
  }

  return null;
};

class CustomizedContent extends PureComponent {
  render() {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = this.props;
    console.log("versCustomizedContent", root.children[index]);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : "#ffffff00",
            stroke: "#fff",
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 ? (
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null}
        {depth >= 1 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
            {root.children[index].name}
          </text>
        ) : null}
      </g>
    );
  }
}

export function VersionDist({ instances }) {
  const data = React.useMemo(() => {
    const versionsCounts = {};

    instances.map((instance) => {
      const version = instance.version;
      if (versionsCounts[version]) {
        versionsCounts[version] += 1;
      } else {
        versionsCounts[version] = 1;
      }
    });
    console.log("versionsCounts", versionsCounts);

    const mainline = Object.keys(versionsCounts)
      .filter((version) => version !== "" && version !== "unknown version")
      .filter((version) => version.indexOf("-") === -1 && version.indexOf(".") !== -1 && version.length == 6)
      .map((version) => {
        return { name: version, size: versionsCounts[version] };
      });

    const unstable = Object.keys(versionsCounts)
      .filter((version) => version !== "" && version !== "unknown version")
      .filter((version) => version.indexOf("-") !== -1 || version.indexOf(".") === -1 || version.length != 6)
      .map((version) => {
        return { name: version, size: versionsCounts[version] };
      });

    const unknown = Object.keys(versionsCounts)
      .filter((version) => version === "" || version === "unknown version")
      .map((version) => {
        return { name: version, size: versionsCounts[version] };
      });

    const data = [
      {
        name: "unknown",
        children: unknown,
      },

      {
        name: "unstable",
        children: unstable,
      },
      {
        name: "mainline",
        children: mainline,
      },
    ];
    console.log("vers data", data);

    return data;
  }, [instances]);

  return (
    <ResponsiveContainer width="100%" height={600}>
      <Treemap
        // width={800}
        // height={500}
        data={data}
        dataKey="size"
        stroke="#fff"
        fill="#8884d8"
        content={<CustomizedContent colors={COLORS} />}
      >
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
