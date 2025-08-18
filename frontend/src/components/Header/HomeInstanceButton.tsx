import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import ListDivider from "@mui/joy/ListDivider";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

import CottageIcon from "@mui/icons-material/Cottage";
import HomeIcon from "@mui/icons-material/Home";

import { changeInstanceType } from "../../reducers/configReducer";

import SelectHomeInstance from "./SelectHomeInstance";
import InstanceTypeIcon from "../Shared/InstanceTypeIcon";

export default function HomeInstanceButton() {
  const homeBaseUrl = useSelector((state: any) => state.configReducer.homeBaseUrl);
  const instanceType = useSelector((state: any) => state.configReducer.instanceType);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleClick = (event) => {
    if (menuOpen) return handleClose();

    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };
  const handleClose = () => {
    setMenuOpen(false);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={homeBaseUrl ? `Home instance: ${homeBaseUrl}` : "Set Home Instance"} variant="soft">
        <IconButton
          aria-controls={menuOpen ? "home-instance-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? "true" : undefined}
          variant="outlined"
          color={homeBaseUrl ? "success" : "neutral"}
          sx={{ mr: 2, p: 1 }}
          onClick={handleClick}
        >
          {!homeBaseUrl && <HomeIcon />}
          {homeBaseUrl && <CottageIcon />}
        </IconButton>
      </Tooltip>
      <Menu
        id="home-instance-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        placement="bottom-end"
      >
        <MenuItem
          disabled
          sx={{
            color: "text.body",
          }}
        >
          <ListItemDecorator sx={{ p: 1, alignSelf: "center" }}>
            {homeBaseUrl ? <CottageIcon color={"success"} /> : <HomeIcon />}
          </ListItemDecorator>
          <ListItemContent>
            <Typography>Choose Home Instance</Typography>
            <Typography level="body2" noWrap>
              Community links will open on this instance.
            </Typography>
          </ListItemContent>
        </MenuItem>

        <ListDivider />
        <Box
          sx={{
            px: 2,
            py: 1,
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          <SelectHomeInstance />
        </Box>

        {homeBaseUrl && (
          <Box
            sx={{
              px: 2,
              py: 1,
              fontSize: "0.75rem",
              color: "text.secondary",
              zIndex: 15000,
            }}
          >
            <FormControl size="sm">
              <FormLabel>Instance Type</FormLabel>
              <Select
                value={instanceType}
                onChange={(event, value) => dispatch(changeInstanceType(value))}
                sx={{
                  height: "2.5rem",
                }}
                startDecorator={<InstanceTypeIcon type={instanceType} />}
              >
                <Option value="lemmy">
                  <ListItemDecorator>
                    <InstanceTypeIcon type="lemmy" />
                  </ListItemDecorator>
                  Lemmy
                </Option>
                <Option value="mbin">
                  <ListItemDecorator>
                    <InstanceTypeIcon type="mbin" />
                  </ListItemDecorator>
                  MBin
                </Option>
                <Option value="piefed">
                  <ListItemDecorator>
                    <InstanceTypeIcon type="piefed" />
                  </ListItemDecorator>
                  Piefed
                </Option>
              </Select>

              {(instanceType === "piefed" || instanceType === "lemmy") && (
                <FormHelperText sx={{ mt: 0 }}>Instance links use /c/</FormHelperText>
              )}
              {instanceType === "mbin" && (
                <FormHelperText sx={{ mt: 0 }}>Instance links use /m/</FormHelperText>
              )}
            </FormControl>
          </Box>
        )}
      </Menu>
    </>
  );
}
