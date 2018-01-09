import * as React from 'react';
import { Select } from 'antd';
import { ButtonStyleless, McsIcons } from '../../components/index';

const Option = Select.Option;

export interface Workspace {
  organisation_id: string;
  organisation_name: string;
}

export interface OrganisationSelectorProps {
  selectedItem: Workspace;
  itemList: Workspace[];
}

interface OrganisationSelectorState {
  isOpen: boolean;
}

export default class OrganisationSelector extends React.Component<OrganisationSelectorProps, OrganisationSelectorState> {

  constructor(props: OrganisationSelectorProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  clickOnTitle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  handleChange = (e: any) => {
    console.log('ok', e);
  }

  renderTitle = () => {
    return (
      <ButtonStyleless onClick={this.clickOnTitle} className="organisation-name" style={{ cursor: 'pointer' }}>
        {this.props.selectedItem.organisation_name}&nbsp;<McsIcons type="chevron" />
      </ButtonStyleless>
    );
  }

  renderDropDown = () => {

    return this.props.itemList && (
      <Select
        mode="combobox"
        showSearch={true}
        style={{ width: 200 }}
        value={this.props.selectedItem.organisation_name}
        autoFocus={true}
        placeholder={this.props.selectedItem.organisation_name}
        defaultActiveFirstOption={false}
        optionFilterProp="children"
        onChange={this.handleChange}
        onBlur={this.clickOnTitle}
      >
        {this.props.itemList.map(item => {
          return (
            <Option key={item.organisation_id} value={item.organisation_id}>
              {item.organisation_name}
            </Option>
          );
        })}
      </Select>
    );
  }

  render() {
    return (
      <div>
        {this.state.isOpen ? this.renderDropDown() : this.renderTitle()}
      </div>
    );
  }
}
