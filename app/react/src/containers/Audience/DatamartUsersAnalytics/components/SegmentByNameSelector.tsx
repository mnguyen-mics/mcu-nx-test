import * as React from 'react';
import { Select, Spin } from 'antd';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import SegmentNameDisplay from '../../Common/SegmentNameDisplay';
import debounce from 'lodash/debounce';
import { McsIcon } from '../../../../components';
import { LabeledValue } from 'antd/lib/select';

interface SegmentByNameSelectorState {
  segmentsList: LabeledValue[];
  value?: LabeledValue;
  fetching: boolean;
}

interface SegmentByNameSelectorProps {
  onchange: (value: LabeledValue) => void
}

class SegmentByNameSelector extends React.Component<SegmentByNameSelectorProps, SegmentByNameSelectorState> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  private _debounce = debounce;

  constructor(props: SegmentByNameSelectorProps) {
    super(props);
    this.state = {
      segmentsList: [],
      fetching: false,
    };
    this.fetchListMethod = this._debounce(this.fetchListMethod.bind(this), 800);
  }

  componentDidMount() {
    this.fetchListMethod("");
  }

  fetchListMethod(keywords: string) {
    this.setState({ segmentsList: [], fetching: true });
    return this._audienceSegmentService.getSegments("1185", { keywords: keywords, datamart_id: "1139" })
      .then(res => {
        this.setState({
          segmentsList: res.data.map(r => ({ key: r.id, label: <SegmentNameDisplay audienceSegmentResource={r} /> })),
          fetching: false
        })
      });
  }

  handleChange = (value: LabeledValue) => {
    const { onchange } = this.props;
    this.setState({
      value
    });
    onchange(value)
  };

  render() {
    const { segmentsList, fetching, value } = this.state;

    return (<Select
      showSearch={true}
      labelInValue={true}
      value={value}
      className="mcs-segmentByNameSelector"
      placeholder="Search segment by name"
      onSearch={this.fetchListMethod}
      onChange={this.handleChange}
      notFoundContent={fetching ? <Spin size="small" className="text-center" />: null}
      suffixIcon={<McsIcon type="magnifier" />}
    >
      {segmentsList.map((item: LabeledValue, index: number) => <Select.Option value={item.key} key={index.toString()}>{item.label}</Select.Option>)}
    </Select>);
  }
}

export default SegmentByNameSelector;
