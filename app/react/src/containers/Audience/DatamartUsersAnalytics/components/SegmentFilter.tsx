import * as React from 'react';
import { Button } from 'antd';
import SegmentByNameSelector from './SegmentByNameSelector';
import chroma from 'chroma-js';
import { LabeledValue } from 'antd/lib/select';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { compose } from 'recompose';

interface SegmentFilterProps {
  className: string;
  datamartId: string;
  organisationId: string;
  onChange: (values: string[]) => void;
  onToggleAllUsersFilter: (allUsersEnabled: boolean) => void;
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


type JoinedProp = SegmentFilterProps & InjectedThemeColorsProps;

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
      lastFilterColor: this._lastFilterColor
    };
  }

  componentDidMount() {

    const { colors } = this.props;
    const { lastFilterColor } = this.state;
    this.setState({
      filterColors: chroma.scale([colors['mcs-info'], lastFilterColor]).mode('lch').colors(3)
    });
  }

  showSegmentSearch = () => {
    this.setState({
      segmentSearchDisplayed: true
    })
  }

  onSegmentByNameSelectorChange = (newValue: AppliedSegmentFilter) => {
    const { filterColors, appliedSegmentFilters } = this.state;
    const { onChange } = this.props;


    const exist = appliedSegmentFilters.find((item: AppliedSegmentFilter) => item.key === newValue.key);
    const usedColors = appliedSegmentFilters.map(item => item.color);
    if (!exist) {
      this.setState(state => {
        const newAppliedSegmentFilters = state.appliedSegmentFilters
          .concat({
            color: usedColors.includes(filterColors[0]) ? filterColors[1] : filterColors[0],
            ...newValue
          });

        const segmentIds = newAppliedSegmentFilters.slice().map((item: AppliedSegmentFilter) => item.key)
        onChange(segmentIds);
        return {
          appliedSegmentFilters: newAppliedSegmentFilters,
          segmentSearchDisplayed: false
        };
      });
    }
  }

  removeFilter = (segmentId: string) => {
    const { onChange } = this.props;
    this.setState(state => {
      const appliedSegmentFilters = state.appliedSegmentFilters.filter((item: AppliedSegmentFilter) => item.key !== segmentId);
      const segmentIds = appliedSegmentFilters.slice().map((item: AppliedSegmentFilter) => item.key)
      onChange(segmentIds);
      return {
        appliedSegmentFilters
      };
    });
  }

  toggleAllUserFilter = () => {
    const { onToggleAllUsersFilter } = this.props;
    const { allUsersEnabled } = this.state;
    onToggleAllUsersFilter(!allUsersEnabled);
    this.setState({
      allUsersEnabled: !allUsersEnabled
    })
  }

  handleOnSegmentNameFilterClick = (segmentId: string) => this.removeFilter(segmentId);

  handleOnAllUserFilterToggle = () => this.toggleAllUserFilter();

  render() {
    const { 
      segmentSearchDisplayed, 
      appliedSegmentFilters, 
      allUsersEnabled, 
      allUsersFilterColor 
    } = this.state;
    const { className, datamartId, organisationId } = this.props;
    return (
      <div className={className} id='mcs-segmentFilter'>
        <Button className={allUsersEnabled ? 'appliedSegmentName' : 'appliedSegmentName _is_disable' } ghost={true} style={{ border: `1px solid ${allUsersFilterColor}` }} onClick={this.handleOnAllUserFilterToggle}>
          <span className="oval" style={{ border: `5px solid ${allUsersFilterColor}` }} /><span className="name">All Users {allUsersEnabled}</span>
        </Button>
        {appliedSegmentFilters.map((item: AppliedSegmentFilter) =>
          <Button key={item.key} className="appliedSegmentName" ghost={true} style={{ border: `1px solid ${item.color}` }} onClick={this.handleOnSegmentNameFilterClick.bind(this, item.key)}>
            <span className="oval" style={{ border: `5px solid ${item.color}` }} /><span className="name">{item.label}</span>
          </Button>)}

        {appliedSegmentFilters.length < 2 && (!segmentSearchDisplayed ?
          <Button type="dashed" ghost={true} className="segmentFilter" icon="plus" onClick={this.showSegmentSearch}>
            <span className="placeholder">Select a segment to compare with</span>
          </Button>
          : <SegmentByNameSelector datamartId={datamartId} organisationId={organisationId} onchange={this.onSegmentByNameSelectorChange} />)}
      </div>
    )
  }
}


export default compose<SegmentFilterProps, SegmentFilterProps>(
  injectThemeColors
)(SegmentFilter);