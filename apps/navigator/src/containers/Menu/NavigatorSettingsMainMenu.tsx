import * as React from 'react';
import { Breadcrumb, Menu } from 'antd';
import { settingsDefinitions } from '../../routes/settingsDefinition';
import { FormattedMessage } from 'react-intl';
import { matchPath, RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { hasDatamarts } from '../../redux/Session/selectors';
import { getOrgFeatures } from '../../redux/Features/selectors';
import { injectFeatures, InjectedFeaturesProps } from '../Features';
import { NavigatorMenuDefinition } from '../../routes/domain';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { PopupContainer } from '@mediarithmics-private/mcs-components-library';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Dropdown } = PopupContainer;
interface NavigatorSettingsMainMenuStoreProps {
  organisationHasDatamarts: (organisationId: string) => boolean;
  orgFeatures: string[];
}

interface NavigatorSettingsMainMenuProps {
  menu?: React.ReactElement;
}
type Props = NavigatorSettingsMainMenuProps &
  RouteComponentProps<{ organisationId: string }> &
  NavigatorSettingsMainMenuStoreProps &
  InjectedFeaturesProps;

const basePath = '/v2/o/:organisationId(\\d+)';

interface State {
  current: string;
}

class NavigatorSettingsMainMenu extends React.Component<Props, State> {
  state = {
    current: 'settings',
  };

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname },
    } = this.props;

    this.initMenu(pathname, organisationId);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname },
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
      location: { pathname: previousPathname },
    } = previousProps;

    if (previousPathname !== pathname || previousOrganisationId !== organisationId) {
      this.initMenu(pathname, organisationId);
    }
  }

  initMenu = (pathname: string, organisationId: string) => {
    const currentOpenMenu = settingsDefinitions
      .filter(item => item.type === 'multi' && item.subMenuItems && item.subMenuItems.length > 0)
      .find(
        item =>
          item.type === 'multi' &&
          item.subMenuItems.reduce((acc: boolean, val) => {
            return matchPath(pathname, {
              path: `${basePath}${val.path}`,
              exact: false,
              strict: false,
            })
              ? true
              : acc;
          }, false),
      );
    if (currentOpenMenu) {
      this.setState({ current: currentOpenMenu.iconType });
    }
  };

  handleClick = (e: any) => {
    this.setState({
      current: e.key,
    });
  };

  getAvailableItems = (): NavigatorMenuDefinition[] => {
    const { hasFeature } = this.props;

    const checkIfHasAtLeastOneFeature = (item: NavigatorMenuDefinition): boolean => {
      if (item.type === 'simple') {
        return hasFeature(item.requiredFeature, item.requireDatamart);
      }
      return item.subMenuItems.reduce((acc, val) => {
        return hasFeature(val.requiredFeature, val.requireDatamart)
          ? hasFeature(val.requiredFeature, val.requireDatamart)
          : acc;
      }, false);
    };

    return settingsDefinitions.reduce((acc, item) => {
      if (checkIfHasAtLeastOneFeature(item)) {
        if (item.type === 'multi') {
          const subMenuItems = (item.subMenuItems || []).filter(subMenuItem =>
            hasFeature(subMenuItem.requiredFeature, subMenuItem.requireDatamart),
          );
          return [...acc, { ...item, subMenuItems }];
        }
        return [...acc, { ...item }];
      }
      return acc;
    }, []);
  };

  generateBreadcrumb = () => {
    const {
      location: { pathname },
    } = this.props;
    const settingsIndex = pathname.indexOf('settings');
    const pathnameSlided = pathname.slice(settingsIndex);
    const breadcrumbItems = pathnameSlided.split('/');

    return (
      <Breadcrumb separator='>' className='mcs-homePage_breadcrumb'>
        {breadcrumbItems.map((item, index) => (
          <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  generateMenuItems = () => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const baseUrl = `/v2/o/${organisationId}`;
    return this.getAvailableItems().map(item => {
      return (
        <Menu.Item key={item.iconType}>
          <Link
            to={`${baseUrl}${
              item.type === 'multi' && item.subMenuItems && item.subMenuItems.length
                ? item.subMenuItems[0].path
                : item.type === 'simple' && item.path
            }`}
            className={`mcs-settingsMainMenu_${item.translation.id}`}
          >
            <FormattedMessage {...item.translation} />
          </Link>
        </Menu.Item>
      );
    });
  };

  render() {
    const { menu } = this.props;
    return (
      <div className='mcs-settingsMainMenu_container'>
        {menu && (
          <Dropdown
            overlay={menu}
            trigger={['click']}
            className='mcs-settingsMainMenu_container_arrowMenu'
          >
            <a>
              <ArrowLeftOutlined />
            </a>
          </Dropdown>
        )}

        <div className='mcs-settingsMainMenu_container_item'>Settings</div>

        <Menu
          onClick={this.handleClick}
          selectedKeys={[this.state.current]}
          mode='horizontal'
          style={{ padding: '0 40px' }}
          className={'mcs-settingsMainMenu--newDesign'}
        >
          {this.generateMenuItems()}
        </Menu>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  organisationHasDatamarts: hasDatamarts(state),
  orgFeatures: getOrgFeatures(state),
});

const mapDispatchToProps = {};

export default compose<Props, NavigatorSettingsMainMenuProps>(
  withRouter,
  injectFeatures,
  connect(mapStateToProps, mapDispatchToProps),
)(NavigatorSettingsMainMenu);
