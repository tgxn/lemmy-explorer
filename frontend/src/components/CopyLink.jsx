import React from "react";

import Tooltip from "@mui/joy/Tooltip";
import Link from "@mui/joy/Link";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function CopyLink({ copyText, linkProps }) {
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

export default CopyLink;
