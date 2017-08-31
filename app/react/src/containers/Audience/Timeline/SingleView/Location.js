import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import ReactMapGL, { Marker } from 'react-map-gl';
import Dimensions from 'react-dimensions';

class LocationHelper extends Component {

  render() {
    const {
    longitude,
    latitude,
  } = this.props;

    const settings = {
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
    };

    return (longitude && latitude) ? (
      <Row gutter={10} className="table-line section border-top">
        <Col span={24} style={{ height: '100px', margin: '-5px -20px' }}>
          <ReactMapGL
            {...settings}
            style={{ cursor: 'default' }}
            width={this.props.containerWidth + 40}
            height={100}
            latitude={latitude}
            longitude={longitude}
            zoom={9}
            interactive={false}
            attributionControl={false}
            preventStyleDiffing
            mapboxApiAccessToken={global.window.MCS_CONSTANTS.MAPBOX_TOKEN}
          >
            <Marker
              latitude={latitude}
              longitude={longitude}
            >
              <svg width="10" height="10">
                <circle cx="5" cy="5" r="5" fill="#00a1df" />
              </svg>
            </Marker>
          </ReactMapGL>
        </Col>
      </Row>
  ) : (<span />);
  }
}

LocationHelper.defaultProps = {
  location: null,
  longitude: 0,
  latitude: 0,
};

LocationHelper.propTypes = {
  longitude: PropTypes.number,
  latitude: PropTypes.number,
  containerWidth: PropTypes.number.isRequired,
};

export default Dimensions()(LocationHelper);
