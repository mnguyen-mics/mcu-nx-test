import * as React from 'react';
import { Row, Col } from 'antd';
import ImportsContentContainer from '../../../../Imports/List/ImportsContentContainer';

export interface DatamartConfigTabProps {
  datamartId: string;
}
export default class DatamartConfigTab extends React.Component<
  DatamartConfigTabProps
> {
  constructor(props: DatamartConfigTabProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { datamartId } = this.props;

    return (
      <div>
        <Row className="ant-layout">
          <Col className="mcs-content-container ant-layout-content">
            <ImportsContentContainer
              datamartId={datamartId}
              noFilterDatamart={true}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
