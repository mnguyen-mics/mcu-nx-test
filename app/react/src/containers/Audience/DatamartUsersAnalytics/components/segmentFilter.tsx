import * as React from 'react';
import { Button } from 'antd';
import SegmentByNameSelector from './SegmentByNameSelector';
import chroma from 'chroma-js';

interface SegmentFilterProps {
  onChange: (values: string[]) => void;
}
interface SegmentFilterState {
  segmentSearchDisplayed: boolean;
  appliedSegmentFilters: any;
  colors: string[];
}


class SegmentFilter extends React.Component<SegmentFilterProps, SegmentFilterState> {
  constructor(props: SegmentFilterProps) {
    super(props);
    this.state = {
      segmentSearchDisplayed: false,
      appliedSegmentFilters: [],
      colors: chroma.scale(['#00a1df', '#000']).mode('lch').colors(3),
    };
    this.showSegmentSearch = this.showSegmentSearch.bind(this);
    this.onSegmentByNameSelectorChange = this.onSegmentByNameSelectorChange.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
  }

  showSegmentSearch() {
    this.setState({
      segmentSearchDisplayed: true
    })
  }

  onSegmentByNameSelectorChange(newValues: any) {
    const { colors, appliedSegmentFilters } = this.state;
    const { onChange } = this.props;


    const exist = appliedSegmentFilters.find((item: any) => item.key === newValues.key)
    if (!exist) {
      this.setState(state => {
        const appliedSegmentFilters = state.appliedSegmentFilters
          .concat({
            color: colors[state.appliedSegmentFilters.length],
            ...newValues
          });
  
          const segmentIds = appliedSegmentFilters.slice().map((item: any) => item.key)
          onChange(segmentIds);
        return {
          appliedSegmentFilters,
          segmentSearchDisplayed: false
        };
      });
    }

  }

  removeFilter(label: any) {
    const { onChange } = this.props;
    this.setState(state => {
      const appliedSegmentFilters = state.appliedSegmentFilters.filter((item: any) => item.label !== label);
      const segmentIds = appliedSegmentFilters.slice().map((item: any) => item.key)
      onChange(segmentIds);
      return {
        appliedSegmentFilters
      };
    });
  }


  render() {
    const { segmentSearchDisplayed, appliedSegmentFilters } = this.state;
    return (
      <div>
        <Button className="appliedSegmentName" ghost style={{ border: `1px solid #003056` }}>
          <span className="oval" style={{ border: `5px solid #003056` }}></span><span className="name">All Users</span>
        </Button>
        {appliedSegmentFilters.map((item: any, index: number) =>
          <Button className="appliedSegmentName" ghost style={{ border: `1px solid ${item.color}` }} onClick={() => this.removeFilter(item.label)}>
            <span className="oval" style={{ border: `5px solid ${item.color}` }}></span><span className="name">{item.label}</span>
          </Button>)}

        {appliedSegmentFilters.length < 2 && (!segmentSearchDisplayed ?
          <Button type="dashed" ghost className="segmentFilter" icon="plus" onClick={this.showSegmentSearch}>
            <span className="placeholder">Select a segment to compare with</span>
          </Button>
          : <SegmentByNameSelector onchange={this.onSegmentByNameSelectorChange} />)}
      </div>
    )
  }
}

export default SegmentFilter;
