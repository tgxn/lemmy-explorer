import React from "react";
import { connect } from "react-redux";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import CommunityCard from "./CommunityCard";

const CommunityGrid = function ({ items, homeBaseUrl }) {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6 }, [items]);
  const { scrollTop, isScrolling } = useScroller(offset);

  const CardWithIsScrolling = React.useCallback(
    (props) => <CommunityCard community={props.data} homeBaseUrl={homeBaseUrl} />,
    [isScrolling, homeBaseUrl],
  );

  return useMasonry({
    containerRef,
    positioner,
    scrollTop,
    isScrolling,
    height,
    items,
    overscanBy: 2,
    render: CardWithIsScrolling,
  });
};
export default CommunityGrid;
