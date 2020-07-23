import * as React from 'react';
import { Button } from 'antd';
import SegmentByNameSelector from './SegmentByNameSelector';
import chroma from 'chroma-js';
import { LabeledValue } from 'antd/lib/select';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { AudienceSegmentType } from '../../../../models/audiencesegment';

const messages = defineMessages({
  allUsers: {
    id: 'audience.segments.datamartUsersAnalytics.segmentFilter.allUsers',
    defaultMessage: 'All Users',
  },
  segmentFilterPlaceholder: {
    id: 'audience.segments.datamartUsersAnalytics.segmentFilter.placeholder',
    defaultMessage: 'Select a segment to compare with',
  },
});

interface SegmentFilterProps {
  className: string;
  datamartId: string;
  organisationId: string;
  disableAllUserFilter?: boolean;
  hideAllUsersButton?: boolean;
  defaultSegment?: LabeledValue;
  defaultSegmentCanBeRemoved?: boolean;
  onChange: (values: string[]) => void;
  onToggleAllUsersFilter: (allUsersEnabled: boolean) => void;
  segmentcolors?: string[];
  segmentFiltersLength?: number;
  placeholder?: string;
  segmentType?: AudienceSegmentType;
}
interface SegmentFilterState {
  segmentSearchDisplayed: boolean;
  appliedSegmentFilters: AppliedSegmentFilter[];
  allUsersEnabled: boolean;
  filterColors: string[];
  allUsersFilterColor: string;
  lastFilterColor: string;
}

interface AppliedSegmentFilter extends LabeledValue {
  color: string;
}

type JoinedProp = SegmentFilterProps &
  InjectedThemeColorsProps &
  InjectedIntlProps;

class SegmentFilter extends React.Component<JoinedProp, SegmentFilterState> {
  private _lastFilterColor = '#000';

  constructor(props: JoinedProp) {
    super(props);
    this.state = {
      segmentSearchDisplayed: false,
      appliedSegmentFilters: [],
      filterColors: [],
      allUsersEnabled: true,
      allUsersFilterColor: props.colors['mcs-primary'],
      lastFilterColor: this._lastFilterColor,
    };
  }

  componentDidMount() {
    const {
      colors,
      defaultSegment,
      disableAllUserFilter,
      segmentcolors,
    } = this.props;
    const { lastFilterColor } = this.state;
    this.setState({
      filterColors: segmentcolors
        ? segmentcolors
        : chroma
            .scale([colors['mcs-info'], lastFilterColor])
            .mode('lch')
            .colors(3),
    });

    if (defaultSegment) {
      this.onSegmentByNameSelectorChange({
        ...defaultSegment,
        color: segmentcolors ? segmentcolors[0] : colors['mcs-info'],
      });
    }

    if (disableAllUserFilter) {
      this.toggleAllUserFilter();
    }
  }

  componentDidUpdate(prevProps: JoinedProp) {
    const { defaultSegment, segmentcolors, colors } = this.props;
    const { defaultSegment: prevDefaultSegment } = prevProps;
    if (!defaultSegment && prevDefaultSegment) {
      this.removeFilter(prevDefaultSegment.key);
    }
    if(defaultSegment && !prevDefaultSegment) {
      this.onSegmentByNameSelectorChange({
        ...defaultSegment,
        color: segmentcolors ? segmentcolors[0] : colors['mcs-info'],
      });
    }
  }

  showSegmentSearch = () => {
    this.setState({
      segmentSearchDisplayed: true,
    });
  };

  onSegmentByNameSelectorChange = (newValue: AppliedSegmentFilter) => {
    const { filterColors, appliedSegmentFilters } = this.state;
    const { onChange } = this.props;

    const exist = appliedSegmentFilters.find(
      (item: AppliedSegmentFilter) => item.key === newValue.key,
    );
    const usedColors = appliedSegmentFilters.map(item => item.color);
    if (!exist) {
      this.setState(state => {
        const newAppliedSegmentFilters = state.appliedSegmentFilters.concat({
          color: usedColors.includes(filterColors[0])
            ? filterColors[1]
            : filterColors[0],
          ...newValue,
        });

        const segmentIds = newAppliedSegmentFilters
          .slice()
          .map((item: AppliedSegmentFilter) => item.key);
        onChange(segmentIds);
        return {
          appliedSegmentFilters: newAppliedSegmentFilters,
          segmentSearchDisplayed: false,
        };
      });
    }
  };

