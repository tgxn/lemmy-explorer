import * as React from "react";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";

import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel, { formLabelClasses } from "@mui/joy/FormLabel";
import IconButton, { IconButtonProps } from "@mui/joy/IconButton";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

function ColorSchemeToggle({ onClick, ...props }) {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <IconButton size="sm" variant="plain" color="neutral" disabled />;
  }
  return (
    <IconButton
      id="toggle-mode"
      size="sm"
      variant="plain"
      color="neutral"
      {...props}
      onClick={(event) => {
        if (mode === "light") {
          setMode("dark");
        } else {
          setMode("light");
        }
        onClick?.(event);
      }}
    >
      {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

export default function TabsVariants() {
  const [index, setIndex] = React.useState(0);
  return (
    <Box
      component="header"
      sx={{
        p: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography
        fontWeight="lg"
        startDecorator={
          <Box
            component="span"
            sx={{
              width: 24,
              height: 24,
              background: `url("/icons/Lemmy_Logo.svg") no-repeat center center`,
              //   borderRadius: "50%",
              //   boxShadow: (theme) => theme.shadow.md,
              //   "--joy-shadowChannel": (theme) => theme.vars.palette.primary.mainChannel,
            }}
          />
        }
      >
        Lemmy Explorer
      </Typography>
      <Tabs
        aria-label="Soft tabs"
        value={index}
        onChange={(event, value) => setIndex(value)}
        sx={{ borderRadius: "lg" }}
      >
        <TabList variant="soft">
          <Tab variant={index === 0 ? "solid" : "plain"} color={index === 0 ? "primary" : "neutral"}>
            Instances
          </Tab>
          <Tab variant={index === 1 ? "solid" : "plain"} color={index === 1 ? "primary" : "neutral"}>
            Communities
          </Tab>
        </TabList>
      </Tabs>
      <ColorSchemeToggle />
    </Box>

    // <Box sx={{ display: "flex", gap: 2, flexDirection: "column", flexAlign: "center", width: "500px" }}>
    //   Lemmy Explorer
    //   <Tabs
    //     aria-label="Soft tabs"
    //     value={index}
    //     onChange={(event, value) => setIndex(value)}
    //     sx={{ borderRadius: "lg" }}
    //   >
    //     <TabList variant="soft">
    //       <Tab variant={index === 0 ? "solid" : "plain"} color={index === 0 ? "primary" : "neutral"}>
    //         Instances
    //       </Tab>
    //       <Tab variant={index === 1 ? "solid" : "plain"} color={index === 1 ? "primary" : "neutral"}>
    //         Communities
    //       </Tab>
    //     </TabList>
    //   </Tabs>
    //   <ColorSchemeToggle />
    // </Box>
  );
}
