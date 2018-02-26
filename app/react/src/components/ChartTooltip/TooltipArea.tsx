import * as React from 'react';
import {Point} from 'plottable';
import ChartTooltip from './ChartTooltip';

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface TooltipAreaProps {
  bounds: Bounds;
  mousePos: Point;
  visible: boolean;
}

function computePosition(bounds: Bounds, mousePosition: Point) {
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const xTooltip = mousePosition.x + 320 < width
    ? (bounds.left + mousePosition.x) + 80
    : (bounds.left + mousePosition.x) - 200;
  const yTooltip = mousePosition.y + 120 < height
    ? bounds.top + mousePosition.y
    : (bounds.top + mousePosition.y) - 50;
  return {
    x: xTooltip,
    y: yTooltip,
  };
}

const TooltipArea: React.SFC<TooltipAreaProps> = ({ bounds, mousePos, visible, children }) => {

  const position = computePosition(bounds, mousePos);
  const tooltipStyle = {
    xTooltip: position.x,
    yTooltip: position.y,
    visibility: visible ? 'visible' : 'hidden',
  };

  return (
    <ChartTooltip tooltipStyle={tooltipStyle} children={children} />
  );

};

export default TooltipArea;
