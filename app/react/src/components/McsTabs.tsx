import * as React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import generateGuid from '../utils/generateGuid';

interface McTabsProps {
  items: [{
    title: string;
    display?: JSX.Element;
  }];
  isCard?: boolean;
}

class McsTabs extends React.Component<McTabsProps> {

  static defaultProps: Partial<McTabsProps> = {
    isCard: true,
  }

  buildMenuItems() {
    const { items } = this.props;

    return items.map((item, index) => (
      <Tabs.TabPane tab={item.title} key={item.title}>
        { item.display }
      </Tabs.TabPane>
    ));
  }

  render() {
    const { isCard, items } = this.props;
    const menuItems = this.buildMenuItems();

    return (
      <div
        className={isCard
          ? 'mcs-campaign-dashboard-tabs card'
          : 'mcs-campaign-dashboard-tabs standalone'
        }
      >
        <Tabs defaultActiveKey={items[0].title}>
          {menuItems}
        </Tabs>
      </div>
    );

  }
}

export default McsTabs;
