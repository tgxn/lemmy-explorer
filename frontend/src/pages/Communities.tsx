import React, { useState, useEffect } from "react";

import Container from "@mui/joy/Container";

import CommunityList from "../components/Communities";

export default function Communities() {
  return (
    <Container
      maxWidth={false}
      style={{
        paddingRight: "16px",
        paddingLeft: "16px",
      }}
    >
      <CommunityList />
    </Container>
  );
}
