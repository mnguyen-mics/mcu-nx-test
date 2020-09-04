import React, { Component } from 'react';
import * as ReactSimpleMaps from 'react-simple-maps';
import messages from '../Overview/messages';
import {compose} from 'recompose';
import { injectIntl } from 'react-intl';
import InjectedIntlProps = ReactIntl.InjectedIntlProps;
import {scaleLinear} from 'd3-scale';
import { EmptyChart } from '@mediarithmics-private/mcs-components-library';

interface UsersMapProps {
  projection: string;
  scale: number;
  hasFetchedVisitReport: boolean;
  isFetchingVisitReport: boolean;
  report: any[];
  colors: { [s: string]: string };
}

class UsersMap extends Component<UsersMapProps & InjectedIntlProps> {

  mapReportByCountry() {
    const { report } = this.props;
    const countryReport: {[s: string]: any} = {};
    report.forEach((row: any) => {
      countryReport[row.country] = row.count;
    });
    return countryReport;
  }

  extractMaxCount() {
    const { report } = this.props;
    const result = report.reduce((max: number, row: any) => {
      return row.count > max ? row.count : max;
    }, 0);
    return result;
  }

  render() {
    const { colors, report, hasFetchedVisitReport, intl: { formatMessage } } = this.props;
    const countryReport: {[s: string]: number} = this.mapReportByCountry();

    const maxDomain = this.extractMaxCount();
    const popScale = scaleLinear<string>()
      .domain([0, maxDomain])
      .range([colors['mcs-info'], colors['mcs-primary']]);

    return ((report && report.length === 0 || !hasFetchedVisitReport)) ?
        <EmptyChart title={formatMessage(messages.no_visit_stat)} icon='warning' /> :
        (
          <div>
            <ReactSimpleMaps.ComposableMap
              projection={this.props.projection}
              projectionConfig={{
                scale: this.props.scale,
                rotation: [0, 0, 0],
              }}
              width={980}
              height={551}
              style={{
                width: '100%',
                height: 'auto',
              }}
            >
              <ReactSimpleMaps.ZoomableGroup center={[0, 20]} disablePanning={true}>
                <ReactSimpleMaps.Geographies geography="/react/src/assets/map/countries-topojson.json">
                  {(geographies: any, projection: any) => geographies.map((geography: any, i: number) => geography.id !== 'ATA' && (
                    <ReactSimpleMaps.Geography
                      key={i}
                      geography={geography}
                      projection={projection}
                      style={{
                        default: {
                          fill: popScale(countryReport[geography.properties.name] ?
                                         countryReport[geography.properties.name] : 100),
                          stroke: colors['mcs-normal'],
                          strokeWidth: 0.75,
                          outline: 'none',
                        },
                        hover: {
                          fill: colors['mcs-primary'],
                          stroke: colors['mcs-normal'],
                          strokeWidth: 0.75,
                          outline: 'none',
                        },
                        pressed: {
                          fill: colors['mcs-warning'],
                          stroke: colors['mcs-normal'],
                          strokeWidth: 0.75,
                          outline: 'none',
                        },
                      }}
                    />
                  ))}
                </ReactSimpleMaps.Geographies>
              </ReactSimpleMaps.ZoomableGroup>
            </ReactSimpleMaps.ComposableMap>
          </div>
        );
  }
}

export default compose<UsersMapProps, any>(
  injectIntl,
)(UsersMap);
