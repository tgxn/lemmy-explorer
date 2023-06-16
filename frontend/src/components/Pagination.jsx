import React from "react";

import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";

import { SimpleNumberFormat } from "../components/Display";

export default function Pagination({ setPage, page, count, limit }) {
  const [totalPages, setTotalPages] = React.useState(0);

  React.useEffect(() => {
    const totalPages = Math.ceil(count / limit);

    setTotalPages(totalPages);
  }, [count, limit]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 2,
      }}
    >
      <Chip
        sx={{
          borderRadius: "4px",
          mr: 1,
        }}
        color="info"
      >
        Total: <SimpleNumberFormat value={count} />
      </Chip>

      <Chip
        sx={{
          borderRadius: "4px",
          mr: 1,
        }}
        color="neutral"
      >
        {page * limit} - {page * limit + limit < count ? page * limit + limit : count} / {count}
      </Chip>
      {page != 0 && (
        <Chip
          sx={{
            borderRadius: "4px",
            mr: 1,
          }}
          onClick={() => {
            setPage(page - 1);
          }}
        >
          Previous
        </Chip>
      )}

      {/* {Array(totalPages).map((page, idk) => (
        <Chip
          sx={{
            borderRadius: "4px",
            mx: 1,
          }}
          onClick={() => {
            setPage(idk);
          }}
        >
          {idk + 1}
        </Chip>
      ))} */}
      {page != totalPages - 1 && (
        <Chip
          sx={{
            borderRadius: "4px",
          }}
          onClick={() => {
            setPage(page + 1);
          }}
        >
          Next
        </Chip>
      )}
      {/* <Chip slotProps={{ action: { component: "a", href: "" } }}>Anchor chip</Chip>
      <Chip slotProps={{ action: { component: "a", href: "" } }}>Anchor chip</Chip> */}
    </Box>
  );
}
