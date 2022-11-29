import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { BarsOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { Row, Col } from 'antd/lib/grid';
import { NavigatorSettingsMainMenu, NavigatorSettingsSideMenu, NavigatorMenu } from '../../Menu';
import * as MenuActions from '../../../redux/Menu/actions';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { compose } from 'recompose';
import { MenuMode } from 'rc-menu/lib/interface';
import { MicsReduxState, TopBar } from '@mediarithmics-private/advanced-components';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { buildAccountsMenu, buildSettingsButton } from './LayoutHelper';

const { Sider } = Layout;

const messages = defineMessages({
  switchOrg: {
    id: 'navigator.layout.settingLayout.sideMenu.switchOrg.label',
    defaultMessage: 'Switch Org.',
  },
  collapse: {
    id: 'navigator.layout.settingLayout.sideMenu.collapse',
    defaultMessage: 'Collapse',
  },
  backToApp: {
    id: 'navigator.layout.settingLayout.sideMenu.backToApp',
    defaultMessage: 'Back To Your App',
  },
});

export interface SettingLayoutProps {
  contentComponent: React.ComponentType;
  actionBarComponent: React.ComponentType | null;
}

interface SettingLayoutStoreProps {
  collapsed: boolean;
  mode: MenuMode;
  openCloseMenu: (a: { collapsed: boolean; mode: MenuMode }) => void;
}

interface SettingLayoutState {
  isOpen: boolean;
  left: number;
  right: number;
}

type Props = SettingLayoutProps &
  InjectedFeaturesProps &
  RouteComponentProps<{ organisationId: string }> &
  SettingLayoutStoreProps;

const LayoutId = Layout as any;

// waiting for https://github.com/ant-design/ant-design/commit/518c424ca4a023f3faebce0adf64219989be0018 to be released to remove any

class SettingLayout extends React.Component<Props, SettingLayoutState> {
  public static defaultProps: Partial<SettingLayoutProps & SettingLayoutStoreProps> = {
    actionBarComponent: null,
    collapsed: false,
    mode: 'inline',
  };

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
  };

  onMenuItemClick = () => {
    const { collapsed } = this.props;

    if (collapsed === true) {
      this.onCollapse(false);
    }
  };

  renderTrigger = () => {
    const onCollapse = () => {
      this.onCollapse(!this.props.collapsed);
    };
    return (
      <Row>
        <Col span={this.props.collapsed ? 24 : 6} className='all'>
          <Button onClick={onCollapse}>
            {this.props.collapsed ? (
              <DoubleRightOutlined />
            ) : (
              <span>
                <DoubleLeftOutlined />
              </span>
            )}
          </Button>
        </Col>
      </Row>
    );
  };

  renderSettingsTrigger = () => {
    const orgSelector = () => {
      this.setState(prevState => {
        return { ...prevState, isOpen: !prevState.isOpen };
      });
    };

    return (
      <Row>
        <Col span={24} className='all'>
          <Button onClick={orgSelector} style={{ width: '100%' }}>
            <span>
              <BarsOutlined />{' '}
              <span>
                <FormattedMessage {...messages.switchOrg} />
              </span>
            </span>
          </Button>
        </Col>
      </Row>
    );
  };

  render() {
    const {
      contentComponent: ContentComponent,
      collapsed,
      mode,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const accounts = buildAccountsMenu(organisationId);
    const settings = buildSettingsButton(organisationId);

    const menu = (
      <NavigatorMenu
        mode={'vertical'}
        onMenuItemClick={this.onMenuItemClick}
        className={'mcs-settings-main-menu'}
      />
    );

    return (
      <div id='mcs-full-page' className='mcs-fullscreen'>
        <LayoutId id='mcs-main-layout' className='mcs-fullscreen'>
          <TopBar
            organisationId={organisationId}
            userAccount={accounts}
            headerSettings={settings}
            linkPath={`/v2/o/${organisationId}/campaigns/display`}
            prodEnv={process.env.API_ENV === 'prod'}
            className='mcs-themed-header'
          />
          <Layout>
            <NavigatorSettingsMainMenu menu={menu} />
            <Layout>
              <Sider
                className={'mcs-sider'}
                collapsible={false}
                collapsed={false}
                trigger={this.renderTrigger()}
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
  injectFeatures,
  connect(mapStateToProps, mapDispatchToProps),
)(SettingLayout);
