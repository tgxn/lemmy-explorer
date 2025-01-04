import React, { useState, useEffect, forwardRef } from "react";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";
import Divider from "@mui/joy/Divider";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Checkbox from "@mui/joy/Checkbox";

import { ColorPaletteProp } from "@mui/joy/styles/types/colorSystem";

import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

import useStorage from "../../hooks/useStorage";

type ICongirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  buttonMessage: string;
  color?: ColorPaletteProp;

  extraElements?: any[];

  disabled?: boolean;

  loading?: boolean;
  error?: any;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  buttonMessage,
  color = "danger",

  extraElements = [],

  disabled = false,

  loading,
  error,
  onConfirm,
  onCancel,
}: ICongirmDialogProps) => {
  return (
    <Modal open={open} onClose={() => onCancel()}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        aria-labelledby="alert-dialog-modal-title"
        aria-describedby="alert-dialog-modal-description"
      >
        <Typography id="alert-dialog-modal-title" component="h2" startDecorator={<WarningRoundedIcon />}>
          {title}
        </Typography>
        <Divider />
        <Typography id="alert-dialog-modal-description" textColor="text.tertiary">
          {message}
        </Typography>

        {extraElements.length > 0 && extraElements}

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", pt: 2 }}>
          <Button
            variant="plain"
            color="neutral"
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            color={color}
            loading={loading}
            disabled={loading || disabled}
            onClick={() => {
              onConfirm();
            }}
          >
            {buttonMessage}
          </Button>
        </Box>
        {error && (
          <Typography
            component="div"
            sx={{
              textAlign: "right",
              mt: 1,
              color: "#ff0000",
            }}
          >
            {typeof error === "string" ? error : error.message}
          </Typography>
        )}
      </ModalDialog>
    </Modal>
  );
};

const TriStateCheckbox = ({ checked, onChange }) => {
  // local checked state
  const [localChecked, setLocalChecked] = useState(checked ?? null);
  useEffect(() => setLocalChecked(checked ?? null), [checked]);

  // Variable "ShowNSFW" is used to drive this
  //  Default:    Hide NSFW     false
  //  One Click:  Include NSFW  null
  //  Two Clicks: NSFW Only     true

  // when a user tries to switch to anon-sfw state, a popup will appear to confirm
  // there will be a checkbox in the popup to remember the user's choice in local storage

  const [confirmShowNSFW, setConfirmShowNSFW] = useState(false);
  const [saveAcceptedShowNsfw, setSaveAcceptedShowNsfw] = useStorage("config.acceptedShowNsfw", false);

  const handleChange = () => {
    // if we would be starting to show nsfw content
    if ((localChecked === false || localChecked === null) && !saveAcceptedShowNsfw) {
      setConfirmShowNSFW(true);
      return;
    }
    toggleSetting();
  };

  const toggleSetting = () => {
    switch (localChecked) {
      case false:
        setLocalChecked(null);
        onChange(null);
        break;
      case null:
        setLocalChecked(true);
        onChange(true);
        break;
      case true:
        setLocalChecked(false);
        onChange(false);
        break;
    }
  };

  // hidden
  let label = "NSFW: Hidden";
  let tooltip = "Click to Include NSFW";

  let confirmVerb = "Include";

  // only nsfw
  if (localChecked === true) {
    label = "NSFW: Only Show NSFW";
    tooltip = "Click to Hide NSFW";
  }

  // included
  else if (localChecked === null) {
    label = "NSFW: Included";
    tooltip = "Click to only show NSFW";

    confirmVerb = "Only show";
  }

  return (
    <>
      <Tooltip title={tooltip} placement="top">
        <Checkbox
          label={label}
          color={localChecked == null ? "warning" : localChecked == true ? "danger" : "neutral"}
          checked={!!localChecked}
          indeterminate={localChecked === null}
          onChange={handleChange}
        />
      </Tooltip>

      <ConfirmDialog
        key="save-confirm"
        open={confirmShowNSFW}
        title={`${confirmVerb} NSFW Content?`}
        message={`Are you sure you want to ${confirmVerb.toLowerCase()} NSFW content?`}
        buttonMessage={"Yes, I am over 18"}
        extraElements={[
          <Checkbox
            key="remember-save-confirm"
            label={"Remember my choice"}
            color={"neutral"}
            checked={saveAcceptedShowNsfw}
            onChange={() => setSaveAcceptedShowNsfw(!saveAcceptedShowNsfw)}
          />,
        ]}
        onConfirm={() => {
          toggleSetting(); // change the setting
          setConfirmShowNSFW(false); // close the dialog
        }}
        onCancel={() => {
          setConfirmShowNSFW(false);
        }}
      />
    </>
  );
};

export default forwardRef(TriStateCheckbox);
