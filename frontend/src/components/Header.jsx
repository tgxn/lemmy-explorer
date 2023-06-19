import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useQueryCache from "../hooks/useQueryCache";

import Badge from "@mui/joy/Badge";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import Typography from "@mui/joy/Typography";

import { SimpleNumberFormat } from "../components/Display";
import HeaderSideMenu from "../components/HeaderSideMenu";

export default function Header() {
  const { isLoading, isSuccess, isError, data: metaData } = useQueryCache("metaData", "/meta.json");

  const [index, setIndex] = React.useState(0);

  const navigate = useNavigate();

  const location = useLocation();
  console.log("location", location);

  React.useEffect(() => {
    if (location.pathname == "/") {
      setIndex(0);
    } else if (location.pathname == "/communities") {
      setIndex(1);
    } else {
      setIndex(null);
    }
  }, [location]);

  return (
    <Box
      component="header"
      sx={{
        p: 2,
        display: "flex",
        height: "80px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box
        component="div"
        sx={{
          width: 30,
          height: 30,
          // dont change item size on flex
          flexShrink: 0,
          pr: 2,
          ml: 2,
          mr: 2,
          background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
          backgroundSize: "contain",
        }}
      />
      <Typography
        sx={{
          // ml: 1,
          fontSize: "19px",
          display: { xs: "none", sm: "block" },
        }}
      >
        Lemmy Explorer
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Tabs
        value={index}
        onChange={(event, value) => {
          console.log("value", value);
          setIndex(value);

          if (value === 0) {
            navigate("/");
          }
          if (value === 1) {
            navigate("/communities");
          }
        }}
        sx={{ borderRadius: "lg" }}
      >
        <TabList variant="soft">
          <Badge
            badgeContent={isSuccess && <SimpleNumberFormat value={metaData.instances} />}
            max={999}
            color="info"
            variant={"solid"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 0 ? "solid" : "soft"} color={index === 0 ? "info" : "neutral"}>
              Instances
            </Tab>
          </Badge>

          <Badge
            badgeContent={isSuccess && <SimpleNumberFormat value={metaData.communities} />}
            max={99999}
            variant={"solid"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 1 ? "solid" : "soft"} color={index === 1 ? "primary" : "neutral"}>
              Communities
            </Tab>
          </Badge>
        </TabList>
      </Tabs>
      <Box sx={{ flexGrow: 1 }} />

      <HeaderSideMenu />
    </Box>
  );
}
