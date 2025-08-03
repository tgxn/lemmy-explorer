import React from "react";

import Moment from "react-moment";

import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";

import { ExtLink } from "../Shared/Link";

function boolText(value) {
  if (value === undefined || value === null) return "Unknown";
  return value ? "Yes" : "No";
}

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
            {trust.visibility_endorsements && (
              <tr>
                <th>Visibility - Endorsements</th>
                <td>{trust.visibility_endorsements}</td>
              </tr>
            )}
            {trust.visibility_censures && (
              <tr>
                <th>Visibility - Censures</th>
                <td>{trust.visibility_censures}</td>
              </tr>
            )}
            {trust.visibility_hesitations && (
              <tr>
                <th>Visibility - Hesitations</th>
                <td>{trust.visibility_hesitations}</td>
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
      {(trust.open_registrations !== undefined ||
        trust.email_verify !== undefined ||
        trust.approval_required !== undefined ||
        trust.has_captcha !== undefined) && (
        <Box>
          <Typography level="h3" gutterBottom>
            Registration
          </Typography>
          <Table size="sm">
            <tbody>
              {trust.open_registrations !== undefined && (
                <tr>
                  <th>Open Registrations</th>
                  <td>{boolText(trust.open_registrations)}</td>
                </tr>
              )}
              {trust.email_verify !== undefined && (
                <tr>
                  <th>Email Verification</th>
                  <td>{boolText(trust.email_verify)}</td>
                </tr>
              )}
              {trust.approval_required !== undefined && (
                <tr>
                  <th>Approval Required</th>
                  <td>{boolText(trust.approval_required)}</td>
                </tr>
              )}
              {trust.has_captcha !== undefined && (
                <tr>
                  <th>Captcha</th>
                  <td>{boolText(trust.has_captcha)}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>
      )}

      {(trust.software || trust.version || trust.claimed !== undefined) && (
        <Box>
          <Typography level="h3" gutterBottom>
            Software
          </Typography>
          <Table size="sm">
            <tbody>
              {trust.software && (
                <tr>
                  <th>Software</th>
                  <td>{trust.software}</td>
                </tr>
              )}
              {trust.version && (
                <tr>
                  <th>Version</th>
                  <td>{trust.version}</td>
                </tr>
              )}
              {trust.claimed !== undefined && (
                <tr>
                  <th>Claimed</th>
                  <td>{boolText(trust.claimed)}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>
      )}

      {tags.length > 0 && (
        <Box>
          <Typography level="h3" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tags.map((t, idx) => {
              const label = typeof t === "string" ? t : t.tag;
              const count = typeof t === "string" ? undefined : t.count;
              const rank = typeof t === "string" ? undefined : t.rank;
              const extras = [];
              if (count !== undefined) extras.push(count);
              if (rank !== undefined) extras.push(`#${rank}`);
              return (
                <Chip key={idx} variant="solid" color="primary" size="sm">
                  {label}
                  {extras.length ? ` (${extras.join(", ")})` : ""}
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
