import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dropdown, Menu, Button } from 'antd';
import { FormattedMessage } from 'react-intl';

class MultiSelect extends Component {

  constructor(props) {
    super(props);
    this.buildMenuItems = this.buildMenuItems.bind(this);
    this.handleVisibleChange = this.handleVisibleChange.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
    this.state = {
      overlayVisible: false,
      selectedItems: this.props.menuItems.selectedItems
    };
  }


  render() {

    const {
      displayElement,
      buttonClass
    } = this.props;

    const {
      overlayVisible
    } = this.state;

    const menu = this.buildMenuItems();

    return (
      <Dropdown overlay={menu} trigger={['click']} onVisibleChange={this.handleVisibleChange} visible={overlayVisible}>
        <Button className={buttonClass}>
          { displayElement }
        </Button>
      </Dropdown>
    );

  }

  onMenuClick(item) {

    const {
      name,
      menuItems: {
        handleMenuClick
      }
    } = this.props;

    const {
      selectedItems
    } = this.state;

    // Add or remove item on selectedItems
    let newArray = [];
    const index = selectedItems.findIndex(selectedItem => selectedItem.value === item.value);
    if (index !== -1) {
      newArray = [
        ...selectedItems.slice(0, index),
        ...selectedItems.slice(index + 1)
      ];
    } else {
      newArray = [
        ...selectedItems,
        item
      ];
    }
    this.setState({
      selectedItems: newArray
    });

    if (typeof handleMenuClick === 'function') {
      handleMenuClick({
        [name]: newArray
      });
    }

  }

  buildMenuItems() {
    const {
      menuItems: {
        items
      }
    } = this.props;

    const {
      selectedItems
    } = this.state;

    const getItem = value => items.find(item => item.value === value);

    return (
      <Menu onClick={value => this.onMenuClick(getItem(value.key))}>
        { items.map(item => {
          const isItemSelected = selectedItems.find(selectedItem => selectedItem.value === item.value);
          return (
            <Menu.Item key={item.value}>
              {isItemSelected && (<Icon type="check" />)}
              <span><FormattedMessage id={item.key} /></span>
            </Menu.Item>
          );
        })}
      </Menu>
    );

  }

  setVisibility(isVisible) {
    this.setState({
      overlayVisible: isVisible
    });
  }

  handleVisibleChange(isVisible) {
    this.setVisibility(isVisible);
    if (!isVisible) {
      this.props.onCloseMenu(this.state.selectedItems);
    }
  }

  isChecked(value) {
    let isChecked = false;
    this.buildFilterItems().forEach((item) => {
      if (item.value.toLowerCase() === value.toLowerCase()) {
        isChecked = true;
      }
    });
    return isChecked;
  }

}

MultiSelect.defaultProps = {
  buttonClass: ''
};

MultiSelect.propTypes = {
  name: PropTypes.string.isRequired,
  displayElement: PropTypes.element.isRequired,
  onCloseMenu: PropTypes.func,
  menuItems: PropTypes.shape({
    handleMenuClick: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    })),
    items: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }))
  }).isRequired,
  buttonClass: PropTypes.string,
};

MultiSelect.defaultProps = {
  onCloseMenu: () => { }
};

export default MultiSelect;
