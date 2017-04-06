import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu } from 'antd';

import logoUrl from '../../assets/images/logo-mediarithmics.png';

const { Sider, Content } = Layout;

class Sidebar extends Component {

  render() {

    const {
      isVisible,
      items
    } = this.props;


    const buildSidebarItems = () => {
      return items.map((item, index) => {
        return <Menu.Item key={index.toString()}>{ item.element }</Menu.Item>;
      });
    };

    const reduceArraySize = (value) => {
      return value.filter((val) => {
        return val !== null;
      });
    };

    const getSelectedItemKey = () => {
      return reduceArraySize(items.map((item, index) => {
        return item.isActive ? index.toString() : null;
      }));
    };


    const content = (
      <Layout>
        <Sider className="mcs-sider-container">
          <Menu
            mode="inline"
            defaultSelectedKeys={getSelectedItemKey()}
            className="mcs-menu-inline mcs-menu"
          >
            { buildSidebarItems() }
            <Menu.Item disabled >
              <img alt="mics-logo" className="mcs-footer-img" src={logoUrl} />
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content className="mcs-layout-content">
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );

    return isVisible ? content : null;

  }

}

Sidebar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  isVisible: state.sidebarState.isVisible
});

const mapDispatchToProps = {};

Sidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);

export default Sidebar;
