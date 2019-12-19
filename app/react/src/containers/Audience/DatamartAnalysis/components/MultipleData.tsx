import * as React from 'react';
import { Tabs } from 'antd';
import CardFlex from '../../Dashboard/Components/CardFlex';
// import GenericStackedBar from './charts/GenericStackedBar';


class MultipleData extends React.Component {
  render() {
    return (
      <CardFlex>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Traffic Channel" key="1">
            {/* <GenericStackedBar dataset={[]} height={400} /> */}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Source / Medium" key="2">
            Chart 2 </Tabs.TabPane>
          <Tabs.TabPane tab="Referrals" key="3">
            Chart 3 </Tabs.TabPane>
        </Tabs>
      </CardFlex>
    );
  }
}

export default MultipleData;