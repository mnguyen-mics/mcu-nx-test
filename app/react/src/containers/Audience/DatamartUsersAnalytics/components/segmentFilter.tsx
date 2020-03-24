import * as React from 'react';
import { Button } from 'antd';
import SegmentByNameSelector from './SegmentByNameSelector';
import chroma from 'chroma-js';
import { LabeledValue } from 'antd/lib/select';

interface SegmentFilterProps {
  className: string;
  onChange: (values: string[]) => void;
}
interface SegmentFilterState {
  segmentSearchDisplayed: boolean;
  appliedSegmentFilters: AppliedSegmentFilter[];
  colors: string[];
}

interface AppliedSegmentFilter extends LabeledValue {
  color: string;
}

class SegmentFilter extends React.Component<SegmentFilterProps, SegmentFilterState> {

  private _firstFilterColor = '#00a1df';
  private _lastFilterColor = '#000';
  private _allUserFilterColor = '#003056';

  constructor(props: SegmentFilterProps) {
    super(props);
    this.state = {
      segmentSearchDisplayed: false,
      appliedSegmentFilters: [],
      colors: chroma.scale([this._firstFilterColor, this._lastFilterColor]).mode('lch').colors(3),
    };
    this.showSegmentSearch = this.showSegmentSearch.bind(this);
    this.onSegmentByNameSelectorChange = this.onSegmentByNameSelectorChange.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.handleOnSegmentNameFilterClick = this.handleOnSegmentNameFilterClick.bind(this);
  }

  showSegmentSearch() {
    this.setState({
      segmentSearchDisplayed: true
    })
  }

  onSegmentByNameSelectorChange(newValue: AppliedSegmentFilter) {
    const { colors, appliedSegmentFilters } = this.state;
    const { onChange } = this.props;


    const exist = appliedSegmentFilters.find((item: AppliedSegmentFilter) => item.key === newValue.key)
    if (!exist) {
      this.setState(state => {
        const newAppliedSegmentFilters = state.appliedSegmentFilters
          .concat({
            color: colors[state.appliedSegmentFilters.length],
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

  removeFilter(segmentId: string) {
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

  handleOnSegmentNameFilterClick = (segmentId: string) => this.removeFilter(segmentId);

  render() {
    const { segmentSearchDisplayed, appliedSegmentFilters } = this.state;
    const { className } = this.props;
    return (
      <div className={className}>
        <Button className="appliedSegmentName" ghost={true} style={{ border: `1px solid ${this._allUserFilterColor}` }}>
          <span className="oval" style={{ border: `5px solid ${this._allUserFilterColor}` }} /><span className="name">All Users</span>
        </Button>
        {appliedSegmentFilters.map((item: AppliedSegmentFilter) =>
          <Button key={item.key} className="appliedSegmentName" ghost={true} style={{ border: `1px solid ${item.color}` }} onClick={this.handleOnSegmentNameFilterClick.bind(this, item.key)}>
            <span className="oval" style={{ border: `5px solid ${item.color}` }} /><span className="name">{item.label}</span>
          </Button>)}

        {appliedSegmentFilters.length < 2 && (!segmentSearchDisplayed ?
          <Button type="dashed" ghost={true}  className="segmentFilter" icon="plus" onClick={this.showSegmentSearch}>
            <span className="placeholder">Select a segment to compare with</span>
          </Button>
          : <SegmentByNameSelector onchange={this.onSegmentByNameSelectorChange} />)}
      </div>
    )
  }
}

export default SegmentFilter;
