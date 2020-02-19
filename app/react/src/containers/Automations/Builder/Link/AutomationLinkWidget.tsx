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
  refLabel: HTMLElement | null;

  constructor(props: Props) {
    super(props);
    this.refPaths = [];
  }

  generateLabel() {
    return this.props.link.labels.map(label => {
      return (
        <foreignObject 
          key={label.type} 
          className="link-label" 
          width='100%' 
          height='100%' 
          style={{overflow: 'visible'}}>
          <div ref={lab => (this.refLabel = lab)}>{label.type}</div>
        </foreignObject>	
      );
    });
	}

  updateLabelPosition() {
    if (this.refLabel !== null && this.refLabel !== undefined) {
      this.refLabel.setAttribute("style" , `position: relative; top: ${this.props.link.points[0].y - 20}px; left: ${this.props.link.points[0].x + 10}px;`);
    }
  }

  componentDidUpdate() {
    this.updateLabelPosition()
	}

	componentDidMount() {
   this.updateLabelPosition()
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
      
    return (
      
			<g>
        {paths}
        {this.generateLabel()}
			</g>
    );
  }
}

export default AutomationLinkWidget;
