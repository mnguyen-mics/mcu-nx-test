
import React from 'react';
import PropTypes from 'prop-types';
import McsIcons from '../McsIcons.tsx';

function MenuList(props) {

  const {
      title,
      subtitles,
      select,
    } = props;

  return (
    <div className="menu-sublist">
      <button className="menu-item" onClick={select}>
        <div className={subtitles ? 'content' : 'content alone'}>
          <div className="title">{title}</div>
          {subtitles ? <div className="subtitles">{ subtitles.map((subtitle, index) => {
            return index !== subtitles.length - 1 ? `${subtitle}, ` : subtitle;
          }) }</div> : null}
        </div>
        <div className="selector">
          <McsIcons type="chevron-right" />
        </div>
      </button>
    </div>
  );
}

MenuList.defaultProps = {
  subtitles: null
};

MenuList.propTypes = {
  title: PropTypes.string.isRequired,
  subtitles: PropTypes.arrayOf(PropTypes.string.isRequired),
  select: PropTypes.func.isRequired,
};

export default MenuList;
