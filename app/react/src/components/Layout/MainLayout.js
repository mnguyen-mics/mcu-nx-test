import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Layout, Icon } from 'antd';
import { connect } from 'react-redux';
import { push as PushMenu } from 'react-burger-menu';
import { Row, Col } from 'antd/lib/grid';

import { NavigatorHeader } from '../../containers/Header';
import { NavigatorMenu } from '../../containers/Menu';
import { Logo } from '../../containers/Logo';
import * as MenuActions from '../../state/Menu/actions';
import { ButtonStyleless } from '../index.ts';

const { Content, Sider } = Layout;

class MainLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      left: 12,
      right: 12,
    };
  }

  getActionBar() {
    const { actionBarComponent: ActionBarComponent } = this.props;

    return (ActionBarComponent ? <ActionBarComponent /> : null);
  }

  onCollapse = (collapsed) => {
    const { openCloseMenu } = this.props;

    openCloseMenu({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
    });

    const event = new Event('redraw');

    global.window.dispatchEvent(event);
  }

  onMenuItemClick = () => {
    const { collapsed } = this.props;

    if (collapsed === true) {
      this.onCollapse(false);
    }
  }

  renderTrigger = () => {

    const {
      showOrgSelector
    } = this.props;

    const orgSelector = () => {
      this.setState({ isOpen: !this.state.isOpen });
    };

    const onCollapse = () => {
      this.onCollapse(!this.props.collapsed);
    };

    const resizeBox = (type) => {
      switch (type) {
        case 'left':
          return this.setState({ left: 20, right: 4 });
        case 'right':
          return this.setState({ left: 4, right: 20 });
        default:
          return this.setState({ left: 12, right: 12 });
      }
    };

    return showOrgSelector ? (
      <Row>
        <Col span={this.state.left} className="left" onMouseEnter={() => resizeBox('left')} onMouseLeave={() => resizeBox()} >
          <ButtonStyleless onClick={orgSelector} style={{ width: '100%' }}>
            <span><Icon type="bars" /> <span className={this.state.left > 12 && !this.props.collapsed ? 'visible' : 'hidden'}>Switch Org.</span></span>
          </ButtonStyleless>
        </Col>
        <Col span={this.state.right} className="right" onMouseEnter={() => resizeBox('right')} onMouseLeave={() => resizeBox()}>
          <ButtonStyleless onClick={onCollapse} style={{ width: '100%' }}>
            {this.props.collapsed ? <Icon type="right" /> : <span><Icon type="left" /> <span className={this.state.right > 12 ? 'visible' : 'hidden'}>Collapse</span></span>}
          </ButtonStyleless>
        </Col>
      </Row>
    ) : (
      <Row>
        <Col span={24} className="all">
          <ButtonStyleless onClick={onCollapse} style={{ width: '100%' }} onMouseEnter={() => resizeBox('right')} onMouseLeave={() => resizeBox()}>
            {this.props.collapsed ? <Icon type="right" /> : <span><Icon type="left" /> <span className={this.state.right > 12 ? 'visible' : 'hidden'}>Collapse</span></span>}
          </ButtonStyleless>
        </Col>
      </Row>
    );
  }

  render() {
    const {
      contentComponent: ContentComponent,
      actionBarComponent: ActionBarComponent,
      organisationSelector: OrganisationSelector,
      collapsed,
      mode,
    } = this.props;

    return (
      <div id="mcs-full-page" className="mcs-fullscreen">
        <PushMenu
          className=""
          pageWrapId={'mcs-main-layout'}
          outerContainerId={'mcs-full-page'}
          isOpen={this.state.isOpen}
          onStateChange={(state) => this.setState({ isOpen: state.isOpen })}
          width={200}
        >
          <OrganisationSelector />
        </PushMenu>

        <Layout id="mcs-main-layout" className="mcs-fullscreen">

          <Sider
            style={collapsed ? {} : { overflow: 'auto' }}
            collapsible
            collapsed={collapsed}
            trigger={this.renderTrigger()}
          >
            <Logo mode={mode} />
            <NavigatorMenu
              mode={mode}
              collapsed={collapsed}
              onMenuItemClick={this.onMenuItemClick}
            />
          </Sider>
          <Layout>
            <NavigatorHeader />
            { ActionBarComponent ? <ActionBarComponent /> : null }
            { ActionBarComponent
              ? (
                <div className="ant-layout">
                  <Content className="mcs-content-container">
                    <ContentComponent />
                  </Content>
                </div>
              )
              : <ContentComponent />
            }
          </Layout>

        </Layout>
      </div>
    );
  }
}

MainLayout.defaultProps = {
  actionBarComponent: null,
  collapsed: false,
  mode: 'inline',
  openCloseMenu: () => {},
};

MainLayout.propTypes = {
  contentComponent: PropTypes.func.isRequired,
  actionBarComponent: PropTypes.func,
  collapsed: PropTypes.bool,
  mode: PropTypes.string,
  openCloseMenu: PropTypes.func,
  showOrgSelector: PropTypes.bool.isRequired,
  organisationSelector: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  collapsed: state.menu.collapsed,
  mode: state.menu.mode,
});

const mapDispatchToProps = {
  openCloseMenu: MenuActions.openCloseMenu,
};

MainLayout = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MainLayout);

MainLayout = withRouter(MainLayout);

export default MainLayout;
