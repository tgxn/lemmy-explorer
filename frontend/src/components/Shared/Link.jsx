import React from "react";
import { connect } from "react-redux";

import Link from "@mui/joy/Link";
import Tooltip from "@mui/joy/Tooltip";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export function CopyLink({ copyText, linkProps }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);
  return (
    <Tooltip title={copied ? "👍 Copied!" : "Click to Copy"} variant="soft" placement="bottom">
      <Link
        level="body3"
        {...linkProps}
        onClick={(e) => {
          e.preventDefault();
          navigator.clipboard.writeText(copyText);
          setCopied(true);
        }}
      >
        <ContentCopyIcon
          fontSize="small"
          sx={{
            mr: 0.5,
          }}
        />
        {copyText && copyText}
      </Link>
    </Tooltip>
  );
}

function CommunityLink({ community, homeBaseUrl, instanceType }) {
  const instanceLink = React.useMemo(() => {
    let instanceLink = `https://${community.baseurl}/c/${community.name}`;

    // user has a home instance
    if (homeBaseUrl) {
      // if the user is
      if (instanceType == "kbin") {
        instanceLink = `https://${homeBaseUrl}/m/${community.name}`;
      } else {
        instanceLink = `https://${homeBaseUrl}/c/${community.name}`;
      }

      // if this community isn't on their instance, add the qualifier
      if (homeBaseUrl != community.baseurl) {
        instanceLink = `${instanceLink}@${community.url && community.url.split("/")[2]}`;
      }
    }
    return instanceLink;
  }, [community, homeBaseUrl, instanceType]);

  return (
    <Tooltip
      title={"Visit: " + community.title + (homeBaseUrl ? " inside " + homeBaseUrl : "")}
      variant="soft"
      placement="top-start"
    >
      <Link
        level="body1"
        variant="plain"
        alt={community.title}
        color="neutral"
        href={instanceLink}
        target="_blank"
      >
        {community.title}
        <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
      </Link>
    </Tooltip>
  );
}
const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
  instanceType: state.configReducer.instanceType,
});
export const ExtCommunityLink = connect(mapStateToProps)(CommunityLink);

export function ExtInstanceLink({ instance }) {
  return (
    <Link
      level="body1"
      variant="plain"
      alt={instance.name}
      color="neutral"
      href={instance.url}
      target="_blank"
      // sx={{
      //   fontWeight: "bold",
      //   fontSize: "16px",
      //   textOverflow: "ellipsis",
      // }}
    >
      {instance.name} <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
    </Link>
  );
}
