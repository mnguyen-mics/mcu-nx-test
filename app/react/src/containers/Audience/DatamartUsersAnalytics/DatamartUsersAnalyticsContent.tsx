import * as React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import ApiQueryWrapper from './components/helpers/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { Chart } from '../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { parseSearch } from '../../../utils/LocationSearchHelper';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../Segments/Dashboard/constants';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import chroma from 'chroma-js';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../Helpers/injectThemeColors';
import { isEqual, difference } from 'lodash';
import cuid from 'cuid';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardConfig {
  title?: string;
  layout: Layout;
  charts: Chart[];
  color?: string;
  tabMode?: boolean;
  segments?: SegmentFilter;
}

interface SegmentFilter {
  baseSegmentId: string;
  baseSegmentName?: string;
  segmentIdToCompareWith?: string;
  segmentToCompareWithName?: string;
}

interface DatamartUsersAnalyticsContentProps {
  datamartId: string;
  config: DashboardConfig[];
  dateRange: McsDateRangeValue;
  onChange: (isLoading: boolean) => void;
  segmentToAggregate?: boolean;
}

interface DatamartUsersAnalyticsContentStates {
  formattedConfig: DashboardConfig[];
  allUsersConfig: DashboardConfig[];
  segmentsFilters: string[];
  allUsersFilter: boolean;
  filterColors: string[];
  allUsersFilterColor: string;
  lastFilterColor: string;
  generatedDom: JSX.Element[];
}

type JoinedProp = RouteComponentProps &
  DatamartUsersAnalyticsContentProps &
  InjectedThemeColorsProps;

class DatamartUsersAnalyticsContent extends React.Component<
  JoinedProp,
  DatamartUsersAnalyticsContentStates
