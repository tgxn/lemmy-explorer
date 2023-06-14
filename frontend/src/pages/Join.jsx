import React, { useState, useEffect } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Link from "@mui/joy/Link";
import Tooltip from "@mui/joy/Tooltip";

import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

export default function Overview() {
  const navigate = useNavigate();

  const [filteredInstances, setFilteredInstances] = useState([]);

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["instanceData"],
    queryFn: () =>
      axios.get("/instances.json").then((res) => {
        return res.data;
      }),
    refetchOnWindowFocus: false,
  });

  // filter data
  useEffect(() => {
    if (!data) return;

    const filteredData = data
      .filter((instance) => {
        // open regs
        if (!instance.open) return false;

        // can create comms
        if (instance.create_admin) return false;

        // <5k users
        if (instance.usage.users.total > 5000) return false;

        // not private
        if (instance.private) return false;

        // all languages
        if (instance.langs[0] != "all") return false;

        return true;
      })
      .sort((a, b) => {
        return b.score - a.score;
      })
      .slice(0, 25); // top 25

    setFilteredInstances(filteredData);
  }, [data]);

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <Container maxWidth={"md"} sx={{}}>
      <Typography
        level="h3"
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: "center",

          p: 2,
        }}
      >
        Which instance should you join?
      </Typography>

      <Typography
        level="body1"
        sx={{
          p: 2,
        }}
      >
        <strong>Don't overthink this.</strong>
        <br />
        It doesn't matter which instance you use. You'll still be able to interact with communities
        (subreddits) on all other instances, regardless of which instance your account lives 🙂
      </Typography>

      <Typography
        level="body1"
        sx={{
          p: 2,
        }}
      >
        This is a list of top instances ranked by us, based on their activity and trust in the federation. We
        also filter this list to instances that let you create communities and allow signups.
      </Typography>

      <Typography
        level="body1"
        sx={{
          p: 2,
        }}
      >
        Choose any of these, or find another on our{" "}
        <Link component="a" variant="solid" onClick={() => navigate("/")}>
          instance list
        </Link>
        . Or if you're feeling adventurous, you can view suggestions on one of these external pages:
        <ul>
          <li>
            <Link component="a" href="https://join-lemmy.org/instances">
              join-lemmy.org Recommended Servers
            </Link>
          </li>
          <li>
            <Link component="a" href="https://github.com/maltfield/awesome-lemmy-instances">
              Awesome-Lemmy-Instances on GitHub
            </Link>
          </li>
          <li>
            <Link
              component="a"
              sx={{
                display: "inline-block",
              }}
              href="https://the-federation.info/platform/73"
            >
              the-federation.info Lemmy Instances Page
            </Link>
          </li>
        </ul>
      </Typography>

      {filteredInstances.length != 0 && (
        <Sheet
          sx={{
            borderRadius: 10,
            mb: 10,
          }}
        >
          <Table
            borderAxis="none"
            color="primary"
            size="lg"
            stickyFooter={false}
            stickyHeader={false}
            variant="soft"
            sx={{
              textAlign: "center",
              "& tr": {
                "&:nth-of-type(odd)": {
                  backgroundColor: "rgba(0,0,0,0.1)",
                },
              },
              "& th": {
                textAlign: "center",
                fontWeight: "bold",
                // p: 0,
                height: "auto",
              },
            }}
          >
            <thead>
              <tr>
                <th width="45px"></th>
                <th>Name</th>
                <th>Users</th>
                <th>Communities</th>
                <th>Downvotes</th>
                <th>Blocks</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstances.map((instance) => {
                return (
                  <tr>
                    <td>
                      <Avatar
                        variant="plain"
                        alt={instance.name}
                        src={instance.icon}
                        sx={{
                          borderRadius: 8,
                          // display: "flex",
                          // flex: "0 0 auto",
                          // marginRight: 0,
                        }}
                      />
                    </td>
                    <td>
                      <Link component="a" onClick={() => window.open(instance.url, "_blank")}>
                        {instance.name}
                      </Link>
                    </td>
                    <td>{instance.usage.users.total}</td>
                    <td>{instance.counts.communities}</td>
                    <td>
                      <Typography color={instance.downvotes ? "success" : "warning"}>
                        {instance.downvotes ? "Allowed" : "Disabled"}
                      </Typography>
                    </td>

                    <td
                      style={{
                        p: 1,
                        cursor: "default",

                        display: "inline-flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Tooltip title="This instance's blocklist" variant="soft" placement="top-start">
                        <Box
                          sx={{
                            px: 1,
                            cursor: "default",

                            display: "inline-flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <KeyboardDoubleArrowUpIcon />
                          {instance.blocks.outgoing}
                        </Box>
                      </Tooltip>
                      <Box
                        sx={{
                          px: 1,
                          cursor: "default",

                          display: "inline-flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        /
                      </Box>
                      <Tooltip title="Instances blocking this one" variant="soft" placement="top-start">
                        <Box
                          sx={{
                            // display: "inline-block",
                            px: 1,
                            cursor: "default",

                            display: "inline-flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <KeyboardDoubleArrowDownIcon /> {instance.blocks.incoming}{" "}
                        </Box>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Sheet>
      )}
    </Container>
  );
}
