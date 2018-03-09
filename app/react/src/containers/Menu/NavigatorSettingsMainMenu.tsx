import * as React from 'react';
import { Menu } from 'antd';
import * as settingsDefinitions from './settingsDefinitions';
import { FormattedMessage } from 'react-intl';
import { matchPath, RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';

// const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;

export interface NavigatorSettingsMainMenuProps {}

type Props = NavigatorSettingsMainMenuProps &
  RouteComponentProps<{ organisationId: string }>;

class NavigatorSettingsMainMenu extends React.Component<Props, any> {
  state = {
    current: 'organisation',
  };

  componentDidMount() {
    const {
      match: { params: { organisationId } },
      location: { pathname },
    } = this.props;

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

  generateMenuItems = () => {
    const { match: { params: { organisationId } } } = this.props;
    const baseUrl = `/v2/o/${organisationId}`;
    return settingsDefinitions.itemDefinitions.map(item => {
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

export default compose<Props, NavigatorSettingsMainMenuProps>(withRouter)(
  NavigatorSettingsMainMenu,
);
