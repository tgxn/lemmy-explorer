import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Avatar from "@mui/joy/Avatar";
import Tooltip from "@mui/joy/Tooltip";
import Badge from "@mui/joy/Badge";

import HomeIcon from "@mui/icons-material/Home";

import { setHomeInstance } from "../../reducers/configReducer";

export function IconAvatar({ src, alt }: { src: string; alt: string }) {
  let style = {
    display: "flex",
    borderRadius: 8,
    bgcolor: "background.level1",
  };
  return <Avatar alt={alt} src={src} size="lg" sx={style} />;
}

export const InstanceAvatar = React.memo(function ({ instance }: { instance: any }) {
  const homeBaseUrl = useSelector((state: any) => state.configReducer.homeBaseUrl);
  const dispatch = useDispatch();

  const [isHover, setIsHover] = React.useState(false);
  const isHomeUrl = homeBaseUrl == instance.baseurl;

  const style = React.useMemo(() => {
    let style: any = {
      display: "flex",
      borderRadius: 8,
      bgcolor: "background.level1",
    };

    if (isHomeUrl) {
      style = {
        ...style,
        outline: "1px solid #0f5d26",
        boxShadow: "1px 1px 3px 0px #0f5d26",
      };
    } else if (isHover) {
      style = {
        ...style,
        outline: "1px solid #666",
        boxShadow: "1px 1px 3px 0px #666",
      };
    }
    return style;
  }, [isHomeUrl, isHover]);

  const setAsHome = () => {
    dispatch(setHomeInstance(instance.baseurl, "lemmy"));
  };

  return (
    <Badge
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      variant="soft"
      invisible={!isHomeUrl && !isHover}
      badgeContent={<HomeIcon color={"success"} />}
      badgeInset="14%"
      sx={{
        "--Badge-paddingX": "0px",
        // "--Badge-ringSize": "0px",
        // "--Badge-borderRadius": "4px",
        // "--Badge-ringColor": "success",
        // borderRadius: 1,
        //remove bg
        cursor: "pointer",
        "& .MuiBadge-badge": {
          // background: "transparent",
          // mouse passthru
          pointerEvents: "none",
        },
      }}
    >
      <Tooltip title={"Set as Home Server"} placement="top">
        <Avatar
          // color={isHomeUrl ? "success" : "neutral"}
          alt={instance.name}
          src={instance.icon}
          size="lg"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={setAsHome}
          sx={style}
        />
      </Tooltip>
    </Badge>
  );
});
