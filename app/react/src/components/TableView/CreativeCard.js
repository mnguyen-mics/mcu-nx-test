import React from 'react';
import PropTypes from 'prop-types';


function CreativeCard(props) {

  const {
      item,
      cover,
      title,
      subtitles,
      footer,
    } = props;

  return (
    <div className="mcs-creative-card">
      <div className="creative-cover">
        <div className="background-image" style={{ backgroundImage: `url('${cover.render(item[cover.key], item)}')` }} />
        <div className="image-container">
          <div className="helper" />
          <img className="image" src={cover.render(item[cover.key], item)} alt={item.id} />
        </div>
      </div>
      <div className="creative-details">
        <div className="title">{ title.render(item[title.key], item) }</div>
        { subtitles && subtitles.length && subtitles.map(subtitle => {
          return <div key={subtitle.key} className="subtitle"><span>{ subtitle.render(item[subtitle.key], item) }</span></div>;
        }) }
      </div>
      <div className="creative-footer">
        { footer.render(item[footer.key], item) }
      </div>
    </div>
  );
}

CreativeCard.defaultProps = {
  subtitles: null
};

CreativeCard.propTypes = {
  item: PropTypes.shape().isRequired,
  cover: PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  }).isRequired,
  title: PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  }).isRequired,
  subtitles: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  }).isRequired),
  footer: PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreativeCard;
