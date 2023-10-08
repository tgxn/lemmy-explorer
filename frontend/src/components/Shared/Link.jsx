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

const CommunityLink = React.memo(({ baseType, community, homeBaseUrl, instanceType }) => {
  const [instanceLink, tooltipTitle] = React.useMemo(() => {
    let instanceLink = `https://${community.baseurl}/c/${community.name}`;
    let tooltipTitle = `${community.baseurl}/c/${community.name}`;

    if (baseType == "kbin") {
      instanceLink = `https://${community.baseurl}/m/${community.name}`;
      tooltipTitle = `${community.baseurl}/m/${community.name}`;
    }

    // user has a home instance
    if (homeBaseUrl) {
      // if the user is
      if (instanceType == "kbin") {
        instanceLink = `https://${homeBaseUrl}/m/${community.name}`;
        tooltipTitle = `${homeBaseUrl}/m/${community.name}`;
      } else {
        instanceLink = `https://${homeBaseUrl}/c/${community.name}`;
        tooltipTitle = `${homeBaseUrl}/c/${community.name}`;
      }

      // if this community isn't on their instance, add the qualifier
      if (homeBaseUrl != community.baseurl) {
        instanceLink = `${instanceLink}@${community.baseurl}`;
        tooltipTitle = `${tooltipTitle}@${community.baseurl}`;
      }
    }

    return [instanceLink, tooltipTitle];
  }, [community, homeBaseUrl, instanceType]);

  return (
    <Tooltip title={tooltipTitle} variant="soft" placement="top-start">
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
});
const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
  instanceType: state.configReducer.instanceType,
});
export const ExtCommunityLink = connect(mapStateToProps)(CommunityLink);

export function ExtInstanceLink({ instance }) {
  return <ExtLink linkName={instance.name} linkUrl={instance.url} />;
}

export function ExtLink({ linkName, linkUrl, ...props }) {
  return (
    <Link
      level="body1"
      variant="plain"
      alt={linkName}
      color="neutral"
      href={linkUrl}
      target="_blank"
      // sx={{
      //   fontWeight: "bold",
      //   fontSize: "16px",
      //   textOverflow: "ellipsis",
      // }}
      {...props}
    >
      {linkName} <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
    </Link>
  );
}
