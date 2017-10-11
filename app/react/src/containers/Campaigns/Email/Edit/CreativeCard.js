import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import McsIcons from '../../../../components/McsIcons.tsx';
import CreativeService from '../../../../services/CreativeService';


class CreativeCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      success: false,
    };
  }

  componentDidMount() {
    const {
      item
    } = this.props;
    this.fetchData(item.id);
  }

  componentWillReceiveProps(nextProps) {
    const {
      item
    } = this.props;

    const {
      item: nextItem
    } = nextProps;

    if (item.id !== nextItem.id) {
      this.fetchData(nextItem.id);
    }

  }


  fetchData = (id) => {
    CreativeService.getCreativeScreenshotStatus(id)
    .then(response => {
      if (response && response.data && response.data.status) {
        if (response.data.status === 'SUCCEEDED') {
          this.setState(prevState => {
            const nextState = {
              ...prevState
            };
            nextState.success = true;
            return nextState;
          });
        } else if (response.data.status === 'PENDING' || response.data.status === 'PROCESSING') {
          this.setState(prevState => {
            const nextState = {
              ...prevState
            };
            nextState.loading = true;
            return nextState;
          });
        } else if (response.data.status === 'FAILED' || response.data.status === 'NOT_TAKEN') {
          this.setState(prevState => {
            const nextState = {
              ...prevState
            };
            nextState.error = true;
            return nextState;
          });
        }
      }

    }).catch(() => {
      this.setState(prevState => {
        const nextState = {
          ...prevState
        };
        nextState.error = true;
        return nextState;
      });
    });
  }

  renderSuccessScreenshot = (record) => {
    return (
      <div>
        <div className="background-image" style={{ backgroundImage: `url('https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}')` }} />
        <div className="image-container">
          <div className="helper" />
          <img className="image" src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} />
        </div>
      </div>
    );
  }

  renderLoadingScreenshot = () => {
    return (
      <div className="text-center" style={{ lineHeight: '200px', textAlign: 'center', backgroundColor: '#bdbdbd' }}>
        <Spin />
      </div>
    );
  }

  renderErrorScreenshot = () => {
    return (
      <div className="text-center" style={{ lineHeight: '210px', textAlign: 'center', backgroundColor: '#bdbdbd' }}>
        <McsIcons className="icon-3x" type="close-big" />
      </div>
    );
  }

  render() {
    const {
      item,
      title,
      subtitles,
      footer,
    } = this.props;

    const {
      error,
      loading,
      success,
    } = this.state;

    return (
      <div className="mcs-creative-card">
        <div className="creative-cover">
          { error ? this.renderErrorScreenshot(item) : null}
          { loading ? this.renderLoadingScreenshot(item) : null}
          { success ? this.renderSuccessScreenshot(item) : null}
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
}

CreativeCard.defaultProps = {
  subtitles: null
};

CreativeCard.propTypes = {
  item: PropTypes.shape().isRequired,
  title: PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  }).isRequired,
  subtitles: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  })),
  footer: PropTypes.shape({
    key: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreativeCard;
