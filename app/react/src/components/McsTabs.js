import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

class McsTabs extends Component {

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

McsTabs.defaultProps = {
  isCard: true,
};

McsTabs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    display: PropTypes.element,
  })).isRequired,
  isCard: PropTypes.bool,
};

export default McsTabs;
