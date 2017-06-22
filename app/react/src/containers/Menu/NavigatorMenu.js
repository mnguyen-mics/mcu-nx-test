import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter, matchPath } from 'react-router-dom';
import { Menu } from 'antd';
import { FormattedMessage } from 'react-intl';

import {
  hasDatamarts,
  getDefaultDatamart } from '../../state/Session/selectors';
import { McsIcons } from '../../components/McsIcons';
import {
  itemDefinitions,
  itemDisplayedOnlyIfDatamart
} from './menuDefinitions';

const { SubMenu } = Menu;

const basePath = '/v2/o/:organisationId(\\d+)';

class NavigatorMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inlineOpenKeys: [],
      vecticalOpenKeys: []
    };
  }

  componentDidMount() {
    const {
      location: { pathname }
     } = this.props;

    const currentOpenSubMenu = itemDefinitions
      .filter(item => item.subMenuItems && item.subMenuItems.length > 0)
      .find(item => matchPath(pathname, { path: `${basePath}${item.path}` }));

    if (currentOpenSubMenu) this.setState({ inlineOpenKeys: [currentOpenSubMenu.key] }); // eslint-disable-line react/no-did-mount-set-state
  }

  onOpenChange = (openKeys) => {
    const state = this.state;
    const mode = this.props.mode;
    if (mode === 'inline') {
      const latestOpenKey = openKeys.find(key => !(state.inlineOpenKeys.indexOf(key) > -1));

      let nextOpenKeys = [];
      if (latestOpenKey) {
        nextOpenKeys = [latestOpenKey];
      }

      this.setState({ inlineOpenKeys: nextOpenKeys });
    } else {
      this.setState({ vecticalOpenKeys: openKeys });
    }
  }

  onClick = ({ key }) => {
    // console.log('has clicked on item');
    const hasClickOnFirstLevelMenuItem = itemDefinitions.find(item => item.key === key);
    if (hasClickOnFirstLevelMenuItem) this.setState({ inlineOpenKeys: [] });
    // this.props.onMenuItemClick();
  }

  getAvailableItems() {
    const {
      match: {
        params: { organisationId }
      },
      organisationHasDatamarts
    } = this.props;

    const isAvailable = key => {
      if (itemDisplayedOnlyIfDatamart.includes(key)) return organisationHasDatamarts(organisationId);
      return true;
    };

    return itemDefinitions.reduce((acc, item) => {
      if (isAvailable(item.key)) {
        const subMenuItems = (item.subMenuItems || []).reduce((subAcc, subMenuItem) => {
          if (isAvailable(subMenuItem.key)) {
            return [
              ...subAcc,
              subMenuItem
            ];
          }
          return subAcc;
        }, []);
        return [
          ...acc,
          { ...item, subMenuItems }
        ];
      }
      return acc;
    }, []);
  }

  buildItems() {
    const {
      match: {
        params: { organisationId }
      },
      defaultDatamart
    } = this.props;

    const baseUrl = `/v2/o/${organisationId}`;

    return this.getAvailableItems().map(itemDef => {
      const buildSubMenu = itemDef.subMenuItems && itemDef.subMenuItems.length > 0;
      if (buildSubMenu) {
        return (
          <SubMenu key={itemDef.key} title={<span><McsIcons type={itemDef.iconType} /><span className="nav-text"><FormattedMessage id={itemDef.translationId} /></span></span>}>
            {
              itemDef.subMenuItems.map(subMenuItem => {
                let linkUrl = `${baseUrl}${subMenuItem.path}`;
                if (subMenuItem.legacyPath) {
                  if (itemDisplayedOnlyIfDatamart.includes(subMenuItem.key)) {
                    linkUrl = `/o${organisationId}d${defaultDatamart(organisationId).id}${subMenuItem.path}`;
                  } else {
                    linkUrl = `/${organisationId}${subMenuItem.path}`;
                  }
                }
                return (<Menu.Item key={subMenuItem.key}><Link to={linkUrl}><FormattedMessage id={subMenuItem.translationId} /></Link></Menu.Item>);
              })
            }
          </SubMenu>
        );
      }

      return (<Menu.Item key={itemDef.key}><Link to={`${baseUrl}${itemDef.path}`}><McsIcons type={itemDef.iconType} /><span className="nav-text"><FormattedMessage id={itemDef.translationId} /></span></Link></Menu.Item>);
    });
  }

  getAllKeysWithPath() {
    return this.getAvailableItems().reduce((acc, item) => {
      const subMenuKeys = item.subMenuItems.reduce((subAcc, subItem) => {
        return [
          ...subAcc,
          { key: subItem.key,
            path: subItem.path
          }
        ];
      }, []);
      return [
        ...acc,
        ...subMenuKeys,
        { key: item.key,
          path: item.path
        }
      ];
    }, []);
  }

  render() {

    const {
      mode,
      location: { pathname }
    } = this.props;

    const getSelectedKeys = () => {
      const currentItem = this.getAllKeysWithPath().find(item => {
        const matched = matchPath(pathname, { path: `${basePath}${item.path}` });
        return matched; // && matched.isExact;
      });
      return [currentItem.key];
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
        { this.buildItems() }
      </Menu>
    );
  }
}

NavigatorMenu.propTypes = {
  mode: PropTypes.string.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  organisationHasDatamarts: PropTypes.func.isRequired,
  onMenuItemClick: PropTypes.func.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  organisationHasDatamarts: hasDatamarts(state),
  defaultDatamart: getDefaultDatamart(state)
});

const mapDispatchToProps = {};

NavigatorMenu = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigatorMenu);

NavigatorMenu = withRouter(NavigatorMenu);

export default NavigatorMenu;
