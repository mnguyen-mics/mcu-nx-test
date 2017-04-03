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
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={getSelectedItemKey()}
            style={{ height: '100%' }}
            className="mcs-menu-inline"
          >
            { buildSidebarItems() }
            <Menu.Item style={{ position: 'absolute', bottom: 0, left: 0, height: '95px', width: '100%', backgroundColor: '#fcfcfc', boxShadow: '0 -1px 0 0 #e1e1e1', cursor: 'default' }} disabled >
              <img alt="mics-logo" className="mcs-footer-img" src={logoUrl} />
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content>
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
