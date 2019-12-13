import * as React from 'react';
import McsIcon from '../McsIcon';
import cuid from 'cuid';
import { Spin } from 'antd';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { FormattedMessage } from 'react-intl';

export interface Submenu {
  title: string;
  select: React.FormEventHandler<any>;
}

export interface MenuListProps {
  title: string;
  subtitles: string[];
  submenu: Submenu[] | (() => Promise<Submenu[]>);
}

export interface MenuListState {
  open: boolean;
  fetchedMenu: Submenu[];
  fetching: boolean;
  fetched: boolean;
}

type Props = MenuListProps & InjectedNotificationProps;

class MenuList extends React.Component<Props, MenuListState> {
  constructor(props: MenuListProps & InjectedNotificationProps) {
    super(props);
    this.state = {
      open: false,
      fetching: false,
      fetched: false,
      fetchedMenu: [],
    };
  }

  fetchSubmenu = () => {
    const { submenu, notifyError } = this.props;
    if (typeof submenu === 'function') {
      this.setState({ fetching: true });
      submenu()
        .then(menu => {
          this.setState({
            fetching: false,
            fetched: true,
            fetchedMenu: menu,
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ fetching: false });
        });
    }
  };

  openMenuItem = () => {
    const { fetched } = this.state;
    if (!fetched) this.fetchSubmenu();
    this.setState({
      open: !this.state.open,
    });
  };

  render() {
    const { title, subtitles, submenu } = this.props;

    const { fetching, fetchedMenu } = this.state;

    let displayMenu: Submenu[] = fetchedMenu;
    if (Array.isArray(submenu)) {
      displayMenu = submenu;
    }

    return (
      <div className="menu-sublist">
        <button
          className={this.state.open ? 'menu-item opened' : 'menu-item'}
          onClick={this.openMenuItem}
        >
          <div className={subtitles ? 'content' : 'content alone'}>
            <div className="title">{title}</div>
            {subtitles ? (
              <div className="subtitles">
                {subtitles.map((subtitle, index) => {
                  return index !== subtitles.length - 1
                    ? `${subtitle}, `
                    : subtitle;
                })}
              </div>
            ) : null}
          </div>
          <div className="selector">
            <McsIcon type={this.state.open ? 'minus' : 'plus'} />
          </div>
        </button>
        <div className={`lines ${this.state.open ? 'opened' : 'closed'}`}>
          {fetching && (
            <div className="menu-item small">
              <div className="content alone small text-center">
                <Spin />
              </div>
            </div>
          )}
          {!fetching && !displayMenu.length && (
            <div className="menu-item small">
              <div className="content alone small text-center">
                <FormattedMessage
                  id="components.formMenu.menuSubList.empty"
                  defaultMessage="Empty"
                />
              </div>
            </div>
          )}
          {!fetching &&
            displayMenu.map(sub => {
              return (
                <button
                  key={cuid()}
                  className="menu-item small"
                  onClick={sub.select}
                >
                  <div className="content alone small">
                    <div className="subtitles">{sub.title}</div>
                  </div>
                  <div className="selector">
                    <McsIcon type={'chevron-right'} />
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    );
  }
}

export default injectNotifications(MenuList);
