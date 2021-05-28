import * as React from 'react';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';

import { settingsDefinitions } from '../../routes/settingsDefinition';

import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';
import { MenuMode } from 'antd/lib/menu';
import { injectFeatures, InjectedFeaturesProps } from '../Features';
import {
  NavigatorMultipleLevelMenuDefinition,
  NavigatorSubMenuDefinition,
} from '../../routes/domain';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

const basePath = '/v2/o/:organisationId(\\d+)';

export interface NavigatorSettingsSideMenuProps {
  mode: MenuMode;
  collapsed: boolean;
  onMenuItemClick: () => void;
}

interface RouteProps {
  organisationId: string;
}

type Props = NavigatorSettingsSideMenuProps &
  RouteComponentProps<RouteProps> &
  InjectedFeaturesProps;

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
    const {
      location: { pathname },
    } = this.props;
    this.checkInitialState(pathname);
  }

  checkInitialState = (pathname: string) => {
    const currentOpenSubMenu = settingsDefinitions
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

    if (currentOpenSubMenu) this.setState({ inlineOpenKeys: [currentOpenSubMenu.iconType] }); // eslint-disable-line react/no-did-mount-set-state
  };

  onOpenChange = (openKeys: string[]) => {
    const state = this.state;
    const { mode } = this.props;

    if (mode === 'inline') {
      const latestOpenKey = openKeys.find(key => !(state.inlineOpenKeys.indexOf(key) > -1));
      let nextOpenKeys: string[] = [];
      if (latestOpenKey) {
        nextOpenKeys = [latestOpenKey];
      }

      this.setState({ inlineOpenKeys: nextOpenKeys });
    } else {
      this.setState({ vecticalOpenKeys: openKeys });
    }
  };

  onClick = (e: any) => {
    const hasClickOnFirstLevelMenuItem = settingsDefinitions.find(item => item.iconType === e.key);
    if (hasClickOnFirstLevelMenuItem) this.setState({ inlineOpenKeys: [] });
  };

  getAvailableItems() {
    const { hasFeature } = this.props;

    const checkIfHasAtLeastOneFeature = (item: NavigatorMultipleLevelMenuDefinition): boolean => {
      return item.subMenuItems.reduce((acc, val) => {
        return hasFeature(val.requiredFeature, val.requireDatamart)
          ? hasFeature(val.requiredFeature, val.requireDatamart)
          : acc;
      }, false);
    };

    return settingsDefinitions.reduce((acc, item) => {
      if (item.type === 'multi' && checkIfHasAtLeastOneFeature(item)) {
        const subMenuItems = (item.subMenuItems || []).filter(subMenuItem =>
          hasFeature(subMenuItem.requiredFeature, subMenuItem.requireDatamart),
        );
        return [...acc, { ...item, subMenuItems }];
      }
      return acc;
    }, []);
  }

  buildItems() {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname },
      hasFeature,
    } = this.props;

    const baseUrl = `/v2/o/${organisationId}`;

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

    return (
      currentOpenMenu &&
      currentOpenMenu.type === 'multi' &&
      currentOpenMenu.subMenuItems &&
      currentOpenMenu.subMenuItems.map(itemDef => {
        return hasFeature(itemDef.requiredFeature, itemDef.requireDatamart) ? (
          <Menu.Item key={itemDef.path}>
            <Link
              to={`${baseUrl}${itemDef.path}`}
              className={`mcs-settingsSideMenu_${itemDef.translation.id}`}
            >
              <McsIcon type={itemDef.iconType as McsIconType} />
              <span className='nav-text'>
                <FormattedMessage {...itemDef.translation} />
              </span>
            </Link>
          </Menu.Item>
        ) : null;
      })
    );
  }

  getAllKeysWithPath = (): Array<{
    path: string;
    key: string;
    mainKey: string;
  }> => {
    return this.getAvailableItems().reduce((acc, item) => {
      let subMenuKeys;
      if (item.type === 'multi') {
        subMenuKeys = item.subMenuItems.reduce(
          (subAcc: any, subItem: NavigatorSubMenuDefinition) => {
            return [
              ...subAcc,
              {
                key: subItem.path,
                path: subItem.path,
                mainKey: item.iconType,
              },
            ];
          },
          [],
        );
        return [...acc, ...subMenuKeys];
      } else {
        return [
          ...acc,
          {
            key: item.iconType,
            path: (item as any).path,
            mainKey: item.iconType,
          },
        ];
      }
    }, []);
  };

  render() {
    const {
      mode,
      location: { pathname },
    } = this.props;

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
        className='mcs-menu-antd-customized'
      >
        {this.buildItems()}
      </Menu>
    );
  }
}

export default compose<Props, NavigatorSettingsSideMenuProps>(
  withRouter,
  injectFeatures,
)(NavigatorSettingsSideMenu);
