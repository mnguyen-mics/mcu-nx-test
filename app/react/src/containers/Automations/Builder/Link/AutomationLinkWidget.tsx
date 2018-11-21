import * as React from 'react';
import { DiagramEngine, Toolkit } from 'storm-react-diagrams';
import AutomationLinkModel from './AutomationLinkModel';
import { compose } from 'recompose';
import { DropTarget, ConnectDropTarget } from 'react-dnd';
import { AutomationLinkFactory } from '.';

export interface AutomationLinkProps {
  link: AutomationLinkModel;
  diagramEngine: DiagramEngine;
}

interface DroppedItemProps {
  connectDropTarget?: ConnectDropTarget;
  isDragging: boolean;
}

type Props = AutomationLinkProps & DroppedItemProps;

const addinTarget = {
  canDrop() {
    return false;
  },
};

class AutomationLinkWidget extends React.Component<Props> {
  refPaths: SVGPathElement[];

  constructor(props: Props) {
    super(props);
    this.refPaths = [];
  }

  generateLink(
    path: string,
    extraProps: any,
    id: string | number,
  ): JSX.Element {
    const props = this.props;

    const Bottom = React.cloneElement(
      (props.diagramEngine.getFactoryForLink(
        this.props.link,
      ) as AutomationLinkFactory).generateLinkSegment(
        this.props.link,
        this,
        false,
        path,
      ),
      {
        ref: (ref: any) => ref && this.refPaths.push(ref),
      },
    );

    const Top = React.cloneElement(Bottom, {
      ...extraProps,
      strokeLinecap: 'round',
      onMouseLeave: () => {
        this.setState({ selected: false });
      },
      onMouseEnter: () => {
        this.setState({ selected: true });
      },
      ref: null,
      'data-linkid': this.props.link.getID(),
      strokeOpacity: 0,
      strokeWidth: 20,
      onContextMenu: () => {
        if (!this.props.diagramEngine.isModelLocked(this.props.link)) {
          event!.preventDefault();
          this.props.link.remove();
        }
      },
    });

    return (
      <g key={'link-' + id}>
        {Bottom}
        {Top}
      </g>
    );
  }

  generatePoint(pointIndex: number): JSX.Element {
    const x = this.props.link.points[pointIndex].x;
    const y = this.props.link.points[pointIndex].y;
    const onMouseLeave = () => this.setState({ selected: false });
    const onMouseEnter = () => this.setState({ selected: true });
    return (
      <g key={'point-' + this.props.link.points[pointIndex].id}>
        <circle cx={x} cy={y} r={5} className={`point automation-point`} />
        <circle
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
          data-id={this.props.link.points[pointIndex].id}
          data-linkid={this.props.link.id}
          cx={x}
          cy={y}
          r={15}
          opacity={0}
          className={'point automation-point'}
        />
      </g>
    );
  }

  render() {
    const { link, isDragging, connectDropTarget } = this.props;
    const points = link.points;
    const paths: JSX.Element[] = [];

    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          Toolkit.generateLinePath(points[j], points[j + 1]),
          {
            'data-linkid': this.props.link.id,
            'data-point': j,
            onMouseDown: (event: MouseEvent) => {
              //
            },
          },
          j,
        ),
      );
    }

    // for (let i = 1; i < points.length - 1; i++) {
    //   paths.push(this.generatePoint(i));
    // }
    // if (this.props.link.targetPort === null) {
    //   paths.push(this.generatePoint(points.length - 1));
    // }

    const opacity = isDragging ? 0.3 : 1;

    return (
      connectDropTarget && connectDropTarget(<g style={{ opacity }}>{paths}</g>)
    );
  }
}

export default compose<Props, AutomationLinkProps>(
  DropTarget(
    () => {
      return 'none';
    },
    addinTarget,
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      isDragging: !!monitor.getItemType(),
    }),
  ),
)(AutomationLinkWidget);
