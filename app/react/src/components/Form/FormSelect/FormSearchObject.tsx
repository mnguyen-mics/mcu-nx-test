import * as React from 'react';
import { Select, Spin } from 'antd';

// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipProps } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper from '../FormFieldWrapper';
import { SliderProps } from 'antd/lib/slider';
import { LabeledValue } from 'antd/lib/select';
import { DataListResponse, DataResponse } from '../../../services/ApiService';
import { Index } from '../../../utils';

const { Option } = Select;

export interface FormSearchObjectProps {
  formItemProps?: FormItemProps;
  inputProps?: SliderProps;
  helpToolTipProps?: TooltipProps;
  fetchListMethod: (organisationId: string, options: Index<any>) => Promise<DataListResponse<any>>;
  fetchSingleMethod: (id: string) => Promise<DataResponse<any>>;
  organisationId: string;
  small?: boolean;
}

interface Data {
  value: string;
  name: string;
}

interface FormSearchObjectState {
  data: Data[];
  value?: LabeledValue[];
  fetching: boolean;
}

type Props = FormSearchObjectProps & WrappedFieldProps;

class FormSearchObject extends React.Component<
  Props,
  FormSearchObjectState
  > {
  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  constructor(props: Props) {
    super(props)
    this.state = {
      data: [],
      fetching: false
    }
  }

  componentDidMount() {
    const {
      input
    } = this.props;

    this.fetchInitialData(input.value);
  }


  fetchInitialData = (values: string[]) => {
    const { fetchSingleMethod } = this.props;
    return Promise.all(values.map(i => fetchSingleMethod(i).then(r => ({ key: r.data.id, label: r.data.name })))).then(res => {
      this.setState({ value: res })
    })
  }

  fetchData = (value: string) => {
    const {
      fetchListMethod,
      organisationId
    } = this.props;

    fetchListMethod(
      organisationId,
      {
        keywords: value
      }
    ).then(res => {
      this.setState({
        data: res.data.map(r => ({ value: r.id, name: r.name }))
      })
    })
  }

  handleChange = (value: LabeledValue[]) => {
    const { input } = this.props;
    this.setState({ value })
    input.onChange(value.map(i => i.key))
  }

  render() {
    const {
      meta,
      formItemProps,
      helpToolTipProps,
      small,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const options = this.state.data.map(d => <Option key={d.value} value={d.value}>{d.name}</Option>);

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <Select
          mode="multiple"
          labelInValue={true}
          value={this.state.value}
          placeholder={'Search'}
          defaultActiveFirstOption={false}
          filterOption={false}
          onSearch={this.fetchData}
          onChange={this.handleChange}
          notFoundContent={this.state.fetching ? <Spin size="small" /> : null}
          style={{ width: '100%' }}
        >
          {options}
        </Select>
      </FormFieldWrapper>
    );
  }
}

export default FormSearchObject;
