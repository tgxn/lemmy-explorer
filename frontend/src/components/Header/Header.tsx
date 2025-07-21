import React from "react";
import { useDispatch } from "react-redux";

import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import useQueryCache from "../../hooks/useQueryCache";

import Badge from "@mui/joy/Badge";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
// import Typography from "@mui/joy/Typography";

import { SimpleNumberFormat } from "../Shared/Display";
import HeaderSideMenu from "./HeaderSideMenu";
import HeaderMainButton from "./HeaderMainButton";

import { setHomeInstance } from "../../reducers/configReducer";

// export default function MobileMenu() {
//   const buttonRef = React.useRef(null);
//   const [open, setOpen] = React.useState(false);

//   const handleClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div>
//       <Button
//         ref={buttonRef}
//         id="basic-demo-button"
//         aria-controls={'basic-menu'}
//         aria-haspopup="true"
//         aria-expanded={open ? 'true' : undefined}
//         variant="outlined"
//         color="neutral"
//         onClick={() => {
//           setOpen(!open);
//         }}
//       >
//         Dashboard
//       </Button>
//       <Menu
//         id="basic-menu"
//         anchorEl={buttonRef.current}
//         open={open}
//         onClose={handleClose}
//         aria-labelledby="basic-demo-button"
//       >
//         <MenuItem onClick={handleClose}>Profile</MenuItem>
//         <MenuItem onClick={handleClose}>My account</MenuItem>
//         <MenuItem onClick={handleClose}>Logout</MenuItem>
//       </Menu>
//     </div>
//   );
// }

export default function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { isLoading, isSuccess, isError, data: metaData } = useQueryCache("metaData", "meta");

  const [index, setIndex] = React.useState<number | null>(0);

  const navigate = useNavigate();

  const location = useLocation();
  console.log("location", location);

  // set the active tab based on current location
  React.useEffect(() => {
    if (location.pathname == "/") {
      setIndex(0);
    } else if (location.pathname == "/communities") {
      setIndex(1);
    } else if (location.pathname == "/mbin/magazines") {
      setIndex(2);
    } else if (location.pathname == "/piefed/communities") {
      setIndex(3);
    } else {
      setIndex(null);
    }
  }, [location]);

  // set the current home instance if the url param is set
  React.useEffect(() => {
    console.log("location", location.search);

    if (searchParams.has("home_url")) {
      const home_url = searchParams.get("home_url");

      let home_type = "lemmy";
      if (searchParams.has("home_type")) {
        home_type = searchParams.get("home_type");
      }

      console.log("home_url", home_url, home_type);
      dispatch(setHomeInstance(home_url, home_type));
      setSearchParams({ home_url: null, home_type: null });
    }
  }, [searchParams]);

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
      <HeaderMainButton />
      <Box sx={{ flexGrow: 1 }} />
      <Tabs
        value={index}
        onChange={(event, value: number) => {
          console.log("value", value);
          setIndex(value);

          if (value === 0) {
            navigate("/");
          }
          if (value === 1) {
            navigate("/communities");
          }
          if (value === 2) {
            navigate("/mbin/magazines");
          }
          if (value === 3) {
            navigate("/piefed/communities");
          }
        }}
        sx={{ borderRadius: "lg" }}
      >
        <TabList variant="soft">
          {/* <Box>
            <MobileMenu />
          </Box> */}

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

          {/* <Badge
            badgeContent={isSuccess && <SimpleNumberFormat value={metaData.magazines} />}
            max={9999}
            variant={"solid"}
            color="warning"
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 2 ? "solid" : "soft"} color={index === 2 ? "warning" : "neutral"}>
              Magazines
            </Tab>
          </Badge> */}
        </TabList>
      </Tabs>
      <Box sx={{ flexGrow: 1 }} />

      <HeaderSideMenu />
    </Box>
  );
}
