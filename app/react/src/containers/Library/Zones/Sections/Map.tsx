import * as React from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { compose } from 'recompose';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
const MapboxDraw = require('@mapbox/mapbox-gl-draw');
import generateStyle from './Styles';
import { Upload, Button } from 'antd';
import { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { McsIcon } from '../../../../components';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';

export interface MapProps {
  showDraw?: boolean;
  onDraw?: (e: GeoJSON.FeatureCollection) => void;
  initialZones?: GeoJSON.FeatureCollection;
}

const messages = defineMessages({
  draw: {
    id: 'map.draw',
    defaultMessage: 'Draw Polygon'
  },
  upload: {
    id: 'map.upload',
    defaultMessage: 'Add Custom Json'
  },
  delete: {
    id: 'map.delete',
    defaultMessage: 'Delete'
  },
})

mapboxgl.accessToken = (window as any).MCS_CONSTANTS.MAPBOX_TOKEN

type JoinedProps = MapProps & InjectedThemeColorsProps & InjectedNotificationProps & InjectedIntlProps;

interface State {
  canDelete: boolean;
}

class MapboxGl extends React.Component<JoinedProps, State> {

  map: Map | undefined;
  mapContainer: string |Element;
  draw: any;

  constructor(props: JoinedProps) {
    super(props)
    this.state = {
      canDelete: false
    }
  }

  componentDidMount() {
    this.buildMap()
    document.addEventListener('keydown', this.onKeydown)
  }

  onKeydown = (event: KeyboardEvent) => {
    const keyName = event.key;
    if (keyName === 'Delete') {
      this.deleteSelected()
    }
  }

  componentWillReceiveProps(nextProps: MapProps) {
    if (this.props.initialZones !== nextProps.initialZones && nextProps.initialZones) {
      this.buildLayerFromGeoJSON(nextProps.initialZones)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
  }

  deleteSelected = () => {
    this.draw.delete(this.draw.getSelectedIds())
    this.updateArea()
  }
  

  buildMap = () => {
    const {
      initialZones,
      colors
    } = this.props;

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [2.333333, 48.866667], // starting position
      zoom: 6 // starting zoom
    });

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
      },
      styles: generateStyle(colors)
    });
    MapboxDraw.modes.draw_polygon = require('mapbox-gl-draw-freehand-mode').default;
    this.map.addControl(this.draw);
    this.map.on('draw.create', this.updateArea);
    this.map.on('draw.delete', this.updateArea);
    this.map.on('draw.update', this.updateArea);
    this.map.on('draw.selectionchange', this.updateSelection)
    this.map.on('load', () => {
      if (this.map && initialZones)
        this.buildLayerFromGeoJSON(initialZones)
    })
  }

  updateSelection = () => {
    if (this.draw && this.draw.getSelectedIds() && this.draw.getSelectedIds().length) {
      this.setState({ canDelete: true })
    } else {
      this.setState({ canDelete: false })
    }
  }

  buildLayerFromGeoJSON = (zone: GeoJSON.FeatureCollection) => {
    this.draw.deleteAll();
    this.draw.add(zone);
  }

  updateArea = () => {
    const data = this.draw.getAll();
    if (this.props.onDraw) {
      this.props.onDraw(data)
    }
    this.updateSelection()
      
  }

  drawPolygon = () => {
    this.draw.changeMode('draw_polygon')
  }

  checkIfValidGeoJSON = (content: any): boolean => {
    try {
      // const contentParsed = JSON.parse(content)
      // TODO: validate the json
      return true;
    } catch(e) {
      return false;
    }
  } 

  onFileUpdate = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (fileLoadedEvent: any) => {
        const textFromFileLoaded = fileLoadedEvent.target.result;
        return resolve(textFromFileLoaded);
      };

      fileReader.readAsText(file, 'UTF-8');
    });
  };

  render() {
    
    const {
      notifyError,
      intl: {
        formatMessage
      }
    } = this.props;

    const style: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%'
    };
    const buttonStyle: React.CSSProperties = {
      position: 'absolute',
      top: 10,
      right: 40
    }
    const assignRef = (el: HTMLDivElement) => this.mapContainer = el;

    const uploadProps: UploadProps = {
      action: '/',
      beforeUpload: (uploadFile: UploadFile) => {
        this.onFileUpdate(uploadFile).then(res => {
          const valid = this.checkIfValidGeoJSON(res)
          if (valid) {
            this.buildLayerFromGeoJSON(JSON.parse(res) as GeoJSON.FeatureCollection);
            this.updateArea()
          } else {
            notifyError({ error: 'Not a valid GeoJSON', status: 'error', error_id: '' })
          }
        })
        return false;
      },
      multiple: false,
      showUploadList: false
    };
  
    return (
      <div style={style}>
        <div style={style} ref={assignRef} />
        <div style={buttonStyle}>
            <Button size="default" htmlType="button" onClick={this.drawPolygon} className="m-r-10"><McsIcon type="pen" /> {formatMessage(messages.draw)}</Button>
            <Upload {...uploadProps}>
              <Button size="default" htmlType="button" className="m-r-10"><McsIcon type="download" /> {formatMessage(messages.upload)}</Button>
            </Upload>
            <Button disabled={!this.state.canDelete} size="default" htmlType="button" onClick={this.deleteSelected}><McsIcon type="delete" /> {formatMessage(messages.delete)}</Button>
        </div>
      </div>);

  }
}

export default compose<JoinedProps, MapProps>(
  injectNotifications,
  injectThemeColors,
  injectIntl
)(MapboxGl);
