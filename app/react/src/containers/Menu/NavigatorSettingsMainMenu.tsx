import * as React from 'react';
import { Menu } from 'antd';
import * as settingsDefinitions from './settingsDefinitions';
import { FormattedMessage } from 'react-intl';
import { matchPath, RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  hasDatamarts,
  getDefaultDatamart,
} from '../../state/Session/selectors';
import { getOrgFeatures } from '../../state/Features/selectors';
import { Datamart } from '../../models/organisation/organisation';

export interface NavigatorSettingsMainMenuProps {
}

interface NavigatorSettingsMainMenuStoreProps {
  organisationHasDatamarts: (organisationId: string) => boolean;
  defaultDatamart: (organisationId: string) => Datamart;
  orgFeatures: string[];
}

type Props = NavigatorSettingsMainMenuProps &
  RouteComponentProps<{ organisationId: string }> & 
  NavigatorSettingsMainMenuStoreProps;

class NavigatorSettingsMainMenu extends React.Component<Props, any> {
  state = {
    current: 'organisation',
  };

  componentDidMount() {
    const {
      match: { params: { organisationId } },
      location: { pathname },
    } = this.props;

    this.initMenu(pathname, organisationId)
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: { params: { organisationId } },
      location: { pathname },
    } = nextProps;

    this.initMenu(pathname, organisationId)
  }

  initMenu = (pathname: string, organisationId: string) => {
    const baseUrl = `/v2/o/${organisationId}`;
    const currentOpenMenu = settingsDefinitions.itemDefinitions
      .filter(item => item.subMenuItems && item.subMenuItems.length > 0)
      .find(
        item =>
          matchPath(pathname, {
            path: `${baseUrl}${item.path}`,
            exact: false,
            strict: false,
          })
            ? true
            : false,
      );
    if (currentOpenMenu) {
      this.setState({ current: currentOpenMenu.key });
    }
  }

  handleClick = (e: any) => {
    const {} = this.props;
    this.setState({
      current: e.key,
    });
  };

  getAvailableItems() {
    const {
      match: { params: { organisationId } },
      organisationHasDatamarts,
      orgFeatures,
    } = this.props;

    const itemDefinitions = settingsDefinitions.itemDefinitions;
    const itemDisplayedOnlyIfDatamart = settingsDefinitions.itemDisplayedOnlyIfDatamart;

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

  generateMenuItems = () => {
    const { match: { params: { organisationId } } } = this.props;
    const baseUrl = `/v2/o/${organisationId}`;
    return this.getAvailableItems().map(item => {
      return (
        <Menu.Item key={item.key}>
          <Link
            to={`${baseUrl}${
              item.subMenuItems && item.subMenuItems.length
                ? item.subMenuItems[0].path
                : item.path
            }`}
          >
            <FormattedMessage {...item.translation} />
          </Link>
        </Menu.Item>
      );
    });
  };

  render() {
    return (
      <Menu
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
        style={{ padding: '0 40px' }}
      >
        {this.generateMenuItems()}
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

export default compose<Props, NavigatorSettingsMainMenuProps>(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(
  NavigatorSettingsMainMenu,
);
