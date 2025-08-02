import React from "react";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import InstanceCard from "./InstanceCard";

function InstanceGrid({ items }) {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6, columnWidth: 280 }, [items]);
  const { scrollTop, isScrolling } = useScroller(offset);

  const CardAsCallback = React.useCallback((props) => <InstanceCard instance={props.data} />, []);

  return useMasonry({
    containerRef,
    positioner,
    scrollTop,
    isScrolling,
    height,
    items,
    overscanBy: 4,
    render: CardAsCallback,
  });
}

export default React.memo(InstanceGrid);
