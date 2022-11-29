import * as React from 'react';
import { Row, Col } from 'antd';
import ReactMapGL, { Marker } from 'react-map-gl';
import Dimensions from 'react-dimensions';

interface LocationProps {
  location?: number;
  longitude: number;
  latitude: number;
  containerWidth?: number;
}

class LocationHelper extends React.Component<LocationProps> {
  render() {
    const { longitude, latitude } = this.props;

    const settings = {
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
    };

    const containerWidth = this.props.containerWidth ? this.props.containerWidth : 0;

    return longitude && latitude ? (
      <Row gutter={10} className='table-line section border-top'>
        <Col span={24} style={{ height: '100px', margin: '-5px -20px' }}>
          <ReactMapGL
            {...settings}
            width={containerWidth + 40}
            height={100}
            latitude={latitude}
            longitude={longitude}
            zoom={9}
            attributionControl={false}
            preventStyleDiffing={true}
            mapboxApiAccessToken={(global as any).window.MCS_CONSTANTS.MAPBOX_TOKEN}
          >
            <Marker latitude={latitude} longitude={longitude}>
              <svg width='10' height='10'>
                <circle cx='5' cy='5' r='5' fill='#00a1df' />
              </svg>
            </Marker>
          </ReactMapGL>
        </Col>
      </Row>
    ) : (
      <span />
    );
  }
}

export default Dimensions(LocationHelper);
