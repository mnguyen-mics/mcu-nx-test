import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Layout, Icon } from 'antd';
import { connect } from 'react-redux';
import { push as PushMenu, State } from 'react-burger-menu';
import { Row, Col } from 'antd/lib/grid';

import { NavigatorHeader } from '../../Header';
import { NavigatorSettingsMainMenu, NavigatorSettingsSideMenu, NavigatorMenu,  } from '../../Menu';
import * as MenuActions from '../../../state/Menu/actions';
import { ButtonStyleless } from '../../../components';
import { compose } from 'recompose';
import { MenuMode } from 'antd/lib/menu';
import { MicsReduxState } from '../../../utils/ReduxHelper';

const { Sider } = Layout;

const messages = defineMessages({
  switchOrg: {
    id: 'navigator.layout.settingLayout.sideMenu.switchOrg.label',
    defaultMessage: 'Switch Org.'
  },
  collapse: {
    id: 'navigator.layout.settingLayout.sideMenu.collapse',
    defaultMessage: 'Collapse'
  },
  backToApp: {
    id: 'navigator.layout.settingLayout.sideMenu.backToApp',
    defaultMessage: 'Back To Your App'
  }
});

export interface SettingLayoutProps {
  contentComponent: React.ComponentType;
  actionBarComponent: React.ComponentType | null;
  showOrgSelector: boolean;
  organisationSelector: any;
  orgSelectorSize: number;
}

interface SettingLayoutStoreProps {
  collapsed: boolean;
  mode: MenuMode;
  openCloseMenu: (a: { collapsed: boolean, mode: MenuMode }) => void;
}

interface SettingLayoutState {
  isOpen: boolean;
  left: number;
  right: number;
}

type Props = SettingLayoutProps & RouteComponentProps<{ organisationId: string }> & SettingLayoutStoreProps;

const LayoutId = Layout as any;
const ColAny = Col as any;

// waiting for https://github.com/ant-design/ant-design/commit/518c424ca4a023f3faebce0adf64219989be0018 to be released to remove any

class SettingLayout extends React.Component<Props, SettingLayoutState> {

  public static defaultProps: Partial<SettingLayoutProps & SettingLayoutStoreProps> = {
    actionBarComponent: null,
    collapsed: false,
    mode: 'inline',
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
      left: 12,
      right: 12,
    };
  }

  onCollapse = (collapsed: boolean) => {
    const { openCloseMenu } = this.props;

    openCloseMenu({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
    });

    const event = new Event('redraw');

    window.dispatchEvent(event);
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
      this.setState(prevState => { return { ...prevState, isOpen: !prevState.isOpen }});
    };

    const onCollapse = () => {
      this.onCollapse(!this.props.collapsed);
    };

    const resizeBox = (type?: 'left' | 'right') => () => {
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
        <ColAny span={this.state.left} className="left" onMouseEnter={resizeBox('left')} onMouseLeave={resizeBox()} >
          <ButtonStyleless onClick={orgSelector} style={{ width: '100%' }}>
            <span><Icon type="bars" /> <span className={this.state.left > 12 && !this.props.collapsed ? 'visible' : 'hidden'}><FormattedMessage {...messages.switchOrg} /></span></span>
          </ButtonStyleless>
        </ColAny>
        <ColAny span={this.state.right} className="right" onMouseEnter={resizeBox('right')} onMouseLeave={resizeBox()}>
          <ButtonStyleless onClick={onCollapse} style={{ width: '100%' }}>
            {this.props.collapsed ? <Icon type="right" /> : <span><Icon type="left" /> <span className={this.state.right > 12 ? 'visible' : 'hidden'}><FormattedMessage {...messages.collapse} /></span></span>}
          </ButtonStyleless>
        </ColAny>
      </Row>
    ) : (
      <Row>
        <Col span={24} className="all">
          <ButtonStyleless onClick={onCollapse} style={{ width: '100%' }} onMouseEnter={resizeBox('right')} onMouseLeave={resizeBox()}>
            {this.props.collapsed ? <Icon type="right" /> : <span><Icon type="left" /> <span className={this.state.right > 12 ? 'visible' : 'hidden'}><FormattedMessage {...messages.collapse} /></span></span>}
          </ButtonStyleless>
        </Col>
      </Row>
    );
  }

  renderSettingsTrigger = () => {

    const orgSelector = () => {
      this.setState(prevState => { return { ...prevState, isOpen: !prevState.isOpen }});
    };

    return <Row>
    <Col span={24} className="all">
      <ButtonStyleless onClick={orgSelector} style={{ width: '100%' }}>
        <span><Icon type="bars" /> <span><FormattedMessage {...messages.switchOrg} /></span></span>
      </ButtonStyleless>
    </Col>
  </Row>
  }

  render() {
    const {
      contentComponent: ContentComponent,
      organisationSelector: OrganisationSelector,
      collapsed,
      mode,
      orgSelectorSize,
    } = this.props;

    const onStateChange = (state: State) => this.setState({ isOpen: state.isOpen })
    const onClick = () => this.setState({ isOpen: false })
    const menu = (
      <NavigatorMenu
        mode={'vertical'}
        onMenuItemClick={this.onMenuItemClick}
        className={'mcs-settings-main-menu'}
      />
    )

    return (
      <div id="mcs-full-page" className="mcs-fullscreen">
        <PushMenu
          pageWrapId={'mcs-main-layout'}
          outerContainerId={'mcs-full-page'}
          isOpen={this.state.isOpen}
          onStateChange={onStateChange}
          width={orgSelectorSize}
        >
          <OrganisationSelector size={orgSelectorSize} onItemClick={onClick} />
        </PushMenu>

        <LayoutId id="mcs-main-layout" className="mcs-fullscreen">
          <NavigatorHeader isSetting={true} menu={menu} />
          <Layout>
            <NavigatorSettingsMainMenu />
            <Layout>
              <Sider
                collapsible={true}
                collapsed={false}
                trigger={this.renderSettingsTrigger()}
              >
                <NavigatorSettingsSideMenu
                  mode={mode}
                  collapsed={collapsed}
                  onMenuItemClick={this.onMenuItemClick}
                />
              </Sider>
            
              <Layout>
                <ContentComponent />
              </Layout>
            </Layout>
          </Layout>
        </LayoutId>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  collapsed: state.menu.collapsed,
  mode: state.menu.mode,
});

const mapDispatchToProps = {
  openCloseMenu: MenuActions.openCloseMenu,
};


export default compose<Props, SettingLayoutProps>(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )
)(SettingLayout);
