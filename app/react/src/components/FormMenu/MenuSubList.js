
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import McsIcons from '../McsIcons';

class MenuList extends Component {

  constructor(props) {
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

MenuList.defaultProps = {
  subtitles: null
};

MenuList.propTypes = {
  title: PropTypes.string.isRequired,
  subtitles: PropTypes.arrayOf(PropTypes.string.isRequired),
  submenu: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    select: PropTypes.func.isRequired,
  }).isRequired).isRequired,
};

export default MenuList;
