import React from "react";

import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";

export default function InstanceModal({ isOpen, setOpen, instanceDat }) {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={isOpen}
      onClose={() => setOpen(false)}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          maxWidth: 500,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
        }}
      >
        <ModalClose
          variant="outlined"
          sx={{
            top: "calc(-1/4 * var(--IconButton-size))",
            right: "calc(-1/4 * var(--IconButton-size))",
            boxShadow: "0 2px 12px 0 rgba(0 0 0 / 0.2)",
            borderRadius: "50%",
            bgcolor: "background.body",
          }}
        />
        <Typography component="h2" id="modal-title" level="h4" textColor="inherit" fontWeight="lg" mb={1}>
          This is the modal title
        </Typography>
        <Typography id="modal-desc" textColor="text.tertiary">
          Make sure to use <code>aria-labelledby</code> on the modal dialog with an optional{" "}
          <code>aria-describedby</code> attribute.
        </Typography>
      </Sheet>
    </Modal>
  );
}
