import * as React from 'react';
import { Icon, Checkbox, Menu } from 'antd';
import Input from 'antd/lib/input/Input';
import { ClickParam } from 'antd/lib/menu';
import { Dropdown } from '../components/PopupContainers';

export interface MenuItemProps {
  key: string;
  label: string;
}

interface SearchAndMultiSelectProps {
  onClick: (elementKey: string) => void;
  placeholder?: string;
  datasource: MenuItemProps[];
  value: string[];
  loading?: boolean;
  onSearch?: (keywords: string) => void;
}

interface SearchAndMultiSelectState {
  inputValue?: string;
  dropdownVisibility: boolean;
}

// TODO handle loading in case of async external search
export default class SearchAndMultiSelect extends React.Component<
  SearchAndMultiSelectProps,
  SearchAndMultiSelectState
> {
  constructor(props: SearchAndMultiSelectProps) {
    super(props);
    this.state = { dropdownVisibility: false };
  }

  search = (keywords: string): MenuItemProps[] => {
    const { datasource } = this.props;
    return datasource.filter(
      item =>
        !keywords || item.label.toLowerCase().includes(keywords.toLowerCase()),
    );
  };

  handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { onSearch } = this.props;
    const keywords = e.target.value;
    if (onSearch) {
      // handle search externaly
      onSearch(keywords);
    } else {
      // handle search internaly by setting input value in state
      this.setState({
        inputValue: keywords,
      });
    }
  };

  handleVisibleChange = (visible?: boolean) => {
    this.setState({ dropdownVisibility: !!visible });
  };

  isChecked = (key: string) => {
    const { value } = this.props;
    return !!value.find(v => v === key);
  };

  handleOnClick = (param: ClickParam) => {
    this.props.onClick(param.key);
  };

  render() {
    const { placeholder, datasource } = this.props;
    const { inputValue, dropdownVisibility } = this.state;

    // if inputValue is defined, search is handled internaly
    const menuItems = (inputValue ? this.search(inputValue) : datasource).map(
      item => {
        return (
          <Menu.Item key={item.key}>
            <span>{item.label}</span>
            <Checkbox
              className="float-right"
              checked={this.isChecked(item.key)}
            />
          </Menu.Item>
        );
      },
    );

    const menu = (
      <Menu
        // Please feel free to convert style to className CSS
        // I failed to do so
        style={{ maxHeight: '200px', overflowY: 'auto' }}
        onClick={this.handleOnClick}
      >
        {menuItems}
      </Menu>
    );

    return (
      <Dropdown
        overlay={menu}
        trigger={['click']}
        visible={dropdownVisibility}
        onVisibleChange={this.handleVisibleChange}
        placement="bottomLeft"
      >
        <Input
          placeholder={placeholder}
          suffix={<Icon type="down" />}
          onChange={this.handleOnChange}
        />
      </Dropdown>
    );
  }
}
