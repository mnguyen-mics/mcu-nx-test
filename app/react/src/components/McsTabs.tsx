import * as React from 'react';
import { Tabs } from 'antd';
import { TabsProps } from 'antd/lib/tabs';

interface McsTabsItem {
  title: string;
  display?: JSX.Element;
  forceRender?: boolean;
  key?: string;
}

interface McTabsProps extends TabsProps {
  items: McsTabsItem[];
  isCard?: boolean;
}

class McsTabs extends React.Component<McTabsProps> {
  buildMenuItems() {
    const { items } = this.props;

    return items.map((item, index) => (
      <Tabs.TabPane
        tab={item.title}
        key={item.key || item.title}
        forceRender={item.forceRender ? item.forceRender : false}
      >
        {item.display}
      </Tabs.TabPane>
    ));
  }

  render() {
    const { items, activeKey, ...rest } = this.props;
    const menuItems = this.buildMenuItems();

    return (
      <div>
        <Tabs defaultActiveKey={activeKey || items[0].title} {...rest}>
          {menuItems}
        </Tabs>
      </div>
    );
  }
}

export default McsTabs;
