import * as React from 'react';
import { Select, Spin } from 'antd';
import { debounce } from 'lodash';
// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper from '../FormFieldWrapper';
import { LabeledValue, SelectProps } from 'antd/lib/select';

const { Option } = Select;

export interface FormSearchObjectProps {
  formItemProps?: FormItemProps;
  selectProps?: SelectProps<any>;
  helpToolTipProps?: TooltipPropsWithTitle;
  loadOnlyOnce?: boolean;
  shouldFilterData?: boolean;
  fetchListMethod: (keyword: string) => Promise<LabeledValue[]>;
  fetchSingleMethod: (id: string) => Promise<LabeledValue>;
  type?: string;
  small?: boolean;
  // This prop is used by the Standard Segment Builder to caracterise a specific behavior on value save due to the
  // value type.
  handleValue?: (value: any, inputName?: string) => void;
  // This prop is used by the Standard Segment Builder to specify when the component should handle a single value but
  // set it in an array by default.
  isSingleValue?: boolean;
}

interface FormSearchObjectState {
  data: LabeledValue[];
  value?: LabeledValue[];
  fetching: boolean;
  initialFetch?: boolean;
  currentValue?: string;
  filteredData: LabeledValue[];
}

type Props = FormSearchObjectProps & WrappedFieldProps;

class FormSearchObject extends React.Component<Props, FormSearchObjectState> {
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
    };
  }

  componentDidMount() {
    const { input } = this.props;

    this.fetchInitialData(input.value);
    this.fetchData('');
  }

  componentDidUpdate(prevProps: Props, prevState: FormSearchObjectState) {
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

    this.setState({ fetching: true });
    fetchListMethod(value)
      .then(res => {
        this.setState(
          {
            data: res,
            fetching: false,
          },
          () => {
            this.filterData();
          },
        );
      })
      .catch(() => {
        this.setState({ fetching: false });
      });
  };

  handleChangeSingleValue = (value: LabeledValue) => {
    const { input, handleValue } = this.props;
    this.setState({ value: [value], currentValue: undefined }, () => {
      this.filterData();
    });
    input.onChange(value.key);
    if (handleValue) {
      handleValue([value], input.name);
    }
  };

  handleChangeMultipleValues = (values: LabeledValue[]) => {
    const { input, handleValue } = this.props;
    this.setState(
      {
        value: values,
        currentValue: undefined,
      },
      () => {
        this.filterData();
      },
    );
    input.onChange(values.map(i => i.key));
    if (handleValue) {
      handleValue(values, input.name);
    }
  };

  handleChange = (value: LabeledValue | LabeledValue[]) => {
    const { isSingleValue } = this.props;
    if (Array.isArray(value)) {
      if (isSingleValue && value[0]) {
        this.handleChangeSingleValue(value[0]);
      } else {
        this.handleChangeMultipleValues(value);
      }
    } else {
      this.handleChangeSingleValue(value);
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
      const getLatestTypedValue = (): string => {
        if (currentValue) {
          return currentValue;
        }
        return '';
      };
      const typedValue = getLatestTypedValue();
      const opts = this.state.data
        .filter(v => {
          return v.key?.toLocaleLowerCase().includes(typedValue.toLocaleLowerCase());
        })
        .slice(0, 100);
      this.setState({ filteredData: opts });
    } else {
      this.setState({ filteredData: this.state.data });
    }
  };

  onBlur = () => {
    const { input, handleValue, isSingleValue } = this.props;
    const { value, currentValue } = this.state;
    if (handleValue) {
      handleValue(value, input.name);
    } else {
      let formattedValue: LabeledValue[] = [];
      if (value) {
        formattedValue = formattedValue.concat(value);
      }
      if (isSingleValue) {
        input.onChange(currentValue);
      } else {
        const finalValue = [...formattedValue.map(i => i.key)];
        if (currentValue) {
          finalValue.push(currentValue);
        }
        input.onChange(finalValue);
      }
    }
  };

  render() {
    const {
      meta,
      formItemProps,
      helpToolTipProps,
      small,
      selectProps,
      loadOnlyOnce,
      isSingleValue,
    } = this.props;

    const { filteredData } = this.state;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const options = filteredData.map(d => (
      <Option key={d.key} value={d.value}>
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
            className='mcs-formSearchInput'
            mode={'multiple'}
            labelInValue={true}
            value={isSingleValue && this.state.value ? this.state.value[0] : this.state.value}
            placeholder={'Search'}
            defaultActiveFirstOption={true}
            filterOption={false}
            onSearch={loadOnlyOnce ? this.onSearch : this.fetchData}
            onBlur={loadOnlyOnce ? this.onBlur : undefined}
            onChange={this.handleChange}
            notFoundContent={this.state.fetching ? <Spin size='small' /> : null}
            style={{ width: '100%' }}
            {...selectProps}
          >
            {options}
          </Select>
        </Spin>
      </FormFieldWrapper>
    );
  }
}

export default FormSearchObject;
