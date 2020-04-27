import * as React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import ApiQueryWrapper from './components/helpers/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { Chart } from '../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { McsDateRangeValue } from '../../../components/McsDateRangePicker';
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

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardConfig {
  title?: string;
  layout: Layout;
  charts: Chart[];
  color?: string;
  tabMode?: boolean;
  enhancedManualReportView?: boolean;
  segments?: SegmentFilter;
}

interface SegmentFilter {
  baseSegmentId: string;
  segmentIdToCompareWith?: string;
}

interface DatamartUsersAnalyticsContentProps {
  datamartId: string;
  config: DashboardConfig[];
  dateRange: McsDateRangeValue;
  onChange: (isLoading: boolean) => void;
}

interface DatamartUsersAnalyticsContentStates {
  formattedConfig: DashboardConfig[];
  segmentsFilters: string[];
  allUsersFilter: boolean;
  filterColors: string[];
  allUsersFilterColor: string;
  lastFilterColor: string;
  generatedDom: JSX.Element[];
}

type JoinedProp = RouteComponentProps & DatamartUsersAnalyticsContentProps & InjectedThemeColorsProps;

class DatamartUsersAnalyticsContent extends React.Component<JoinedProp, DatamartUsersAnalyticsContentStates> {
  private _cuid = cuid;
  private _lastFilterColor = '#000';

  constructor(props: JoinedProp) {
    super(props);
    this.state = {
      formattedConfig: [],
      segmentsFilters: [],
      allUsersFilter: true,
      filterColors: [],
      allUsersFilterColor: props.colors['mcs-primary'],
      lastFilterColor: this._lastFilterColor,
      generatedDom: []
    }
  }

  componentDidMount() {
    const { config, colors, datamartId, onChange, dateRange } = this.props;
    const { allUsersFilterColor, lastFilterColor } = this.state;

    for (const configItem of config) {
      const currentConfigItem = { ...configItem };
      configItem.color = allUsersFilterColor;
      configItem.layout.i = this._cuid();
      config.concat(currentConfigItem);
    }

    this.setState({
      formattedConfig: config,
      filterColors: chroma.scale([colors['mcs-info'], lastFilterColor]).mode('lch').colors(3),
      generatedDom: this.generateDOM(config, datamartId, dateRange, onChange)
    });
  }

  componentDidUpdate(prevProps: DatamartUsersAnalyticsContentProps) {
    const { location: { search }, config, datamartId, onChange, dateRange } = this.props;
    const { segmentsFilters, allUsersFilter, filterColors, formattedConfig, generatedDom } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
    const currentFormattedConfig = formattedConfig.slice();

    if (!isEqual(filter.segments, segmentsFilters)) {
      const tmpDashboardConfig: DashboardConfig[] = [];
      const newGeneratedDom: JSX.Element[] = [];
      let newDashboardConfig: DashboardConfig[] = [];

      if (segmentsFilters.length < filter.segments.length) {

        const usedColors = currentFormattedConfig.map(item => item.color);

        // Add segment filter
        for(const configItem of config) {

          const currentConfigItem = {
            layout: {
              ...configItem.layout,
              i: this._cuid()
            },
            title: configItem.title,
            charts: configItem.charts.slice(),
            segments: {
              baseSegmentId: filter.segments[segmentsFilters.length]
            },
            color: usedColors.includes(filterColors[0]) ? filterColors[1] : filterColors[0]
          };

          tmpDashboardConfig.push(currentConfigItem);
        }
        newDashboardConfig = currentFormattedConfig.concat(tmpDashboardConfig);
      }
      else {
        const thedifference = difference(segmentsFilters, filter.segments);
        // Remove segment filter
        newDashboardConfig = currentFormattedConfig.filter(item => !item.segments || (item.segments && item.segments.baseSegmentId !== thedifference[0]));
        const newDashboardConfigKeys = newDashboardConfig.map(item => item.layout.i);
        newGeneratedDom.concat(generatedDom.filter((item: JSX.Element) => newDashboardConfigKeys.includes(item.key as string | undefined)))
      }

      this.setState({
        formattedConfig: newDashboardConfig,
        segmentsFilters: filter.segments,
        generatedDom: newGeneratedDom.length > 0 ? newGeneratedDom : this.generateDOM(newDashboardConfig, datamartId, dateRange, onChange)
      });
    }

    if (!isEqual(filter.allusers, allUsersFilter)) {
      this.setState(state => {

        const newDashboardConfig = !filter.allusers ? currentFormattedConfig.filter(item => item.segments) : currentFormattedConfig.concat(config);
        const newDashboardConfigKeys = newDashboardConfig.map(item => item.layout.i);
        const newGeneratedDom = filter.allusers ? this.generateDOM(newDashboardConfig, datamartId, dateRange, onChange) : generatedDom.filter((item: JSX.Element) => newDashboardConfigKeys.includes(item.key as string | undefined));
        return {
          formattedConfig: newDashboardConfig,
          allUsersFilter: filter.allusers,
          generatedDom: newGeneratedDom
        }
      });
    }

    if (
      (prevProps.dateRange.from.value && prevProps.dateRange.to.value) && 
      (prevProps.dateRange.from.value !== dateRange.from.value || prevProps.dateRange.to.value !== dateRange.to.value)) {
        this.setState({
          generatedDom: this.generateDOM(formattedConfig, datamartId, dateRange, onChange)
        });
      }

      if(!isEqual(config, prevProps.config)) {
        this.setState({
          generatedDom: this.generateDOM(
            config,
            datamartId,
            dateRange,
            onChange,
          ),
        });
      }
  }

  generateDOM(dashboardConfig: DashboardConfig[], datamartId: string, dateRange: McsDateRangeValue, onChange: (isLoading: boolean) => void) {
    return dashboardConfig.map((comp: DashboardConfig, i) => {
      return (
        <CardFlex
          title={!!comp.tabMode ? '' : comp.title}
          key={comp.layout.i && comp.layout.i.toString()}
          className={comp.layout.static ? 'static mcs-datamartUsersAnalytics_card' : 'mcs-datamartUsersAnalytics_card'}
          style={ !comp.tabMode ? { borderLeft: `5px solid ${comp.color}`} : { boxShadow: 'none' }}
        >
          {comp.charts.map((chart: Chart) => {
            return <ApiQueryWrapper
              key={comp.layout.i && comp.layout.i.toString()}
              chart={chart}
              datamartId={datamartId}
              dateRange={dateRange}
              onChange={onChange}
              segmentId={comp.segments ? comp.segments.baseSegmentId : undefined}
              compareWithSegmentId={comp.segments ? comp.segments.segmentIdToCompareWith : undefined}
              mergeDataSet={comp.enhancedManualReportView}
            />
          })}
        </CardFlex>
      );
    });
  }

  render() {
    const { formattedConfig, generatedDom } = this.state;
    const layouts = formattedConfig.map((cl) => ({ ...cl.layout }));

    return (
      <ResponsiveGridLayout className="layout mcs-datamartUsersAnalytics_components"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        { generatedDom }
      </ResponsiveGridLayout>
    );
  }
}

export default compose<DatamartUsersAnalyticsContentProps, DatamartUsersAnalyticsContentProps>(
  withRouter,
  injectThemeColors
)(DatamartUsersAnalyticsContent);