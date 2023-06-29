import React from "react";
import { connect } from "react-redux";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

import CottageIcon from "@mui/icons-material/Cottage";
import HomeIcon from "@mui/icons-material/Home";

import SelectHomeInstance from "./SelectHomeInstance";

function HomeInstanceButton({ homeBaseUrl, dispatch }) {
  const [isOpen, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    if (isOpen) setOpen(false);

    setAnchorEl(event.currentTarget);
    setOpen(true);
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
        onClose={() => setOpen(false)}
        aria-labelledby="positioned-demo-button"
        placement="bottom-end"
      >
        <MenuItem disabled>
          <ListItemDecorator>
            <CottageIcon />
          </ListItemDecorator>
          Set Home Instance
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
      </Menu>
    </>
  );
}

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(HomeInstanceButton);