  removeFilter = (segmentId: string) => {
    const { onChange, defaultSegment, defaultSegmentCanBeRemoved } = this.props;

    if (
      !defaultSegment ||
      (defaultSegment && defaultSegment.key !== segmentId) ||
      defaultSegmentCanBeRemoved
    ) {
      this.setState(state => {
        const appliedSegmentFilters = state.appliedSegmentFilters.filter(
          (item: AppliedSegmentFilter) => item.key !== segmentId,
        );
        const segmentIds = appliedSegmentFilters
          .slice()
          .map((item: AppliedSegmentFilter) => item.key);
        onChange(segmentIds);
        return {
          appliedSegmentFilters,
        };
      });
    }
  };

  toggleAllUserFilter = () => {
    const { onToggleAllUsersFilter } = this.props;
    const { allUsersEnabled } = this.state;
    onToggleAllUsersFilter(!allUsersEnabled);
    this.setState({
      allUsersEnabled: !allUsersEnabled,
    });
  };

  handleOnSegmentNameFilterClick = (segmentId: string) =>
    this.removeFilter(segmentId);

  handleOnAllUserFilterToggle = () => this.toggleAllUserFilter();

  render() {
    const {
      segmentSearchDisplayed,
      appliedSegmentFilters,
      allUsersEnabled,
      allUsersFilterColor,
    } = this.state;
    const {
      className,
      datamartId,
      organisationId,
      hideAllUsersButton,
      segmentFiltersLength,
      intl,
      placeholder,
      segmentType,
    } = this.props;
    const appliedSegmentFiltersLength = segmentFiltersLength || 2;
    return (
      <div className={className} id="mcs-segmentFilter">
        {!hideAllUsersButton && (
          <Button
            className={
              allUsersEnabled
                ? 'appliedSegmentName'
                : 'appliedSegmentName _is_disable'
            }
            ghost={true}
            style={{ border: `1px solid ${allUsersFilterColor}` }}
            onClick={this.handleOnAllUserFilterToggle}
          >
            <span
              className="oval"
              style={{ border: `5px solid ${allUsersFilterColor}` }}
            />
            <span className="name">
              {intl.formatMessage(messages.allUsers)}
            </span>
          </Button>
        )}
        {appliedSegmentFilters.map((item: AppliedSegmentFilter) => (
          <Button
            key={item.key}
            className="appliedSegmentName"
            ghost={true}
            style={{ border: `1px solid ${item.color}` }}
            onClick={this.handleOnSegmentNameFilterClick.bind(this, item.key)}
          >
            <span
              className="oval"
              style={{ border: `5px solid ${item.color}` }}
            />
            <span className="name">{item.label}</span>
          </Button>
        ))}

        {appliedSegmentFilters.length < appliedSegmentFiltersLength &&
          (!segmentSearchDisplayed ? (
            <Button
              type="dashed"
              ghost={true}
              className="segmentFilter"
              icon="plus"
              onClick={this.showSegmentSearch}
            >
              <span className="placeholder">
                {placeholder ||
                  intl.formatMessage(messages.segmentFilterPlaceholder)}
              </span>
            </Button>
          ) : (
            <SegmentByNameSelector
              datamartId={datamartId}
              organisationId={organisationId}
              onchange={this.onSegmentByNameSelectorChange}
              segmentType={segmentType}
            />
          ))}
      </div>
    );
  }
}

export default compose<SegmentFilterProps, SegmentFilterProps>(
  injectThemeColors,
  injectIntl,
)(SegmentFilter);
