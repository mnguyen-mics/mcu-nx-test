
import React from 'react';
import PropTypes from 'prop-types';
import McsIcons from '../McsIcons';

function MenuPresentational(props) {

  const {
      title,
      subtitles,
      select,
      type,
    } = props;

  return (
    <button className="presentation-item" onClick={select}>
      <div className="content">
        <McsIcons type={type} />
        <div className="title">
          {title}
        </div>
        <div className="subtitle">
          { subtitles && subtitles.map(subtitle => {
            return `${subtitle}, `;
          }) }
        </div>
      </div>
    </button>
  );
}

MenuPresentational.defaultProps = {
  subtitles: null,
  type: 'image',
};

MenuPresentational.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  subtitles: PropTypes.arrayOf(PropTypes.string.isRequired),
  select: PropTypes.func.isRequired,
};

export default MenuPresentational;
