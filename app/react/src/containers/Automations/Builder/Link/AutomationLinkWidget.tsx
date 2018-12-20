import * as React from 'react';
import { DiagramEngine, Toolkit } from 'storm-react-diagrams';
import AutomationLinkModel from './AutomationLinkModel';
import { AutomationLinkFactory } from '.';

export interface AutomationLinkProps {
  link: AutomationLinkModel;
  diagramEngine: DiagramEngine;
}

type Props = AutomationLinkProps;

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

  render() {
    const { link } = this.props;
    const points = link.points;
    const paths: JSX.Element[] = [];

    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          Toolkit.generateLinePath(points[j], points[j + 1]),
          {
            'data-linkid': this.props.link.id,
            'data-point': j,
          },
          j,
        ),
      );
    }

    return <g>{paths}</g>;
  }
}

export default AutomationLinkWidget;
