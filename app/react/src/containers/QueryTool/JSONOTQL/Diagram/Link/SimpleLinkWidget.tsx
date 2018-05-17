import * as React from 'react';
import { DiagramEngine, PointModel } from 'storm-react-diagrams';
import SimpleLinkModel from './SimpleLinkModel';
import { CustomNodeShape } from '../../domain';

export interface SimpleLinkProps {
  link: SimpleLinkModel;
  diagramEngine: DiagramEngine;
}

export default class SimpleLinkWidget extends React.Component<SimpleLinkProps> {
  generateLink(extraProps: any, id: string | number): JSX.Element {
    const Bottom = (
      <path
        strokeWidth="2"
        stroke={`url(#${this.props.link.getID()})`}
        {...extraProps}
      />
    );

    return <g key={'link-' + id}>{Bottom}</g>;
  }

  render() {
    // ensure id is present for all points on the path
    const { link } = this.props;
    const points = link.points;
    const paths: JSX.Element[] = [];

    const sourcePortParent = link
      .getSourcePort()
      .getParent() as CustomNodeShape;
    const targetPortParent = link
      .getTargetPort()
      .getParent() as CustomNodeShape;

    const drawLink = !targetPortParent.extras.collapsed;
    if (points.length === 2 && drawLink) {
      let pointLeft = points[0];
      let pointRight = points[1];

      if (pointLeft.x > pointRight.x) {
        pointLeft = points[1];
        pointRight = points[0];
      }

      paths.push(
        <defs key={this.props.link.getID()}>
          <linearGradient
            id={this.props.link.getID()}
            x1={pointLeft.x}
            y1={pointLeft.y}
            x2={pointRight.x}
            y2={pointRight.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={sourcePortParent.getColor()} offset="0" />
            <stop stopColor={targetPortParent.getColor()} offset="1" />
          </linearGradient>
        </defs>,
      );

      paths.push(
        this.generateLink(
          {
            d: generateLinePath(pointLeft, pointRight),
          },
          '0',
        ),
      );
    }

    return <g>{paths}</g>;
  }
}

function generateLinePath(
  firstPoint: PointModel,
  lastPoint: PointModel,
): string {
  return `M${firstPoint.x} ${firstPoint.y} L${lastPoint.x} ${lastPoint.y}`;
}
