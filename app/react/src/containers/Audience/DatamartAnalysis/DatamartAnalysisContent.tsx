import * as React from 'react';
import SessionsByCountry from './components/SessionsByCountry';
import { Row, Col } from 'antd';


export default class DatamartAnalysisContent extends React.Component {
  render() {
    return (
      <Row gutter={16}>
        <Col span={12}>
          <SessionsByCountry />
          </Col>
        <Col span={12}>col-12</Col>
      </Row>

    );
  }
}
