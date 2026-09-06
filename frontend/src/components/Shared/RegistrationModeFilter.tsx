import React, { useState, useEffect, useRef } from "react";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

import Checkbox from "@mui/joy/Checkbox";

type IRegModes = "all" | "open" | "registration" | "closed";

type IRegistrationModeProps = {
  regMode: IRegModes[];
  setRegMode: (value: any) => void;
};

const RegistrationModeFilter = React.memo(({ regMode, setRegMode }: IRegistrationModeProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close the dropdown when clicking outside of it
  useEffect(() => {
    if (!open) return;
    const handleClickAway = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [open]);

  const handleChange = (newValue: IRegModes) => {
    console.log(`regMode chose "${newValue}"`);

    // click all directly
    if (newValue === "all") {
      console.log("regMode all");
      setRegMode(["all"]);
      return;
    }

    // if all was selected, and we select another option, replace the chosen option with the new one
    if (regMode.length === 1 && regMode[0] === "all") {
      console.log("regMode first change");
      setRegMode([newValue]);
      return;
    }

    let newArray = [...regMode];

    // Toggle the selected option in the array
    if (regMode.includes(newValue)) {
      newArray = newArray.filter((item) => item !== newValue);
    } else {
      newArray = [...newArray, newValue];
    }

    // if the new array is empty, set it to all
    if (newArray.length === 0) {
      setRegMode(["all"]);
      return;
    }

    // if all options are selected, set it to all
    if (newArray.length === 3 && !newArray.includes("all")) {
      setRegMode(["all"]);
      return;
    }

    setRegMode(newArray);
  };

  const menuOptions = [
    {
      name: "All",
      value: "all",
    },
    {
      name: "Open",
      value: "open",
    },
    {
      name: "By Application",
      value: "registration",
    },
    {
      name: "Closed",
      value: "closed",
    },
  ];

  const valueLabel = regMode.map((v) => menuOptions.find((o) => o.value === v)?.name ?? v).join(", ");

  // only collapse to a single line when "all" is the sole selection; any
  // customized selection should stay on two lines to draw attention
  const isAllOnly = regMode.length === 1 && regMode[0] === "all";

  return (
    <Box ref={rootRef} sx={{ position: "relative", minWidth: "15rem" }}>
      <Button
        variant="outlined"
        color="neutral"
        onClick={() => setOpen((o) => !o)}
        sx={{
          width: "100%",
          // fixed height so the button never resizes between the
          // single-line "all" state and the two-line customized state
          height: "2.6rem",
          justifyContent: "flex-start",
          fontWeight: "normal",
          backgroundColor: "background.surface",
          color: "text.primary",
          "&:hover": { backgroundColor: "background.level1" },
          "--Button-paddingInline": "0.75rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {isAllOnly ? (
            <Typography
              sx={{
                color: "neutral.600",
                fontWeight: "normal",
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "13rem",
              }}
            >
              Registration Mode: {valueLabel}
            </Typography>
          ) : (
            <>
              <Typography
                sx={{
                  color: "neutral.500",
                  fontWeight: "normal",
                  fontSize: "0.65rem",
                  lineHeight: 1.1,
                }}
              >
                Registration Mode
              </Typography>
              <Typography
                sx={{
                  color: "neutral.600",
                  fontWeight: "normal",
                  fontSize: "0.85rem",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "13rem",
                }}
              >
                {valueLabel}
              </Typography>
            </>
          )}
        </Box>
      </Button>
      {open && (
        <Sheet
          variant="outlined"
          color="neutral"
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0.5,
            borderRadius: "sm",
            boxShadow: "md",
            py: 0.5,
            backgroundColor: "background.surface",
          }}
        >
          {menuOptions.map((option) => (
            <Box
              key={option.value}
              onClick={() => handleChange(option.value as IRegModes)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                px: 1.5,
                py: 0.75,
                cursor: "pointer",
                color: "text.primary",
                "&:hover": { backgroundColor: "background.level1" },
              }}
            >
              <Checkbox
                checked={regMode.findIndex((item) => item === option.value) >= 0}
                value={option.value}
                readOnly
                tabIndex={-1}
                sx={{ pointerEvents: "none", flexShrink: 0 }}
              />
              {option.name}
            </Box>
          ))}
        </Sheet>
      )}
    </Box>
  );
});

export default RegistrationModeFilter;
