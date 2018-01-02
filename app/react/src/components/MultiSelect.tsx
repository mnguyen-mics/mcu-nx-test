import * as React from 'react';
import {Icon, Dropdown, Menu, Button} from 'antd';
import {ClickParam} from 'antd/lib/menu';
import {ReactNode} from 'react-redux';

export interface MultiSelectProps<T> {
  displayElement: JSX.Element;

  items: T[];
  selectedItems: T[];

  display?: (t: T) => ReactNode;
  getKey: (t: T) => string;

  handleItemClick?: (item: T) => void;
  handleMenuClick?: (selectedItems: T[]) => void;
  onCloseMenu?: (selectedItems: T[]) => void;

  singleSelectOnly?: boolean;
  buttonClass?: string;
}

export interface MultiSelectState<T> {
  selectedItems: T[];
  overlayVisible: boolean;
}

class MultiSelect<T> extends React.Component<MultiSelectProps<T>, MultiSelectState<T>> {

  static defaultProps: Partial<MultiSelectProps<any>> = {
    buttonClass: '',
    display: t => t.toString(),
  };

  state = {
    overlayVisible: false,
    selectedItems: this.props.selectedItems,
  };

  buildMenuItems = () => {
    const {items, display, getKey} = this.props;
    const {selectedItems} = this.state;

    return (
      <Menu onClick={this.onMenuClick}>
        {items.map(item => {
          const isItemSelected = selectedItems.findIndex(selectedItem => getKey(selectedItem) === getKey(item)) !== -1;
          return (
            <Menu.Item key={getKey(item)}>
              {isItemSelected && (<Icon type="check"/>)}
              <span>{display!(item)}</span>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }

  handleVisibleChange = (isVisible: boolean) => {
    this.setVisibility(isVisible);

    if (!isVisible && this.props.onCloseMenu) {
      this.props.onCloseMenu(this.state.selectedItems);
    }
  }

  onMenuClick = (param: ClickParam) => {
    const {items, handleMenuClick, getKey, handleItemClick, singleSelectOnly} = this.props;
    const {selectedItems} = this.state;

    const clickedItem = items.find(item => getKey(item) === param.key);

    // Add or remove item on selectedItems
    let newArray: T[] = [];
    const index = selectedItems!.findIndex(selectedItem => getKey(selectedItem) === getKey(clickedItem!));

    if (index !== -1) {
      newArray = singleSelectOnly ? [] :
        [
          ...selectedItems.slice(0, index),
          ...selectedItems.slice(index + 1),
        ];
    } else {
      newArray = singleSelectOnly ? [clickedItem!] :
        [
          ...selectedItems,
          clickedItem!,
        ];
    }

    this.setState({selectedItems: newArray});

    if (handleMenuClick) {
      handleMenuClick(newArray);
    }
    if (handleItemClick) {
      handleItemClick(clickedItem!);
    }

  }

  setVisibility(isVisible: boolean) {
    this.setState({
      overlayVisible: isVisible,
    });
  }

  render() {
    const {displayElement, buttonClass} = this.props;
    const {overlayVisible} = this.state;
    const menu = this.buildMenuItems();

    return (
      <Dropdown
        overlay={menu}
        trigger={['click']}
        onVisibleChange={this.handleVisibleChange}
        visible={overlayVisible}
      >
        <Button className={buttonClass}>
          {displayElement}
        </Button>
      </Dropdown>
    );

  }
}

export default MultiSelect;
