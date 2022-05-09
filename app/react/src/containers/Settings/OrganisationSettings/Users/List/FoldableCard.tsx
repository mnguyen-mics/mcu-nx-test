import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import * as React from 'react';

const { Panel } = Collapse;

export interface FoldableCardProps {
  className?: string;
  isDefaultActive: boolean;
  header: React.ReactNode;
  body: React.ReactNode;
}

export default class FoldableCard extends React.Component<FoldableCardProps> {
  render() {
    const { className, header, body, isDefaultActive } = this.props;

    const expendIcon = (props: any) =>
      props.isActive ? <MinusCircleOutlined /> : <PlusCircleOutlined />;

    return (
      <Content>
        <Collapse
          ghost={true}
          defaultActiveKey={isDefaultActive ? '1' : []}
          expandIcon={expendIcon}
          className={`mcs-foldable-card ${className ? className : ''}`}
        >
          <Panel className='mcs-foldable-card' header={header} key='1'>
            {body}
          </Panel>
        </Collapse>
      </Content>
    );
  }
}
