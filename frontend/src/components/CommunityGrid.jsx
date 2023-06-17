import React from "react";

import useWindowScroll from "@react-hook/window-scroll";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import CommunityCard from "../components/CommunityCard";

const CommunityGrid = ({ items }) => {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6 });
  const { scrollTop, isScrolling } = useScroller(offset);

  // const CardWithIsScrolling = React.useCallback(
  //   (props) => <CommunityCard isScrolling={isScrolling} {...props} />,
  //   [isScrolling],
  // );

  return useMasonry({
    positioner,
    scrollTop,
    isScrolling,
    height,
    containerRef,
    items: items,
    overscanBy: 2,
    render: (props) => <CommunityCard community={props.data} />,
  });
};
export default CommunityGrid;
