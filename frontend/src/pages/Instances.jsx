import React from "react";

import useQueryCache from "../hooks/useQueryCache";
import { useDebounce } from "@uidotdev/usehooks";
import useStorage from "../hooks/useStorage";

import Container from "@mui/joy/Container";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";

import ButtonGroup from "@mui/joy/ButtonGroup";
import IconButton from "@mui/joy/IconButton";

import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import ViewListIcon from "@mui/icons-material/ViewList";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";

import LanguageFilter from "../components/LanguageFilter";
import { PageLoading, PageError, SimpleNumberFormat } from "../components/Display";
import { InstanceGrid } from "../components/GridView";
import { InstanceList } from "../components/ListView";

export default function Instances() {
  const { isLoading, isSuccess, isError, error, data } = useQueryCache("instanceData", "/instances.json");

  const [viewType, setViewType] = useStorage("instance.viewType", "grid");

  const [orderBy, setOrderBy] = useStorage("instance.orderBy", "smart");
  const [showOpenOnly, setShowOpenOnly] = useStorage("instance.showOpenOnly", false);

  // debounce the filter text input
  const [filterText, setFilterText] = useStorage("instance.filterText", "");
  const debounceFilterText = useDebounce(filterText, 500);

  const [filterLangCodes, setFilterLangCodes] = useStorage("instance.filterLangCodes", []);

  // this applies the filtering and sorting to the data loaded from .json
  const instancesData = React.useMemo(() => {
    if (!data) return [];
    if (error) return [];

    let instances = data;
    if (showOpenOnly) {
      instances = instances.filter((instance) => instance.open);
    }

    if (debounceFilterText) {
      instances = instances.filter((instance) => {
        if (instance.name && instance.name.toLowerCase().includes(debounceFilterText.toLowerCase()))
          return true;
        if (instance.desc && instance.desc.toLowerCase().includes(debounceFilterText.toLowerCase()))
          return true;
        if (instance.url && instance.url.toLowerCase().includes(debounceFilterText.toLowerCase()))
          return true;
        return false;
      });
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
  }, [data, orderBy, showOpenOnly, debounceFilterText, filterLangCodes]);

  return (
    <Container maxWidth={false} sx={{}}>
      <Box
        component="header"
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Filter Instances"
          value={filterText}
          sx={{
            width: { xs: "100%", sm: 240 },
            flexShrink: 0,
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
            <Chip
              sx={{
                borderRadius: "4px",
                mr: 1,
              }}
              color="info"
            >
              Instances:{" "}
              <SimpleNumberFormat
                value={instancesData.length}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={","}
              />
            </Chip>
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
              variant={viewType == "grid" ? "soft" : "plain"}
              onClick={() => setViewType("grid")}
              sx={{
                p: 1,
              }}
            >
              <ViewCompactIcon /> Grid View
            </IconButton>
            <IconButton
              variant={viewType == "list" ? "soft" : "plain"}
              onClick={() => setViewType("list")}
              sx={{
                p: 1,
              }}
            >
              <ViewListIcon /> List View
            </IconButton>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ my: 4 }}>
        {isLoading && !isError && <PageLoading />}
        {isError && <PageError error={error} />}
        {isSuccess && viewType == "grid" && <InstanceGrid items={instancesData} />}
        {isSuccess && viewType == "list" && <InstanceList items={instancesData} />}
      </Box>
    </Container>
  );
}
