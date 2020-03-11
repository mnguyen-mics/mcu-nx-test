import * as React from 'react';
import { Menu } from 'antd';
import { settingsDefinitions } from '../../routes/settingsDefinition';
import { FormattedMessage } from 'react-intl';
import { matchPath, RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  hasDatamarts,
} from '../../state/Session/selectors';
import { getOrgFeatures } from '../../state/Features/selectors';
import { injectFeatures, InjectedFeaturesProps } from '../Features';
import { NavigatorMenuDefinition } from '../../routes/domain';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface NavigatorSettingsMainMenuProps {
}

interface NavigatorSettingsMainMenuStoreProps {
  organisationHasDatamarts: (organisationId: string) => boolean;
  orgFeatures: string[];
}

type Props = NavigatorSettingsMainMenuProps &
  RouteComponentProps<{ organisationId: string }> & 
  NavigatorSettingsMainMenuStoreProps &
  InjectedFeaturesProps;


const basePath = '/v2/o/:organisationId(\\d+)';

interface State{
  current: string;
}

class NavigatorSettingsMainMenu extends React.Component<Props, State> {
  state = {
    current: 'settings',
  };

  componentDidMount() {
    const {
      match: { params: { organisationId } },
      location: { pathname },
    } = this.props;

    this.initMenu(pathname, organisationId)
  }

  componentDidUpdate() {
    const {
      match: { params: { organisationId } },
      location: { pathname },
    } = this.props;

    this.initMenu(pathname, organisationId)
  }

  initMenu = (pathname: string, organisationId: string) => {
    const currentOpenMenu = settingsDefinitions
      .filter(item => item.type === 'multi' && item.subMenuItems && item.subMenuItems.length > 0)
      .find(
        item => item.type === 'multi' && item.subMenuItems.reduce((acc: boolean, val) => {
          return matchPath(pathname, { path: `${basePath}${val.path}`, exact: false, strict: false }) ? true : acc;
        }, false)
      );
    if (currentOpenMenu && currentOpenMenu.iconType !== this.state.current) {
      this.setState({ current: currentOpenMenu.iconType });
    }
  }

  handleClick = (e: any) => {
    const {} = this.props;
    this.setState({
      current: e.key,
    });
  };

  getAvailableItems = (): NavigatorMenuDefinition[] => {
    const {
      hasFeature,
    } = this.props;

    const checkIfHasAtLeastOneFeature = (item: NavigatorMenuDefinition): boolean => {
      if (item.type === 'simple') {
        return hasFeature(item.requiredFeature, item.requireDatamart)
      }
      return item.subMenuItems.reduce((acc, val) => {
        return hasFeature(val.requiredFeature, val.requireDatamart) ? hasFeature(val.requiredFeature, val.requireDatamart) : acc;
      }, false)
    }

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
  }

  generateMenuItems = () => {
    const { match: { params: { organisationId } } } = this.props;
    const baseUrl = `/v2/o/${organisationId}`;
    return this.getAvailableItems().map((item) => {
      return (
        <Menu.Item key={item.iconType}>
          <Link
            to={`${baseUrl}${
              item.type === 'multi' && item.subMenuItems && item.subMenuItems.length
                ? item.subMenuItems[0].path
                : item.type === 'simple' && item.path
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

const mapStateToProps = (state: MicsReduxState) => ({
  organisationHasDatamarts: hasDatamarts(state),
  orgFeatures: getOrgFeatures(state),
});

const mapDispatchToProps = {};

export default compose<Props, NavigatorSettingsMainMenuProps>(
  withRouter,
  injectFeatures,
  connect(mapStateToProps, mapDispatchToProps),
)(
  NavigatorSettingsMainMenu,
);
