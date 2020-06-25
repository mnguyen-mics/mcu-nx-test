import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  ParametricPredicateResource,
  ParametricPredicateType,
} from '../../../../models/parametricPredicate';
import { Select, Input } from 'antd';

const { Option } = Select;

interface State {
  inputValue: string;
}

export interface ParametricPredicateLayoutProps {
  parametricPredicateResource: ParametricPredicateResource;
}

type Props = ParametricPredicateLayoutProps & InjectedIntlProps;

class ParametricPredicateLayout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { inputValue: '' };
  }

  onChange = (e: any) => {
    const { value } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.setState({ inputValue: value });
    }
  };

  renderInput = (type: ParametricPredicateType) => {
    const { inputValue } = this.state;
    switch (type) {
      case 'Enum':
        return (
          <Select mode="multiple" placeholder="Please select">
            <Option key="A">A</Option>
            <Option key="B">B</Option>
          </Select>
        );
      case 'Boolean':
        return (
          <Select placeholder="Please select">
            <Option key="True">True</Option>
            <Option key="False">False</Option>
          </Select>
        );
      case 'Int':
        return (
          <Input
            placeholder="Please select"
            value={inputValue}
            onChange={this.onChange}
            style={{ width: '176px' }}
          />
        );
      default:
        return 'not supported';
    }
  };
  render() {
    const { parametricPredicateResource } = this.props;

    return (
      <React.Fragment>
        <div className="mcs-segmentBuilder_audienceFeatureDescription">{`${parametricPredicateResource.description} `}</div>
        {parametricPredicateResource.variables.map(v => {
          return (
            <div
              className="mcs-segmentBuilder_audienceFeatureInput"
              key={v.name}
            >
              <div>{v.name}</div>
              {this.renderInput(v.type)}
            </div>
          );
        })}
      </React.Fragment>
    );
  }
}

export default compose<Props, ParametricPredicateLayoutProps>(injectIntl)(
  ParametricPredicateLayout,
);
