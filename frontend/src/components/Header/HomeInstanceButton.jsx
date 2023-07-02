import React from "react";
import { connect } from "react-redux";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";
import FormLabel from "@mui/joy/FormLabel";
import FormHelperText from "@mui/joy/FormHelperText";
import Switch, { switchClasses } from "@mui/joy/Switch";

import CottageIcon from "@mui/icons-material/Cottage";
import HomeIcon from "@mui/icons-material/Home";

import { changeInstanceType } from "../../reducers/configReducer";

import SelectHomeInstance from "./SelectHomeInstance";

function HomeInstanceButton({ homeBaseUrl, instanceType, dispatch }) {
  const [isOpen, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [isKbinInstance, _setIsKbinInstance] = React.useState(instanceType === "kbin");
  const setIsKbinInstance = (isKbin) => {
    _setIsKbinInstance(isKbin);
    dispatch(changeInstanceType(isKbin ? "kbin" : "lemmy"));
  };

  const handleClick = (event) => {
    if (isOpen) setOpen(false);
    else setOpen(true);

    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Tooltip title={homeBaseUrl ? `Home instance: ${homeBaseUrl}` : "Set Home Instance"} variant="soft">
        <IconButton
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
        id="positioned-demo-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => {
          setOpen(false);
          setAnchorEl(null);
        }}
        aria-labelledby="positioned-demo-button"
        placement="bottom-end"
      >
        <ListItem
          disabled
          sx={{
            color: "text.body",
          }}
        >
          <ListItemDecorator sx={{ p: 1, alignSelf: "center" }}>
            <CottageIcon />
          </ListItemDecorator>
          Choose Home Instance
        </ListItem>

        <ListDivider />
        <Box
          sx={{
            px: 2,
            py: 1,
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          <SelectHomeInstance onSetKBin={(isKbin) => setIsKbinInstance(isKbin)} />
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
                color={isKbinInstance ? "warning" : "success"}
                checked={isKbinInstance}
                onChange={(event) => setIsKbinInstance(event.target.checked)}
                labelPlacement="end"
              />
            </ListItemDecorator>
            <Box sx={{ px: 2 }}>
              {!isKbinInstance && <FormLabel>Lemmy Instance</FormLabel>}
              {isKbinInstance && <FormLabel>KBin Instance</FormLabel>}
              {!isKbinInstance && <FormHelperText sx={{ mt: 0 }}>Instance links use /c/</FormHelperText>}
              {isKbinInstance && <FormHelperText sx={{ mt: 0 }}>Instance links use /m/</FormHelperText>}
            </Box>
          </ListItem>
        )}
      </Menu>
    </>
  );
}

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
  instanceType: state.configReducer.instanceType,
});
export default connect(mapStateToProps)(HomeInstanceButton);
