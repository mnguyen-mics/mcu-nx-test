import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';

import {
  hasDatamarts,
  getDefaultDatamart,
} from '../../state/Session/selectors';
import McsIcon, { McsIconType } from '../../components/McsIcon';
import { getOrgFeatures } from '../../state/Features/selectors';

import * as menuDefinitions from './menuDefinitions';
import * as settingsDefinitions from './settingsDefinitions';

import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';
import { MenuMode } from 'antd/lib/menu';
import { Datamart } from '../../models/organisation/organisation';
import { Pathname } from 'history';

const { SubMenu } = Menu;

const basePath = '/v2/o/:organisationId(\\d+)';

export type NavigatorMenuType = 'settings' | 'main';

export interface NavigatorMenuProps {
  mode: MenuMode;
  collapsed: boolean;
  onMenuItemClick: () => void;
  type: NavigatorMenuType;
}

interface NavigatorMenuStoreProps {
  organisationHasDatamarts: (organisationId: string) => boolean;
  defaultDatamart: (organisationId: string) => Datamart;
  orgFeatures: string[];
}

interface RouteProps {
  organisationId: string;
}

type Props = NavigatorMenuProps &
  RouteComponentProps<RouteProps> &
  NavigatorMenuStoreProps;

interface NavigatorMenuState {
  inlineOpenKeys: string[];
  vecticalOpenKeys: string[];
}

class NavigatorMenu extends React.Component<Props, NavigatorMenuState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      inlineOpenKeys: [],
      vecticalOpenKeys: [],
    };
  }

  componentDidMount() {
    const { location: { pathname }, type } = this.props;
    this.checkInitialState(pathname, type)
    
  }

  componentWillReceiveProps (nextProps: Props) {
    const { location: { pathname }, type } = nextProps;

    if (this.props.type !== nextProps.type) {
      this.checkInitialState(pathname, type) 
    }
  }

  checkInitialState = (pathname: Pathname, type: NavigatorMenuType) => {
    const itemDefinitions =
      type === 'settings'
        ? settingsDefinitions.itemDefinitions
        : menuDefinitions.itemDefinitions;
    const currentOpenSubMenu = itemDefinitions
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
    const { type } = this.props;
    const itemDefinitions =
      type === 'settings'
        ? settingsDefinitions.itemDefinitions
        : menuDefinitions.itemDefinitions;
    const hasClickOnFirstLevelMenuItem = itemDefinitions.find(
      item => item.key === key,
    );
    if (hasClickOnFirstLevelMenuItem) this.setState({ inlineOpenKeys: [] });
  };

  getAvailableItems() {
    const {
      match: { params: { organisationId } },
      organisationHasDatamarts,
      orgFeatures,
      type,
    } = this.props;

    const itemDefinitions =
      type === 'settings'
        ? settingsDefinitions.itemDefinitions
        : menuDefinitions.itemDefinitions;
    const itemDisplayedOnlyIfDatamart =
      type === 'settings'
        ? settingsDefinitions.itemDisplayedOnlyIfDatamart
        : menuDefinitions.itemDisplayedOnlyIfDatamart;

    const isAvailable = (key: string) => {
      if (itemDisplayedOnlyIfDatamart.includes(key))
        return (
          organisationHasDatamarts(organisationId) &&
          orgFeatures.filter(v => v.includes(key)).length > 0
        );
      return orgFeatures.filter(v => v.includes(key)).length > 0;
    };

    return itemDefinitions.reduce((acc, item) => {
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
      defaultDatamart,
      collapsed,
      type,
    } = this.props;

    const baseUrl = `/v2/o/${organisationId}`;
    const itemDisplayedOnlyIfDatamart =
      type === 'settings'
        ? settingsDefinitions.itemDisplayedOnlyIfDatamart
        : menuDefinitions.itemDisplayedOnlyIfDatamart;
    return this.getAvailableItems().map(itemDef => {
      const buildSubMenu =
        itemDef.subMenuItems && itemDef.subMenuItems.length > 0;
      if (buildSubMenu) {
        const onTitleClick = () => {
          this.setState({ inlineOpenKeys: [itemDef.key] });
          this.props.onMenuItemClick();
        };
        return (
          <SubMenu
            key={itemDef.key}
            onTitleClick={onTitleClick}
            title={
              <span>
                <McsIcon type={itemDef.iconType as McsIconType} />
                <span className="nav-text">
                  <FormattedMessage {...itemDef.translation} />
                </span>
              </span>
            }
          >
            {itemDef.subMenuItems.map((subMenuItem: any) => {
              let linkUrl = `${baseUrl}${subMenuItem.path}`;
              if (subMenuItem.legacyPath) {
                if (itemDisplayedOnlyIfDatamart.includes(subMenuItem.key)) {
                  linkUrl = `/o${organisationId}d${
                    defaultDatamart(organisationId).id
                  }${subMenuItem.path}`;
                } else {
                  linkUrl = `/${organisationId}${subMenuItem.path}`;
                }
              }
              return (
                <Menu.Item
                  style={
                    collapsed === true
                      ? { display: 'none' }
                      : { display: 'block' }
                  }
                  key={subMenuItem.key}
                >
                  <Link to={linkUrl}>
                    <FormattedMessage {...subMenuItem.translation} />
                  </Link>
                </Menu.Item>
              );
            })}
          </SubMenu>
        );
      }

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
  defaultDatamart: getDefaultDatamart(state),
  orgFeatures: getOrgFeatures(state),
});

const mapDispatchToProps = {};

export default compose<Props, NavigatorMenuProps>(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(NavigatorMenu);
