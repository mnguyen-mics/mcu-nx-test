import * as React from 'react';
import { Select, Spin } from 'antd';
import { debounce } from 'lodash';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper from '../FormFieldWrapper';
import { LabeledValue, SelectProps } from 'antd/lib/select';

const { Option } = Select;
const MAX_RESULTS_BY_FETCH = 30;

export interface FormInfiniteSearchObjectProps {
  formItemProps?: FormItemProps;
  selectProps?: SelectProps<any>;
  helpToolTipProps?: TooltipPropsWithTitle;
  loadOnlyOnce?: boolean;
  shouldFilterData?: boolean;
  fetchListMethod: (
    keyword: string,
    firstResult: number,
    maxResults: number,
  ) => Promise<LabeledValue[]>;
  fetchSingleMethod: (id: string) => Promise<LabeledValue>;
  type?: string;
  small?: boolean;
}

interface FormInfiniteSearchObjectState {
  data: LabeledValue[];
  value?: LabeledValue[];
  fetching: boolean;
  initialFetch?: boolean;
  currentValue: string;
  filteredData: LabeledValue[];
}

type Props = FormInfiniteSearchObjectProps & WrappedFieldProps;

class FormInfiniteSearchObject extends React.Component<Props, FormInfiniteSearchObjectState> {
  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  private debounce = debounce;

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      filteredData: [],
      fetching: false,
      currentValue: '',
    };
  }

  componentDidMount() {
    const { input } = this.props;

    this.fetchInitialData(input.value);
    this.fetchData('');
  }

  componentDidUpdate(prevProps: Props, prevState: FormInfiniteSearchObjectState) {
    const { type, input } = this.props;

    const { type: prevType } = prevProps;

    if (type !== prevType) {
      this.fetchInitialData(input.value);
      this.fetchData('');
    }
  }

  fetchInitialData = (values?: string | string[]) => {
    const { fetchSingleMethod, selectProps } = this.props;
    this.setState({ initialFetch: true });

    if ((selectProps && selectProps.mode === 'multiple') || typeof values === 'string') {
      const singleValue = values as string;

      if (!singleValue) {
        this.setState({ initialFetch: false });
        return;
      }

      fetchSingleMethod(singleValue).then(res => {
        this.setState({ value: [res], initialFetch: false });
      });
    } else {
      const multipleValues = values as string[];
      Promise.all(multipleValues.map(i => fetchSingleMethod(i))).then(res => {
        this.setState({ value: res, initialFetch: false });
      });
    }
  };

  fetchData = (value: string) => {
    const { fetchListMethod } = this.props;

    const { data, currentValue } = this.state;

    const isNewValue = value !== currentValue;

    this.setState({ fetching: true, currentValue: value });
    fetchListMethod(value, isNewValue ? 0 : data.length, MAX_RESULTS_BY_FETCH).then(res => {
      this.setState(
        {
          data: isNewValue ? res : data.concat(res),
          fetching: false,
        },
        () => {
          this.filterData();
        },
      );
    });
  };

  handleChange = (value: LabeledValue | LabeledValue[]) => {
    const { input } = this.props;

    if (Array.isArray(value)) {
      const multipleValues = value as LabeledValue[];
      this.setState({ value: multipleValues }, () => {
        this.fetchData('');
      });
      input.onChange(multipleValues.map(i => i.key));
    } else {
      const singleValue = value as LabeledValue;
      this.setState({ value: [singleValue] }, () => {
        this.fetchData('');
      });
      input.onChange(singleValue.key);
    }
  };

  onSearch = (val: string) => {
    this.setState({ currentValue: val });
    this.debounce(this.filterData, 300, { leading: false, trailing: true })();
  };

  filterData = () => {
    const { currentValue } = this.state;
    const { shouldFilterData } = this.props;

    if (shouldFilterData) {
      const opts = this.state.data
        .filter(v => {
          return v.key?.toLocaleLowerCase().startsWith(currentValue);
        })
        .slice(0, 100);
      this.setState({ filteredData: opts });
    } else {
      this.setState({ filteredData: this.state.data });
    }
  };

  onInputKeyDown = () => {
    const { input } = this.props;
    const { value, currentValue } = this.state;
    let formattedValue: LabeledValue[] = [];
    if (value) {
      formattedValue = formattedValue.concat(value);
    }
    const finalValue = [...formattedValue.map(i => i.key)];
    if (currentValue) {
      finalValue.push(currentValue);
    }
    input.onChange(finalValue);
  };

  onPopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { currentValue } = this.state;
    const target: any = e.target;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight)
      this.fetchData(currentValue || '');
  };

  render() {
    const { meta, formItemProps, helpToolTipProps, small, selectProps, loadOnlyOnce } = this.props;

    const { filteredData, fetching } = this.state;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const options = filteredData.map(d => (
      <Option key={d.key} value={d.key || ''}>
        {d.label}
      </Option>
    ));

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <Spin spinning={this.state.initialFetch}>
          <Select
            mode='multiple'
            labelInValue={true}
            value={this.state.value}
            placeholder={'Search'}
            defaultActiveFirstOption={true}
            filterOption={false}
            onSearch={loadOnlyOnce ? this.onSearch : this.fetchData}
            onInputKeyDown={loadOnlyOnce ? this.onInputKeyDown : undefined}
            onChange={this.handleChange}
            notFoundContent={fetching ? <Spin size='small' /> : null}
            style={{ width: '100%' }}
            onPopupScroll={this.onPopupScroll}
            loading={fetching}
            {...selectProps}
          >
            {options}
          </Select>
        </Spin>
      </FormFieldWrapper>
    );
  }
}

export default FormInfiniteSearchObject;
