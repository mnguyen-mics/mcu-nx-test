import React, { Component, PropTypes } from 'react';
import { Tabs } from 'antd';

class CampaignDashboardTabs extends Component {

  render() {

    const menuItems = this.buildMenuItems();

    return (
      <div className="mcs-campaign-dashboard-tabs">
        <Tabs
          defaultActiveKey="0"
          onChange={() => {}}
        >
          {menuItems}
        </Tabs>
      </div>
    );

  }

  buildMenuItems() {
    const {
      items
    } = this.props;

    return items.map((item, index) => {

      return (
        <Tabs.TabPane tab={item.title} key={index.toString()}>
          { item.display }
        </Tabs.TabPane>
      );
    });
  }


}

CampaignDashboardTabs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    display: PropTypes.element
  })).isRequired
};

export default CampaignDashboardTabs;
