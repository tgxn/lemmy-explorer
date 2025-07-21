import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Menu from "@mui/joy/Menu";
import Button from "@mui/joy/Button";
import MenuItem from "@mui/joy/MenuItem";
import Typography from "@mui/joy/Typography";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const brandRoutes = {
  lemmy: "/",
  mbin: "/mbin/magazines",
  piefed: "/piefed/communities",
};

type IBrandEntryProps = {
  icon: string;
  name: string;
};

function BrandEntry({ icon, name }: IBrandEntryProps) {
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 1,
      }}
    >
      <Box
        component="div"
        sx={{
          height: 28,
          width: "60px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          alt={name}
          src={`/icons/${icon}`}
          style={{
            maxHeight: 28,
            display: "flex",
            borderRadius: 0,
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: "20px",
          display: { xs: "none", sm: "block" },
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}

function BrandMenuItem({
  icon,
  name,
  selected,
  onClick,
}: IBrandEntryProps & {
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <MenuItem
      {...(selected && { variant: "solid" })}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",

        py: 1,
      }}
    >
      <BrandEntry icon={icon} name={name} />
    </MenuItem>
  );
}

// TODO need to make the button shring down to a small dropdown on small screens
export default function HeaderMainButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

  const selectedSoftware = React.useMemo(() => {
    if (location.pathname.startsWith("/mbin")) {
      return "mbin";
    } else if (location.pathname.startsWith("/piefed")) {
      return "piefed";
    } else {
      return "lemmy";
    }
  }, [location.pathname]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (menuOpen) return handleCloseMenu();

    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        userSelect: "none",
      }}
    >
      <Button
        aria-controls={menuOpen ? "left-side-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          p: 1,
          backgroundColor: anchorEl ? "background.level2" : "background.level1",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "background.level2",
          },
        }}
        onClick={handleOpenMenu}
      >
        {selectedSoftware === "lemmy" && <BrandEntry icon="lemmy_64px.png" name="Lemmy Explorer" />}
        {selectedSoftware === "mbin" && <BrandEntry icon="mbin_64px.png" name="MBin Explorer" />}
        {selectedSoftware === "piefed" && <BrandEntry icon="piefed_64px.png" name="Piefed Explorer" />}

        <ArrowDropDownIcon
          sx={{
            color: "text.secondary",
            fontSize: "1.5rem",
            ml: 1,
            mr: 1,
          }}
        />
      </Button>

      <Menu
        id="left-side-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        placement="auto"
        sx={{
          zIndex: 1000,
          gap: 0.5,
        }}
      >
        <BrandMenuItem
          icon="lemmy_64px.png"
          name="Lemmy Explorer"
          selected={selectedSoftware === "lemmy"}
          onClick={() => {
            navigate(brandRoutes.lemmy);
            handleCloseMenu();
          }}
        />

        <BrandMenuItem
          icon="mbin_64px.png"
          name="MBin Explorer"
          selected={selectedSoftware === "mbin"}
          onClick={() => {
            navigate(brandRoutes.mbin);
            handleCloseMenu();
          }}
        />

        <BrandMenuItem
          icon="piefed_64px.png"
          name="Piefed Explorer"
          selected={selectedSoftware === "piefed"}
          onClick={() => {
            navigate(brandRoutes.piefed);
            handleCloseMenu();
          }}
        />
      </Menu>
    </Box>
  );
}
