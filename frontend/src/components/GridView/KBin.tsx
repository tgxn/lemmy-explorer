import React from "react";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import KBinCard from "./KBinCard";

type KBinGridProps = {
  items: any[];
};

const KBinGrid = React.memo(function ({ items }: KBinGridProps) {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6, columnWidth: 280 }, [items]);

  const { scrollTop, isScrolling } = useScroller(offset);

  const CardAsCallback = React.useCallback((props) => <KBinCard magazine={props.data} />, [isScrolling]);

  return useMasonry({
    containerRef,
    positioner,
    scrollTop,
    isScrolling,
    height,
    items,
    overscanBy: 6,
    render: CardAsCallback,
  });
});
export default KBinGrid;
