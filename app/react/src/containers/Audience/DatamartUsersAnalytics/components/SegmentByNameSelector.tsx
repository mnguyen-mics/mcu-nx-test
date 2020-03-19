import * as React from 'react';
import { Select, Spin } from 'antd';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import SegmentNameDisplay from '../../Common/SegmentNameDisplay';
import debounce from 'lodash/debounce';
import { McsIcon } from '../../../../components';

interface SegmentByNameSelectorState {
  data: any;
  value: any;
  fetching: boolean;
}

interface SegmentByNameSelectorProps {
  onchange: (value: any) => void
}

class SegmentByNameSelector extends React.Component<SegmentByNameSelectorProps, SegmentByNameSelectorState> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  private _debounce = debounce;

  constructor(props: SegmentByNameSelectorProps) {
    super(props);
    this.state = {
      data: [],
      value: [],
      fetching: false,
    };
    this.fetchListMethod = this._debounce(this.fetchListMethod.bind(this), 800);
  }

  componentDidMount() {
    this.fetchListMethod("");
  }

  fetchListMethod(keywords: string) {
    this.setState({ data: [], fetching: true });
    return this._audienceSegmentService.getSegments("1185", { keywords: keywords, datamart_id: "1139" })
      .then(res => {
        this.setState({
          data: res.data.map(r => ({ key: r.id, label: <SegmentNameDisplay audienceSegmentResource={r} /> })),
          fetching: false
        })
      });
  }

  handleChange = (value: string) => {
    const { onchange } = this.props;
    this.setState({
      value,
      data: [],
      fetching: false,
    });
    onchange(value)
  };

  render() {
    const { data, fetching, value } = this.state;
    return (<Select
      showSearch
      labelInValue
      value={value}
      style={{ width: "230px" }}
      placeholder="Search segment by name"
      filterOption={false}
      onSearch={this.fetchListMethod}
      onChange={this.handleChange}
      notFoundContent={fetching ? <Spin size="small" className="text-center" />: null}
      suffixIcon={<McsIcon type="magnifier" />}
    >
      {data.map((item: any, index: number) => <Select.Option value={item.key} key={index.toString()}>{item.label}</Select.Option>)}
    </Select>);
  }
}

export default SegmentByNameSelector;
