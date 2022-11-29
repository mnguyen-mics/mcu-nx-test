import { Timeline } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import * as React from 'react';
import FoldableCard, { FoldableCardProps } from './FoldableCard';

export interface FoldableCardHierarchyResource {
  foldableCard: FoldableCardProps;
  children: FoldableCardHierarchyResource[];
}

export interface FoldableCardHierarchyProps {
  hierachy?: FoldableCardHierarchyResource;
  className?: string;
  cardClassName?: string;
}

export default class FoldableCardHierarchy extends React.Component<FoldableCardHierarchyProps> {
  recusiveBuildFoldableCardHierachy = (
    currentNode: FoldableCardHierarchyResource,
  ): React.ReactNode => {
    const nbChildren = currentNode.children.length;

    const childrenNodes = currentNode.children.map(
      (childNode: FoldableCardHierarchyResource, i) => {
        return (
          <Timeline.Item
            key={`mcs-foldable-card-timelineItem-${i}`}
            className={
              'mcs-foldable-card-timeline' +
              (i === nbChildren - 1 ? ' mcs-foldable-card-timeline-last' : '')
            }
            dot={
              <div className='mcs-foldable-card-timeline-dash-container'>
                <hr className='mcs-foldable-card-timeline-dash' />
              </div>
            }
          >
            <div className='mcs-foldable-card-children-container'>
              {this.recusiveBuildFoldableCardHierachy(childNode)}
            </div>
          </Timeline.Item>
        );
      },
    );
    return (
      <Timeline className='mcs-foldableCardHierachy_container'>
        <FoldableCard {...currentNode.foldableCard} />
        <div className='mcs-foldable-card-children-container-first'>{childrenNodes}</div>
      </Timeline>
    );
  };

  render() {
    const { hierachy } = this.props;

    return (
      <Content>{hierachy ? this.recusiveBuildFoldableCardHierachy(hierachy) : <div />}</Content>
    );
  }
}
