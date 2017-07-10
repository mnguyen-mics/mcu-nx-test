import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { NavigatorHeader } from '../../containers/Header';
import { NavigatorMenu } from '../../containers/Menu';
import { Logo } from '../../containers/Logo';

const { Content, Sider } = Layout;

class MainLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      mode: 'inline'
    };
    this.onCollapse = this.onCollapse.bind(this);
    this.onMenuItemClick = this.onMenuItemClick.bind(this);
  }

  onCollapse(collapsed) {
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
    });
  }

  getActionBar() {
    const { actionBarComponent: ActionBarComponent } = this.props;

    if (ActionBarComponent) return <ActionBarComponent />;
    return null;
  }

  onMenuItemClick() {
    if (this.state.collapsed === true) {
      this.setState({
        collapsed: false,
        mode: 'inline'
      });
    }
  }

  render() {

    const { contentComponent: ContentComponent } = this.props;

    return (
      <Layout id="mcs-main-layout" className="mcs-fullscreen">
        <Sider style={this.state.collapsed ? {} : { overflow: 'auto' }} collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <Logo mode={this.state.mode} />
          <NavigatorMenu mode={this.state.mode} collapsed={this.state.collapsed} onMenuItemClick={this.onMenuItemClick} />
        </Sider>
        <Layout>
          <NavigatorHeader />
          { this.getActionBar() }
          <Content className="mcs-content-container">
            <ContentComponent />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

MainLayout.propTypes = {
  contentComponent: PropTypes.func.isRequired,
  actionBarComponent: PropTypes.func.isRequired
};

export default MainLayout;