> {
  private _cuid = cuid;
  private _lastFilterColor = '#000';

  constructor(props: JoinedProp) {
    super(props);
    this.state = {
      formattedConfig: [],
      segmentsFilters: [],
      allUsersConfig: [],
      allUsersFilter: true,
      filterColors: [],
      allUsersFilterColor: props.colors['mcs-primary'],
      lastFilterColor: this._lastFilterColor,
      generatedDom: [],
    };
  }

  componentDidMount() {
    const { config, colors, datamartId, onChange, dateRange } = this.props;
    const { allUsersFilterColor, lastFilterColor } = this.state;
    const configItemCopy = [];
    for (const configItem of config) {
      const currentConfigItemCopy = {
        ...configItem,
        color: configItem.color || allUsersFilterColor,
        layout: {
          ...configItem.layout,
          i: this._cuid(),
        },
      };
      configItemCopy.push(currentConfigItemCopy);
    }

    this.setState({
      allUsersConfig: configItemCopy.filter(item => !item.segments),
      formattedConfig: configItemCopy,
      filterColors: chroma
        .scale([colors['mcs-info'], lastFilterColor])
        .mode('lch')
        .colors(3),
      generatedDom: this.generateDOM(
        configItemCopy,
        datamartId,
        dateRange,
        onChange,
      ),
    });
  }

  componentDidUpdate(prevProps: DatamartUsersAnalyticsContentProps) {
    const {
      location: { search },
      config,
      datamartId,
      onChange,
      dateRange,
    } = this.props;
    const {
      segmentsFilters,
      allUsersFilter,
      filterColors,
      formattedConfig,
      generatedDom,
      allUsersConfig,
    } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);

    if (!isEqual(filter.segments, segmentsFilters)) {
      const currentFormattedConfig = formattedConfig.slice();
      const tmpDashboardConfig: DashboardConfig[] = [];
      const newGeneratedDom: JSX.Element[] = [];
      let newDashboardConfig: DashboardConfig[] = [];

      if (segmentsFilters.length < filter.segments.length) {
        const usedColors = currentFormattedConfig.map(item => item.color);
        const baseSegmentId = filter.segments[segmentsFilters.length];
        // Deep copy
        const allUsersConfigCopy = JSON.parse(JSON.stringify(allUsersConfig));

        // Add segment filter
        for (const configItem of allUsersConfigCopy) {
          // Deep copy
          const chartsCopy = JSON.parse(JSON.stringify(configItem.charts));

          chartsCopy.map((c: Chart) => {
            if (c.type !== 'SINGLE_STAT') c.options.title = undefined;
            if (c.dimensionFilterClauses) {
              c.dimensionFilterClauses.operator = 'AND';
              c.dimensionFilterClauses.filters.push({
                dimension_name: 'segment_id',
                not: false,
                operator: 'EXACT',
                expressions: [baseSegmentId],
                case_sensitive: false,
              });
            }
          });

          const currentConfigItem = {
            layout: {
              ...configItem.layout,
              i: this._cuid(),
            },
            title: configItem.title,
            charts: chartsCopy,
            segments: {
              baseSegmentId,
            },
            color: usedColors.includes(filterColors[0])
              ? filterColors[1]
              : filterColors[0],
          };

          tmpDashboardConfig.push(currentConfigItem);
        }
        newDashboardConfig = currentFormattedConfig.concat(tmpDashboardConfig);
      } else {
        const thedifference = difference(segmentsFilters, filter.segments);
        // Remove segment filter
        newDashboardConfig = currentFormattedConfig.filter(
          item =>
            !item.segments ||
            (item.segments && item.segments.baseSegmentId !== thedifference[0]),
        );
        const newDashboardConfigKeys = newDashboardConfig.map(
          item => item.layout.i,
        );
        newGeneratedDom.concat(
          generatedDom.filter((item: JSX.Element) =>
            newDashboardConfigKeys.includes(item.key as string),
          ),
        );
      }

      this.setState({
        formattedConfig: newDashboardConfig,
        segmentsFilters: filter.segments,
        generatedDom:
          newGeneratedDom.length > 0
            ? newGeneratedDom
            : this.generateDOM(
                newDashboardConfig,
                datamartId,
                dateRange,
                onChange,
              ),
      });
    }

    if (!isEqual(filter.allusers, allUsersFilter)) {
      this.setState(state => {
        const currentFormattedConfig = state.formattedConfig.slice();
        const newDashboardConfig = !filter.allusers
          ? currentFormattedConfig.filter(item => item.segments)
          : currentFormattedConfig.concat(allUsersConfig);
        const newDashboardConfigKeys = newDashboardConfig.map(
          item => item.layout.i,
        );

        const newGeneratedDom = filter.allusers
          ? this.generateDOM(
              newDashboardConfig,
              datamartId,
              dateRange,
              onChange,
            )
          : state.generatedDom.filter((item: JSX.Element) =>
              newDashboardConfigKeys.includes(item.key as string),
            );
        return {
          formattedConfig: newDashboardConfig,
          allUsersFilter: filter.allusers,
          generatedDom: newGeneratedDom,
        };
      });
    }

    if (
      prevProps.dateRange.from.value &&
      prevProps.dateRange.to.value &&
      (prevProps.dateRange.from.value !== dateRange.from.value ||
        prevProps.dateRange.to.value !== dateRange.to.value)
    ) {
      this.setState({
        generatedDom: this.generateDOM(
          formattedConfig,
          datamartId,
          dateRange,
          onChange,
        ),
      });
    }

    if (!isEqual(config, prevProps.config)) {
      this.setState({
        generatedDom: this.generateDOM(config, datamartId, dateRange, onChange),
      });
    }
  }

  generateDOM = (
    dashboardConfig: DashboardConfig[],
    datamartId: string,
    dateRange: McsDateRangeValue,
    onChange: (isLoading: boolean) => void,
  ) => {
    return dashboardConfig.map((comp: DashboardConfig, i) => {
      return (
        <CardFlex
          title={!!comp.tabMode ? undefined : comp.title}
          key={comp.layout.i && comp.layout.i.toString()}
          className={
            comp.layout.static
              ? 'static mcs-datamartUsersAnalytics_card'
              : 'mcs-datamartUsersAnalytics_card'
          }
          style={
            !comp.tabMode
              ? { borderLeft: `5px solid ${comp.color}` }
              : { boxShadow: 'none' }
          }
        >
          {comp.charts.map((chart: Chart) => {
            return (
              <ApiQueryWrapper
                key={comp.layout.i && comp.layout.i.toString()}
                chart={chart}
                datamartId={datamartId}
                dateRange={dateRange}
                onChange={onChange}
                segmentId={
                  comp.segments ? comp.segments.baseSegmentId : undefined
                }
                segmentName={
                  comp.segments ? comp.segments.baseSegmentName : undefined
                }
                compareWithSegmentName={
                  comp.segments
                    ? comp.segments.segmentToCompareWithName
                    : undefined
                }
                compareWithSegmentId={
                  comp.segments
                    ? comp.segments.segmentIdToCompareWith
                    : undefined
                }
                segmentToAggregate={this.props.segmentToAggregate}
              />
            );
          })}
        </CardFlex>
      );
    });
  };

  render() {
    const { formattedConfig, generatedDom } = this.state;
    const layouts = formattedConfig.map(cl => ({ ...cl.layout }));

    return (
      <ResponsiveGridLayout
        className="layout mcs-datamartUsersAnalytics_components"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}
        // resizeHandle={<div />}
      >
        {generatedDom}
      </ResponsiveGridLayout>
    );
  }
}

export default compose<
  DatamartUsersAnalyticsContentProps,
  DatamartUsersAnalyticsContentProps
>(
  withRouter,
  injectThemeColors,
)(DatamartUsersAnalyticsContent);
