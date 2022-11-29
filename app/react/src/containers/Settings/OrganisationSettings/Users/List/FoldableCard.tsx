import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import * as React from 'react';

const { Panel } = Collapse;

export interface FoldableCardProps {
  className?: string;
  organisationId?: string;
  isDefaultActive: boolean;
  header: React.ReactNode;
  body: React.ReactNode;
  noDataCard: boolean;
}

export default class FoldableCard extends React.Component<FoldableCardProps> {
  render() {
    const { className, header, body, isDefaultActive, organisationId, noDataCard } = this.props;

    const expandIcon = (props: any) =>
      props.isActive ? <MinusCircleOutlined /> : <PlusCircleOutlined />;

    return (
      <Content id={`mcs-foldable-card-${organisationId}`}>
        <Collapse
          ghost={true}
          defaultActiveKey={isDefaultActive ? '1' : []}
          expandIcon={expandIcon}
          className={`mcs-foldable-card ${className ? className : ''}`}
        >
          <Panel
            className={noDataCard ? 'mcs-foldable-card-no-data' : 'mcs-foldable-card-with-data'}
            header={header}
            key='1'
          >
            {body}
          </Panel>
        </Collapse>
      </Content>
    );
  }
}
