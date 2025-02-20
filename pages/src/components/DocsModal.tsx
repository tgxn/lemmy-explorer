import React, { useEffect } from "react";

import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog, { ModalDialogProps } from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";

import { IFileMeta } from "../types";

import Markdown from "react-markdown";

export default function DocsModal({
  isOpen,
  setOpen,
  docsFile,
}: {
  isOpen: boolean;
  setOpen: any;
  docsFile: IFileMeta | null; // "instance-full" | "instance-min" | "community-full" | "mbin-min" | "magazines-full";
}) {
  if (!docsFile) return null;

  // load file from `docsFile.path.md` and render it

  const [loadedFile, setLoadedFile] = React.useState<string | null>(null);

  useEffect(() => {
    setLoadedFile(null);
    const loadFile = async () => {
      const response = await import(`../../docs/${docsFile.path}.md`);

      const content = await fetch(response.default).then((res) => res.text());

      setLoadedFile(content);
    };
    loadFile();
  }, [docsFile]);

  return (
    <Modal open={isOpen} onClose={() => setOpen(false)}>
      <ModalDialog layout={"fullscreen"}>
        <Box sx={{ p: 2, pb: 0 }}>
          <ModalClose />
          <Typography id="dialog-vertical-scroll-title" component="h2">
            {docsFile.name}
          </Typography>
        </Box>

        <Box sx={{ p: 2, pt: 0 }}>{loadedFile && <Markdown>{loadedFile}</Markdown>}</Box>
      </ModalDialog>
    </Modal>
  );
}
