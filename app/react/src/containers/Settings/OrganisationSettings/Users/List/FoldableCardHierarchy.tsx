import { Timeline } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import * as React from 'react';
import FoldableCard, { FoldableCardProps } from './FoldableCard';

export interface FoldableCardHierarchyResource {
  foldableCard: FoldableCardProps;
  children?: FoldableCardHierarchyResource[];
}

export interface FoldableCardHierarchyProps {
  hierachy?: FoldableCardHierarchyResource;
  className?: string;
  cardClassName?: string;
}

export default class FoldableCardHierarchy extends React.Component<FoldableCardHierarchyProps> {
  buildFoldableCardHierachy() {
    const recusiveBuildFoldableCardHierachy = (
      currentNode: FoldableCardHierarchyResource,
    ): React.ReactNode => {
      const childrenNodes = [];

      if (currentNode.children) {
        for (let index = 0; index < currentNode.children.length; index++) {
          childrenNodes.push(
            <Timeline.Item
              key={`mcs-foldable-card-timelineItem-${index}`}
              className={
                'mcs-foldable-card-timeline' +
                (index === currentNode.children.length - 1
                  ? ' mcs-foldable-card-timeline-last'
                  : '')
              }
              dot={
                <div className='mcs-foldable-card-timeline-dash-container'>
                  <hr className='mcs-foldable-card-timeline-dash' />
                </div>
              }
            >
              <div className='mcs-foldable-card-children-container'>
                {recusiveBuildFoldableCardHierachy(currentNode.children[index])}
              </div>
            </Timeline.Item>,
          );
        }
      }

      return (
        <div className='mcs-foldableCardHierachy_container'>
          <FoldableCard {...currentNode.foldableCard} />
          <div className='mcs-foldable-card-children-container-first'>{childrenNodes}</div>
        </div>
      );
    };

    const { hierachy } = this.props;

    return hierachy ? recusiveBuildFoldableCardHierachy(hierachy) : <div />;
  }

  render() {
    return <Content>{this.buildFoldableCardHierachy()}</Content>;
  }
}
