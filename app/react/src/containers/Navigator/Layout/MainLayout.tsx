import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  BookFilled,
  CodeSandboxCircleFilled,
  CompassFilled,
  ReadOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { Row, Col } from 'antd/lib/grid';
import { NavigatorMenu } from '../../../containers/Menu';
import { Logo } from '../../../containers/Logo';
import * as MenuActions from '../../../redux/Menu/actions';
import { compose } from 'recompose';
import { MenuMode } from 'rc-menu/lib/interface';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { UserProfileResource } from '../../../models/directory/UserProfileResource';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { AppsMenuSections } from '@mediarithmics-private/mcs-components-library/lib/components/apps-navigation/apps-menu/AppsMenu';
import { buildAccountsMenu, buildSettingsButton } from './LayoutHelper';
import { MicsReduxState, TopBar } from '@mediarithmics-private/advanced-components';

const { Content, Sider } = Layout;

export interface MainLayoutProps {
  contentComponent: React.ComponentType;
  actionBarComponent: React.ComponentType | null;
}

interface MainLayoutStoreProps {
  collapsed: boolean;
  mode: MenuMode;
  openCloseMenu: (a: { collapsed: boolean; mode: MenuMode }) => void;
  connectedUser: UserProfileResource;
  userEmail: string;
}

interface MainLayoutState {}

type Props = MainLayoutProps &
  InjectedFeaturesProps &
  RouteComponentProps<{ organisationId: string }> &
  MainLayoutStoreProps;

const LayoutId = Layout as any;
// waiting for https://github.com/ant-design/ant-design/commit/518c424ca4a023f3faebce0adf64219989be0018 to be released to remove any

class MainLayout extends React.Component<Props, MainLayoutState> {
  public static defaultProps: Partial<MainLayoutProps & MainLayoutStoreProps> = {
    actionBarComponent: null,
    collapsed: false,
    mode: 'inline',
  };

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  onCollapse = (collapsed: boolean) => {
    const { openCloseMenu } = this.props;

    openCloseMenu({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
    });

    localStorage.setItem('collapsed_menu', collapsed ? 'true' : 'false');

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
  getAppMenuSections(): AppsMenuSections {
    const { connectedUser } = this.props;

    const isFromMics =
      connectedUser.workspaces.filter(workspace => workspace.organisation_id === '1').length > 0;

    const menuSections: AppsMenuSections = {
      userLinks: [
        {
          name: 'Navigator',
          icon: <CompassFilled className='mcs-app_icon mcs-app_navigatorIcon' />,
          url: 'https://navigator.mediarithmics.com',
        },
        {
          name: 'Developer Documentation',
          icon: <BookFilled className='mcs-app_icon mcs-app_documentationIcon ' />,
          url: 'https://developer.mediarithmics.com',
        },

        {
          name: 'User Guide',
          icon: <ReadOutlined className='mcs-app_icon mcs-app_documentationIcon' />,
          url: 'https://userguides.mediarithmics.com',
        },
      ],
      adminLinks: [],
    };

    if (isFromMics) {
      menuSections.adminLinks = [
        {
          name: 'Platform Admin',
          url: 'https://admin.mediarithmics.com:8493',
        },
        {
          name: 'Computing Console',
          icon: <CodeSandboxCircleFilled className='mcs-app_icon mcs-app_developerConsoleIcon' />,
          url: 'https://computing-console-mics.francecentral.cloudapp.azure.com/frontprod/login',
        },
      ];
    }
    return menuSections;
  }

  render() {
    const {
      contentComponent: ContentComponent,
      actionBarComponent: ActionBarComponent,
      collapsed,
      mode,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const accounts = buildAccountsMenu(organisationId);
    const settings = buildSettingsButton(organisationId);

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
            <Sider
              className={'new-mcs-sider'}
              collapsible={true}
              collapsed={collapsed}
              trigger={this.renderTrigger()}
            >
              <Logo mode={mode} />

              <NavigatorMenu
                mode={mode}
                onMenuItemClick={this.onMenuItemClick}
                className='mcs-mainLayout-menu'
              />
            </Sider>
            <Layout>
              {ActionBarComponent ? <ActionBarComponent /> : null}
              {ActionBarComponent ? (
                <div className='ant-layout'>
                  <Content className='mcs-content-container'>
                    <ContentComponent />
                  </Content>
                </div>
              ) : (
                <ContentComponent />
              )}
            </Layout>
          </Layout>
        </LayoutId>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  connectedUser: state.session.connectedUser,
  collapsed: state.menu.collapsed,
  mode: state.menu.mode,
  userEmail: state.session.connectedUser.email,
});

const mapDispatchToProps = {
  openCloseMenu: MenuActions.openCloseMenu,
};

export default compose<Props, MainLayoutProps>(
  withRouter,
  injectFeatures,
  connect(mapStateToProps, mapDispatchToProps),
)(MainLayout);
