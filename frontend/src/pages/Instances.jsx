import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { useSearchParams } from "react-router-dom";
import useCachedMultipart from "../hooks/useCachedMultipart";

import { useDebounce } from "@uidotdev/usehooks";
import useStorage from "../hooks/useStorage";

import Container from "@mui/joy/Container";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";
import Typography from "@mui/joy/Typography";

import ButtonGroup from "@mui/joy/ButtonGroup";
import IconButton from "@mui/joy/IconButton";

import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewListIcon from "@mui/icons-material/ViewList";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";

import LanguageFilter from "../components/Shared/LanguageFilter";
import { LinearValueLoader, PageError, SimpleNumberFormat } from "../components/Shared/Display";

import InstanceGrid from "../components/GridView/Instance";
import InstanceList from "../components/ListView/Instance";

function Instances({ filterSuspicious }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { isLoading, loadingPercent, isSuccess, isError, error, data } = useCachedMultipart(
    "instanceData",
    "instance",
  );

  const [viewType, setViewType] = useStorage("instance.viewType", "grid");

  const [orderBy, setOrderBy] = useStorage("instance.orderBy", "smart");
  const [showOpenOnly, setShowOpenOnly] = useStorage("instance.showOpenOnly", false);

  // debounce the filter text input
  const [filterText, setFilterText] = useStorage("instance.filterText", "");
  const debounceFilterText = useDebounce(filterText, 500);

  const [filterLangCodes, setFilterLangCodes] = useStorage("instance.filterLangCodes", []);

  // load query params
  useEffect(() => {
    if (searchParams.has("query")) setFilterText(searchParams.get("query"));
    if (searchParams.has("order")) setOrderBy(searchParams.get("order"));
    if (searchParams.has("open")) setShowOpenOnly(searchParams.get("open"));
  }, []);

  // update query params
  // @TODO this should not happen on page load?
  useEffect(() => {
    const parms = {};

    if (filterText) parms.query = filterText;
    if (orderBy != "smart") parms.order = orderBy;
    if (showOpenOnly) parms.open = showOpenOnly;

    console.log(`Updating query params: ${JSON.stringify(parms)}`);
    setSearchParams(parms);
  }, [showOpenOnly, orderBy, debounceFilterText]);

  // this applies the filtering and sorting to the data loaded from .json
  const instancesData = React.useMemo(() => {
    if (!data) return [];
    if (error) return [];

    let instances = data;
    if (showOpenOnly) {
      instances = instances.filter((instance) => instance.open);
    }

    // hide sus instances by default
    if (filterSuspicious) {
      instances = instances.filter((instance) => !instance.isSuspicious);
    }

    if (debounceFilterText) {
      console.log(`Filtering instances by ${debounceFilterText}`);

      // split the value on spaces, look for values starting with "-"
      // if found, remove the "-" and add to the exclude list
      // if not found, apend to the search query
      let exclude = [];
      let include = [];

      let searchTerms = debounceFilterText.toLowerCase().split(" ");
      searchTerms.forEach((term) => {
        if (term.startsWith("-") && term.substring(1) !== "") {
          exclude.push(term.substring(1));
        } else if (term !== "") {
          include.push(term);
        }
      });
      console.log(`Include: ${include.join(", ")}`);
      console.log(`Exclude: ${exclude.join(", ")}`);

      // search for any included terms
      if (include.length > 0) {
        console.log(`Searching for ${include.length} terms`);
        include.forEach((term) => {
          instances = instances.filter((instance) => {
            return (
              (instance.name && instance.name.toLowerCase().includes(term)) ||
              (instance.title && instance.title.toLowerCase().includes(term)) ||
              (instance.baseurl && instance.baseurl.toLowerCase().includes(term)) ||
              (instance.desc && instance.desc.toLowerCase().includes(term))
            );
          });
        });
      }

      // search for any excluded terms
      if (exclude.length > 0) {
        console.log(`Excluding ${exclude.length} terms`);
        exclude.forEach((term) => {
          instances = instances.filter((instance) => {
            return !(
              (instance.name && instance.name.toLowerCase().includes(term)) ||
              (instance.baseurl && instance.baseurl.toLowerCase().includes(term)) ||
              (instance.title && instance.title.toLowerCase().includes(term)) ||
              (instance.desc && instance.desc.toLowerCase().includes(term))
            );
          });
        });
      }
    }

    // filter lang codes
    if (filterLangCodes.length > 0) {
      console.log(`Filtering instances by ${filterLangCodes}`);

      // filterLangCodes is [{code: "en"}, {code: "fr"}]
      // community.langs is ["en", "de"]
      instances = instances.filter((instance) => {
        const instanceLangs = instance.langs || [];
        const onlyShowLangs = filterLangCodes.map((lang) => lang.code);

        // if every of the filterLangCodes are specifically in the instanceLangCodes, return true
        return onlyShowLangs.every((lang) => instanceLangs.includes(lang)); // could add || instanceLangs[0] == "all" to show sites that have ever language enabled
      });
    }

    if (orderBy === "smart") {
      instances = instances.sort((a, b) => b.score - a.score);
    } else if (orderBy === "users") {
      instances = instances.sort((a, b) => b.usage.users.total - a.usage.users.total);
    } else if (orderBy === "active") {
      instances = instances.sort((a, b) => b.usage.users.activeMonth - a.usage.users.activeMonth);
    } else if (orderBy === "posts") {
      instances = instances.sort((a, b) => b.usage.localPosts - a.usage.localPosts);
    } else if (orderBy === "comments") {
      instances = instances.sort((a, b) => b.usage.localComments - a.usage.localComments);
    } else if (orderBy === "oldest") {
      instances = instances.sort((a, b) => {
        // timestamps are like 2023-06-14 02:30:32
        // we need to sort the array by the oldest uptime date
        // if there's no date on the record, it should go to the bottom of the list
        if (!a.uptime) return 1;
        if (!b.uptime) return -1;

        const aDate = new Date(a.uptime.date_created);
        const bDate = new Date(b.uptime.date_created);

        if (aDate < bDate) return -1;
        if (aDate > bDate) return 1;
        return 0;
      });
    }

    // return a clone so that it triggers a re-render  on sort
    return [...instances];
  }, [data, orderBy, showOpenOnly, debounceFilterText, filterLangCodes, filterSuspicious]);

  return (
    <Container
      maxWidth={false}
      style={{
        paddingRight: "16px",
        paddingLeft: "16px",
      }}
    >
      <Box
        component="header"
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Filter Instances"
          value={filterText}
          sx={{
            width: { xs: "100%", sm: 285 },
            flexShrink: 0,
            //position at flex start
          }}
          onChange={(event) => setFilterText(event.target.value)}
        />

        <Select
          placeholder="Order By"
          startDecorator={<SortIcon />}
          indicator={<KeyboardArrowDown />}
          value={orderBy}
          onChange={(event, newValue) => {
            setOrderBy(newValue);
          }}
          sx={{
            minWidth: 120,
            width: { xs: "100%", sm: 240 },
            flexShrink: 0,
            [`& .${selectClasses.indicator}`]: {
              transition: "0.2s",
              [`&.${selectClasses.expanded}`]: {
                transform: "rotate(-180deg)",
              },
            },
          }}
        >
          <Option value="smart">Smart Sort</Option>
          <Option value="users">Users</Option>
          <Option value="active">Active Users</Option>
          <Option value="posts">Posts</Option>
          <Option value="comments">Comments</Option>
          <Option value="oldest">Oldest</Option>
        </Select>

        <LanguageFilter
          languageCodes={filterLangCodes}
          setLanguageCodes={(codes) => setFilterLangCodes(codes)}
        />

        <Box sx={{ display: "flex", gap: 3 }}>
          <Checkbox
            label="Open Only"
            checked={showOpenOnly}
            onChange={(event) => setShowOpenOnly(event.target.checked)}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            justifyContent: { xs: "center", sm: "flex-end" },
            alignItems: "center",
          }}
        >
          {isSuccess && (
            <Typography
              level="body2"
              sx={{
                borderRadius: "4px",
                mr: 2,
              }}
            >
              showing{" "}
              <SimpleNumberFormat
                value={instancesData.length}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={","}
              />{" "}
              instances
            </Typography>
          )}

          <ButtonGroup
            sx={{
              "--ButtonGroup-radius": "3px",
              "--ButtonGroup-separatorSize": "0px",
              "--ButtonGroup-connected": "0",
              "--joy-palette-neutral-plainHoverBg": "transparent",
              "--joy-palette-neutral-plainActiveBg": "transparent",
              "&:hover": {
                boxShadow: "inset 0px 0px 0px 1px var(--joy-palette-neutral-softBg)",
                "--ButtonGroup-connected": "1",
              },
            }}
          >
            <IconButton
              variant={viewType == "grid" ? "solid" : "soft"}
              color={viewType == "grid" ? "info" : "neutral"}
              onClick={() => setViewType("grid")}
              sx={{
                p: 1,
                borderRadius: "8px 0 0 8px",
              }}
            >
              <ViewCompactIcon /> Grid View
            </IconButton>
            <IconButton
              variant={viewType == "list" ? "solid" : "soft"}
              color={viewType == "list" ? "info" : "neutral"}
              onClick={() => setViewType("list")}
              sx={{
                p: 1,
                borderRadius: "0 8px 8px 0",
              }}
            >
              <ViewListIcon /> List View
            </IconButton>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        {isLoading && !isError && <LinearValueLoader progress={loadingPercent} />}
        {isError && <PageError error={error} />}
        {isSuccess && viewType == "grid" && <InstanceGrid items={instancesData} />}
        {isSuccess && viewType == "list" && <InstanceList items={instancesData} />}
      </Box>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  filterSuspicious: state.configReducer.filterSuspicious,
});
export default connect(mapStateToProps)(Instances);
