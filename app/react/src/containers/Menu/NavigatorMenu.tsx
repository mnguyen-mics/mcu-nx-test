import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';
import { MenuInfo, MenuMode } from 'rc-menu/lib/interface';
import { getDefaultDatamart } from '../../redux/Session/selectors';

import { menuDefinitions } from '../../routes/menuDefinition';

import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';
import { injectFeatures, InjectedFeaturesProps } from '../Features';
import { NavigatorMenuDefinition, NavigatorSubMenuDefinition } from '../../routes/domain';
import { DatamartResource } from '../../models/datamart/DatamartResource';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { McsIcon, MentionTag } from '@mediarithmics-private/mcs-components-library';

const { SubMenu } = Menu;

const basePath = '/v2/o/:organisationId(\\d+)';

export interface NavigatorMenuProps {
  mode: MenuMode;
  onMenuItemClick: () => void;
  className?: string;
}

interface NavigatorMenuStoreProps {
  defaultDatamart: (organisationId: string) => DatamartResource;
}

interface RouteProps {
  organisationId: string;
}

type Props = NavigatorMenuProps &
  RouteComponentProps<RouteProps> &
  NavigatorMenuStoreProps &
  InjectedFeaturesProps;

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
    const {
      location: { pathname },
    } = this.props;
    this.checkInitialState(pathname);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname: previousPathname },
    } = previousProps;
    const {
      location: { pathname },
    } = this.props;

    if (pathname !== previousPathname) {
      this.checkInitialState(pathname);
    }
  }

  checkInitialState = (pathname: string) => {
    const currentOpenSubMenu = menuDefinitions
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

    if (currentOpenSubMenu) this.setState({ inlineOpenKeys: [currentOpenSubMenu.iconType] });
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

  onClick = (e: MenuInfo) => {
    const hasClickOnFirstLevelMenuItem = menuDefinitions.find(item => item.iconType === e.key);
    if (hasClickOnFirstLevelMenuItem) this.setState({ inlineOpenKeys: [] });
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

    return menuDefinitions.reduce((acc, item) => {
      if (checkIfHasAtLeastOneFeature(item)) {
        if (item.type === 'multi') {
          const subMenuItems = (item.subMenuItems || []).filter(
            subMenuItem =>
              hasFeature(subMenuItem.requiredFeature, subMenuItem.requireDatamart) &&
              ((subMenuItem.path !== '/audience/segment-builder' &&
                hasFeature('audience-builders')) ||
                !hasFeature('audience-builders')),
          );
          return [...acc, { ...item, subMenuItems }];
        }
        return [...acc, { ...item }];
      }
      return acc;
    }, []);
  };

  buildItems = () => {
    const {
      mode,
      match: {
        params: { organisationId },
      },
      defaultDatamart,
    } = this.props;

    const baseUrl = `/v2/o/${organisationId}`;

    return this.getAvailableItems().map(itemDef => {
      if (itemDef.type === 'multi') {
        const onTitleClick = () => {
          this.setState({ inlineOpenKeys: [itemDef.iconType] });
          this.props.onMenuItemClick();
        };
        return (
          <SubMenu
            key={itemDef.iconType}
            onTitleClick={onTitleClick}
            title={
              <span>
                <McsIcon type={itemDef.iconType} />
                {itemDef.mention && (
                  <MentionTag
                    mention={itemDef.mention}
                    className={`mcs-menuMentionTag ${
                      mode === 'vertical'
                        ? 'mcs-verticalMenuMentionTag--west'
                        : 'mcs-menuMentionTag--west'
                    }`}
                  />
                )}
                <span className='nav-text'>
                  <FormattedMessage {...itemDef.translation} />
                </span>
              </span>
            }
            className={`mcs-sideBar-subMenu_${itemDef.translation.id}`}
          >
            {itemDef.subMenuItems.map((subMenuItem: NavigatorSubMenuDefinition) => {
              let linkUrl = `${baseUrl}${subMenuItem.path}`;
              if (subMenuItem.legacyPath) {
                if (subMenuItem.requireDatamart) {
                  linkUrl = `/o${organisationId}d${defaultDatamart(organisationId).id}${
                    subMenuItem.path
                  }`;
                } else {
                  linkUrl = `/${organisationId}${subMenuItem.path}`;
                }
              }
              return (
                <Menu.Item
                  key={subMenuItem.path}
                  className={`mcs-sideBar-subMenuItem_${subMenuItem.translation.id}`}
                >
                  {subMenuItem.mention && (
                    <MentionTag
                      mention={subMenuItem.mention}
                      className={`mcs-menuMentionTag ${
                        mode === 'vertical'
                          ? 'mcs-verticalMenuMentionTag--east'
                          : 'mcs-menuMentionTag--east'
                      }`}
                    />
                  )}
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
        <Menu.Item
          key={itemDef.iconType}
          className={`mcs-sideBar-subMenu_${itemDef.translation.id}`}
        >
          <Link to={`${baseUrl}${itemDef.path}`} className={'mcs-sideBar-menuItem_simple'}>
            <McsIcon
              type={itemDef.iconType}
              style={mode === 'vertical' ? { fontSize: '16px' } : {}}
            />
            <span className='nav-text'>
              <FormattedMessage {...itemDef.translation} />
            </span>
          </Link>
        </Menu.Item>
      );
    });
  };

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
            path: item.path,
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
        return !!matched; // && matched.isExact;
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
        className={`${this.props.className} mcs-menu-antd-customized-newDesign`}
      >
        {this.buildItems()}
      </Menu>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  defaultDatamart: getDefaultDatamart(state),
});

const mapDispatchToProps = {};

export default compose<Props, NavigatorMenuProps>(
  withRouter,
  injectFeatures,
  connect(mapStateToProps, mapDispatchToProps),
)(NavigatorMenu);
