import React from "react";

import Moment from "react-moment";

import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";

import { ExtLink } from "../Shared/Link";

export default function InstanceFediseer({ instance }) {
  const trust = instance.trust || {};
  const uptime = instance.uptime;
  const tags = instance.tags || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography level="h3" gutterBottom>
          Trust
        </Typography>
        <Table size="sm">
          <tbody>
            <tr>
              <th>State</th>
              <td>{trust.state || "Unknown"}</td>
            </tr>
            <tr>
              <th>Endorsements</th>
              <td>{trust.endorsements ?? "N/A"}</td>
            </tr>
            <tr>
              <th>Approvals</th>
              <td>{trust.approvals ?? "N/A"}</td>
            </tr>
            <tr>
              <th>Guarantor</th>
              <td>{trust.guarantor || "None"}</td>
            </tr>
            {trust.censure_reasons && trust.censure_reasons.length > 0 && (
              <tr>
                <th>Censures</th>
                <td>{trust.censure_reasons.join(", ")}</td>
              </tr>
            )}
            {trust.flags && trust.flags.length > 0 && (
              <tr>
                <th>Flags</th>
                <td>
                  {trust.flags.map((f) => (f.comment ? `${f.flag} (${f.comment})` : f.flag)).join(", ")}
                </td>
              </tr>
            )}
            {trust.sysadmins !== undefined && (
              <tr>
                <th>Sysadmins</th>
                <td>{trust.sysadmins}</td>
              </tr>
            )}
            {trust.moderators !== undefined && (
              <tr>
                <th>Moderators</th>
                <td>{trust.moderators}</td>
              </tr>
            )}
            <tr>
              <th>Details</th>
              <td>
                <ExtLink
                  linkUrl={`https://gui.fediseer.com/instances/detail/${instance.baseurl}`}
                  linkName="View on Fediseer"
                  variant="soft"
                  target="_fediseer"
                />
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>

      {tags.length > 0 && (
        <Box>
          <Typography level="h3" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tags.map((t, idx) => {
              const label = typeof t === "string" ? t : t.tag;
              return (
                <Chip key={idx} variant="solid" color="primary" size="sm">
                  {label}
                </Chip>
              );
            })}
          </Box>
        </Box>
      )}

      {uptime && (
        <Box>
          <Typography level="h3" gutterBottom>
            Uptime
          </Typography>
          <Table size="sm">
            <tbody>
              <tr>
                <th>All Time</th>
                <td>{uptime.uptime_alltime}%</td>
              </tr>
              <tr>
                <th>Latency</th>
                <td>{uptime.latency} ms</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>{uptime.countryname}</td>
              </tr>
              <tr>
                <th>First Seen</th>
                <td>
                  <Moment fromNow>{uptime.date_created}</Moment>
                </td>
              </tr>
              <tr>
                <th>Last Updated</th>
                <td>
                  <Moment fromNow>{uptime.date_updated}</Moment>
                </td>
              </tr>
            </tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
