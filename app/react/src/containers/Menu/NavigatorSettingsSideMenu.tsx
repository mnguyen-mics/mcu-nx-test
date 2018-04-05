import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';

import {
  hasDatamarts,
} from '../../state/Session/selectors';
import McsIcon, { McsIconType } from '../../components/McsIcon';
import { getOrgFeatures } from '../../state/Features/selectors';

import {settingsDefinitions, itemDisplayedOnlyIfDatamart} from './settingsDefinitions';

import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';
import { MenuMode } from 'antd/lib/menu';
import { Datamart } from '../../models/organisation/organisation';


const basePath = '/v2/o/:organisationId(\\d+)';

export interface NavigatorSettingsSideMenuProps {
  mode: MenuMode;
  collapsed: boolean;
  onMenuItemClick: () => void;
}

interface NavigatorSettingsSideMenuStoreProps {
  organisationHasDatamarts: (organisationId: string) => boolean;
  defaultDatamart: (organisationId: string) => Datamart;
  orgFeatures: string[];
}

interface RouteProps {
  organisationId: string;
}

type Props = NavigatorSettingsSideMenuProps &
  RouteComponentProps<RouteProps> &
  NavigatorSettingsSideMenuStoreProps;

interface NavigatorSettingsSideMenuState {
  inlineOpenKeys: string[];
  vecticalOpenKeys: string[];
}

class NavigatorSettingsSideMenu extends React.Component<Props, NavigatorSettingsSideMenuState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      inlineOpenKeys: [],
      vecticalOpenKeys: [],
    };
  }

  componentDidMount() {
    const { location: { pathname } } = this.props;
    this.checkInitialState(pathname)
    
  }

  checkInitialState = (pathname: string) => {
    const currentOpenSubMenu = settingsDefinitions
      .filter(item => item.subMenuItems && item.subMenuItems.length > 0)
      .find(
        item =>
          matchPath(pathname, { path: `${basePath}${item.path}`, exact: false, strict: false })
            ? true
            : false,
      );

    if (currentOpenSubMenu)
      this.setState({ inlineOpenKeys: [currentOpenSubMenu.key] }); // eslint-disable-line react/no-did-mount-set-state
  }
  

  onOpenChange = (openKeys: string[]) => {
    const state = this.state;
    const { mode } = this.props;

    if (mode === 'inline') {
      const latestOpenKey = openKeys.find(
        key => !(state.inlineOpenKeys.indexOf(key) > -1),
      );
      let nextOpenKeys: string[] = [];
      if (latestOpenKey) {
        nextOpenKeys = [latestOpenKey];
      }

      this.setState({ inlineOpenKeys: nextOpenKeys });
    } else {
      this.setState({ vecticalOpenKeys: openKeys });
    }
  };

  onClick = ({ key }: { key: string }) => {
    const hasClickOnFirstLevelMenuItem = settingsDefinitions.find(
      item => item.key === key,
    );
    if (hasClickOnFirstLevelMenuItem) this.setState({ inlineOpenKeys: [] });
  };

  getAvailableItems() {
    const {
      match: { params: { organisationId } },
      organisationHasDatamarts,
      orgFeatures,
    } = this.props;

    const isAvailable = (key: string) => {
      if (itemDisplayedOnlyIfDatamart.includes(key))
        return (
          organisationHasDatamarts(organisationId) &&
          orgFeatures.filter(v => v.includes(key)).length > 0
        );
      return orgFeatures.filter(v => v.includes(key)).length > 0;
    };

    return settingsDefinitions.reduce((acc, item) => {
      if (isAvailable(item.key)) {
        const subMenuItems = (item.subMenuItems || []).filter(subMenuItem =>
          isAvailable(subMenuItem.key),
        );
        return [...acc, { ...item, subMenuItems }];
      }
      return acc;
    }, []);
  }

  buildItems() {
    const {
      match: { params: { organisationId } },
      location: { pathname },
    } = this.props;

    const baseUrl = `/v2/o/${organisationId}`;

    const currentOpenMenu = settingsDefinitions
      .filter(item => item.subMenuItems && item.subMenuItems.length > 0)
      .find(
        item =>
          matchPath(pathname, { path: `${basePath}${item.path}`, exact: false, strict: false })
            ? true
            : false,
      );

    return currentOpenMenu && currentOpenMenu.subMenuItems && currentOpenMenu.subMenuItems.map(itemDef => {
      return (
        <Menu.Item key={itemDef.key}>
          <Link to={`${baseUrl}${itemDef.path}`}>
            <McsIcon type={itemDef.iconType as McsIconType} />
            <span className="nav-text">
              <FormattedMessage {...itemDef.translation} />
            </span>
          </Link>
        </Menu.Item>
      );
    });
  }

  getAllKeysWithPath() {
    return this.getAvailableItems().reduce((acc, item) => {
      const subMenuKeys = item.subMenuItems.reduce(
        (subAcc: any, subItem: any) => {
          return [
            ...subAcc,
            {
              key: subItem.key,
              path: subItem.path,
              mainKey: item.key
            },
          ];
        },
        [],
      );
      return [
        ...acc,
        ...subMenuKeys,
        {
          key: item.key,
          path: item.path,
          mainKey: item.key
        },
      ];
    }, []);
  }

  render() {
    const { mode, location: { pathname } } = this.props;

    const getSelectedKeys = (): string[] => {
      const currentItem = this.getAllKeysWithPath().find(item => {
        const matched = matchPath(pathname, {
          path: `${basePath}${item.path}`,
        });
        return matched ? true : false; // && matched.isExact;
      });
      return currentItem ? [currentItem.key] : [];
    };

    const getOpenKeysInMode = () => {
      if (mode === 'inline') return this.state.inlineOpenKeys;
      return this.state.vecticalOpenKeys;
    };

    return (
      <Menu
        mode={mode}
        selectedKeys={getSelectedKeys()}
        openKeys={getOpenKeysInMode()}
        onOpenChange={this.onOpenChange}
        onClick={this.onClick}
      >
        {this.buildItems()}
      </Menu>
    );
  }
}

const mapStateToProps = (state: any) => ({
  organisationHasDatamarts: hasDatamarts(state),
  orgFeatures: getOrgFeatures(state),
});

const mapDispatchToProps = {};

export default compose<Props, NavigatorSettingsSideMenuProps>(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(NavigatorSettingsSideMenu);
