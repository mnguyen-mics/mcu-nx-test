import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import McsIcons from '../../components/McsIcons.tsx';
import CreativeService from '../../services/CreativeService.ts';


class CreativeScreenshot extends Component {

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
      <a target="_blank" rel="noreferrer noopener" href={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`}>
        <span className="thumbnail-helper" /><img src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} />
      </a>
    );
  }

  renderLoadingScreenshot = () => {
    return (
      <Spin />
    );
  }

  renderErrorScreenshot = () => {
    return (
      <McsIcons className="icon-3x" type="close-big" />
    );
  }

  render() {
    const {
      item,
    } = this.props;

    const {
      error,
      loading,
      success,
    } = this.state;


    return (
      <div className="mcs-table-cell-thumbnail">
        { error ? this.renderErrorScreenshot() : null }
        { loading ? this.renderLoadingScreenshot() : null }
        { success ? this.renderSuccessScreenshot(item) : null }
      </div>
    );
  }
}


CreativeScreenshot.propTypes = {
  item: PropTypes.shape().isRequired,
};

export default CreativeScreenshot;
