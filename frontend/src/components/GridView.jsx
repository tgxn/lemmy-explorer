import React, { useEffect } from "react";
import { connect } from "react-redux";

import { useMasonry, usePositioner, useContainerPosition, useScroller } from "masonic";

import { useWindowSize } from "@react-hook/window-size";

import InstanceCard from "../components/InstanceCard";
import CommunityCard from "../components/CommunityCard";

export const InstanceGrid = connect(mapStateToProps)(function ({ items }) {
  const containerRef = React.useRef(null);

  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [windowWidth, height]);

  const positioner = usePositioner({ width, columnGutter: 16, maxColumnCount: 6 }, [items]);
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
    overscanBy: 2,
    render: CardWithIsScrolling,
  });
});

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});

export const CommunityGrid = connect(mapStateToProps)(function ({ items, homeBaseUrl }) {
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
});

// export const CommunityGrid = CommunityGrid);
