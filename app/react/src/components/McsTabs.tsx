import * as React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

interface McTabsProps {
  items: [{
    title?: string;
    display?: any;
  }];
  isCard?: boolean;
}

class McsTabs extends React.Component<McTabsProps> {

  static defaultProps = {
    isCard: true,
  }

  buildMenuItems() {
    const { items } = this.props;

    return items.map((item, index) => (
      <Tabs.TabPane tab={item.title} key={index.toString()}>
        { item.display }
      </Tabs.TabPane>
    ));
  }

  render() {
    const { isCard } = this.props;
    const menuItems = this.buildMenuItems();

    return (
      <div
        className={isCard
          ? 'mcs-campaign-dashboard-tabs card'
          : 'mcs-campaign-dashboard-tabs standalone'
        }
      >
        <Tabs
          defaultActiveKey="0"
          onChange={() => {}}
        >
          {menuItems}
        </Tabs>
      </div>
    );

  }
}

export default McsTabs;
