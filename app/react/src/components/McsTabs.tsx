import * as React from 'react';
import { Tabs } from 'antd';

interface McsTabsItem {
  title: string;
  display?: JSX.Element;
  forceRender?: boolean;
  key?: string;
}

interface McTabsProps {
  items: McsTabsItem[];
  isCard?: boolean;
}

class McsTabs extends React.Component<McTabsProps> {

  buildMenuItems() {
    const { items } = this.props;

    return items.map((item, index) => (
      <Tabs.TabPane tab={item.title} key={item.key || item.title} forceRender={item.forceRender ? item.forceRender : false}>
        {item.display}
      </Tabs.TabPane>
    ));
  }

  render() {
    const { items } = this.props;
    const menuItems = this.buildMenuItems();

    return (
      <div >
        <Tabs defaultActiveKey={items[0].title}>
          {menuItems}
        </Tabs>
      </div>
    );

  }
}

export default McsTabs;
