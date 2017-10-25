
import React, { Component } from 'react';
import McsIcons from '../McsIcons';

interface Submenu {
  title: string;
  select: React.FormEventHandler<any>;
}

export interface MenuListProps {
  title: string;
  subtitles: string[];
  submenu: Submenu[];
}

export interface MenuListState {
  open: boolean;
}

class MenuList extends Component<MenuListProps, MenuListState> {

  constructor(props: MenuListProps) {
    super(props);
    this.state = {
      open: false,
    };
  }

  openMenuItem = () => {
    return this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const {
      title,
      subtitles,
      submenu,
    } = this.props;
    return (
      <div className="menu-sublist">
        <button className={this.state.open ? 'menu-item opened' : 'menu-item'} onClick={this.openMenuItem}>
          <div className={subtitles ? 'content' : 'content alone'}>
            <div className="title">{title}</div>
            {subtitles ? <div className="subtitles">{ subtitles.map((subtitle, index) => {
              return index !== subtitles.length - 1 ? `${subtitle}, ` : subtitle;
            }) }</div> : null}
          </div>
          <div className="selector">
            <McsIcons type={this.state.open ? 'minus' : 'plus'} />
          </div>
        </button>
        <div className={`lines ${this.state.open ? 'opened' : 'closed'}`}>
          {submenu && submenu.map(sub => {
            return (
              <button key={sub.title} className="menu-item small" onClick={sub.select}>
                <div className="content alone small">
                  <div className="subtitles">{sub.title}</div>
                </div>
                <div className="selector"><McsIcons type={'chevron-right'} /></div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

export default MenuList;
