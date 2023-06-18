import React, { useEffect } from "react";
import { connect } from "react-redux";

import useWindowScroll from "@react-hook/window-scroll";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import CommunityCard from "../components/CommunityCard";

const CommunityGrid = function ({ items, homeBaseUrl }) {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6 }, [items]);
  const { scrollTop, isScrolling } = useScroller(offset);

  const CardWithIsScrolling = React.useCallback(
    (props) => <CommunityCard community={props.data} homeBaseUrl={homeBaseUrl} />,
    [isScrolling],
  );

  console.log("CommunityGrid useMasonry", items);

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
// export default CommunityGrid;

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(CommunityGrid);
