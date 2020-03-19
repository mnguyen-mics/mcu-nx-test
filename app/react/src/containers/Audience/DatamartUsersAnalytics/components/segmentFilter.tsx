import * as React from 'react';
import { Button } from 'antd';
import SegmentByNameSelector from './SegmentByNameSelector';
import chroma from 'chroma-js';

interface SegmentFilterState {
  segmentSearchDisplayed: boolean;
  appliedSegmentFilters: any;
  colors: string[]
}


class SegmentFilter extends React.Component<{}, SegmentFilterState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      segmentSearchDisplayed: false,
      appliedSegmentFilters: [],
      colors: chroma.scale(['#00a1df', '#000']).mode('lch').colors(3),
    };
    this.showSegmentSearch = this.showSegmentSearch.bind(this);
    this.onchange = this.onchange.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
  }

  showSegmentSearch() {
    this.setState({
      segmentSearchDisplayed: true
    })
  }

  onchange(newValues: any) {
    const { colors } = this.state;
    this.setState(state => {
      const appliedSegmentFilters = state.appliedSegmentFilters
        .concat({
          color: colors[state.appliedSegmentFilters.length],
          ...newValues
        });
      return {
        appliedSegmentFilters,
        segmentSearchDisplayed: false
      };
    });
  }

  removeFilter(label: any) {
    this.setState(state => {
      const appliedSegmentFilters = state.appliedSegmentFilters.filter((item: any) => item.label !== label)
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

        {appliedSegmentFilters.length < 3 && (!segmentSearchDisplayed ?
          <Button type="dashed" ghost className="segmentFilter" icon="plus" onClick={this.showSegmentSearch}>
            <span className="placeholder">Select a segment to compare with</span>
          </Button>
          : <SegmentByNameSelector onchange={this.onchange} />)}
      </div>
    )
  }
}

export default SegmentFilter;
