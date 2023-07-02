import React from "react";
import { connect } from "react-redux";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import InstanceCard from "./InstanceCard";

const InstanceGrid = function ({ items }) {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6, columnWidth: 280 }, [items]);
  const { scrollTop, isScrolling } = useScroller(offset);

  const CardWithIsScrolling = React.useCallback(
    (props) => <InstanceCard instance={props.data} />,
    [isScrolling],
  );

  return useMasonry({
    containerRef,
    positioner,
    scrollTop,
    isScrolling,
    height,
    items,
    overscanBy: 4,
    render: CardWithIsScrolling,
  });
};
export default InstanceGrid;
