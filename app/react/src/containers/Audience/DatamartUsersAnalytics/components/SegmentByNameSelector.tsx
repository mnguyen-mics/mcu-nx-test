import * as React from 'react';
import { Select, Spin } from 'antd';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService, GetSegmentsOption } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import SegmentNameDisplay from '../../Common/SegmentNameDisplay';
import debounce from 'lodash/debounce';
import { McsIcon } from '../../../../components';
import { LabeledValue } from 'antd/lib/select';
import { AudienceSegmentType } from '../../../../models/audiencesegment';

interface SegmentByNameSelectorState {
  segmentsList: LabeledValue[];
  value?: LabeledValue;
  fetching: boolean;
}

interface SegmentByNameSelectorProps {
  datamartId: string;
  organisationId: string;
  onchange: (value: LabeledValue) => void;
  segmentType?: AudienceSegmentType
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

    this.fetchListMethod('');
  }

  fetchListMethod( keywords: string) {
    const { datamartId, organisationId, segmentType } = this.props;
    this.setState({ segmentsList: [], fetching: true });
    const options: GetSegmentsOption = {
      keywords: keywords,
      datamart_id: datamartId
    }
    if(segmentType) {
      options.type = segmentType
    }
    return this._audienceSegmentService.getSegments(organisationId, options)
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
    const getPopupContainer = () => document.getElementById("mcs-segmentFilter")!
    return (<Select
      showSearch={true}
      labelInValue={true}
      autoFocus={true}
      value={value}
      className="mcs-segmentByNameSelector"
      placeholder="Search segment by name"
      filterOption={false}
      onSearch={this.fetchListMethod}
      onChange={this.handleChange}
      notFoundContent={fetching ? <Spin size="small" className="text-center" />: null}
      suffixIcon={<McsIcon type="magnifier" />}
      getPopupContainer={getPopupContainer}
    >
      {segmentsList.map((item: LabeledValue, index: number) => <Select.Option value={item.key} key={index.toString()}>{item.label}</Select.Option>)}
    </Select>);
  }
}

export default SegmentByNameSelector;
