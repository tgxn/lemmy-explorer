import React, { useEffect } from "react";
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
import Switch, { switchClasses } from "@mui/joy/Switch";

import CottageIcon from "@mui/icons-material/Cottage";
import HomeIcon from "@mui/icons-material/Home";

import { changeInstanceType } from "../../reducers/configReducer";

import SelectHomeInstance from "./SelectHomeInstance";

export default function HomeInstanceButton() {
  const homeBaseUrl = useSelector((state: any) => state.configReducer.homeBaseUrl);
  const instanceType = useSelector((state: any) => state.configReducer.instanceType);
  const dispatch = useDispatch();

  const [isMBinInstance, _setIsMBinInstance] = React.useState<boolean>(instanceType === "mbin");
  const [isPiefedInstance, _setIsPiefedInstance] = React.useState<boolean>(instanceType === "piefed");

  const setIsMBinInstance = (isMBin: boolean) => {
    _setIsMBinInstance(isMBin);
    dispatch(changeInstanceType(isMBin ? "mbin" : "lemmy"));
  };

  const setIsPiefedInstance = (isPiefed: boolean) => {
    _setIsPiefedInstance(isPiefed);
    dispatch(changeInstanceType(isPiefed ? "piefed" : "lemmy"));
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  useEffect(() => {
    setIsMBinInstance(instanceType === "mbin");
  }, [instanceType]);

  useEffect(() => {
    setIsPiefedInstance(instanceType === "piefed");
  }, [instanceType]);

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
          <SelectHomeInstance
            onSetMBin={(isMBin: boolean) => setIsMBinInstance(isMBin)}
            onSetPiefed={(isPiefed: boolean) => setIsPiefedInstance(isPiefed)}
          />
        </Box>

        {homeBaseUrl && (
          <ListItem
            sx={{
              px: 2,
              py: 1,
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          >
            <ListItemDecorator sx={{ p: 1, alignSelf: "center" }}>
              <Switch
                color={isMBinInstance ? "warning" : "success"}
                checked={isMBinInstance}
                onChange={(event) => setIsMBinInstance(event.target.checked)}
                // labelPlacement="end"
              />
            </ListItemDecorator>
            <Box sx={{ px: 2 }}>
              {!isMBinInstance && <FormLabel>Lemmy Instance</FormLabel>}
              {isMBinInstance && <FormLabel>MBin Instance</FormLabel>}
              {!isMBinInstance && <FormHelperText sx={{ mt: 0 }}>Instance links use /c/</FormHelperText>}
              {isMBinInstance && <FormHelperText sx={{ mt: 0 }}>Instance links use /m/</FormHelperText>}
            </Box>
          </ListItem>
        )}
      </Menu>
    </>
  );
}
