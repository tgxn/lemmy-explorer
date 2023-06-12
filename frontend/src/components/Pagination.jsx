import React from "react";

import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";

export default function Pagination({ setPage, page, count, limit }) {
  const pages = Math.ceil(count / limit);

  console.log(page, pages);

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
        Total: {count}
      </Chip>

      <Chip
        sx={{
          borderRadius: "4px",
          mr: 1,
        }}
        color="neutral"
      >
        {page * limit} - {page * limit + limit} / {count}
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

      {/* {Array(pages).map((page, idk) => (
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
      {page != pages - 1 && (
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
