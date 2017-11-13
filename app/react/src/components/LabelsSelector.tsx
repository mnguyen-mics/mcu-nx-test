import React, { Component } from 'react';
import { Dropdown, Tag, Tooltip, Input, Button, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import McsIcons from './McsIcons';
import { FormattedMessage, defineMessages } from 'react-intl';

export interface Label {
  id: string;
  name: string;
}

export interface LabelsSelectorProps {
  labels: Label[];
  selectedLabels: Label[];
  onChange: (a: Label[]) => void;
  buttonMessage?: FormattedMessage.MessageDescriptor;
}

interface LabelsSelectorState {
  inputVisible: boolean;
  inputValue: string;
  input?: HTMLInputElement;
}

const messages = defineMessages({
  labelNoResults: {
    id: 'global.label.noResults',
    defaultMessage: 'No Results',
  },
  labelButton: {
    id: 'global.label.button',
    defaultMessage: 'Label',
  },
});

class LabelsSelector extends Component<LabelsSelectorProps, LabelsSelectorState> {

  constructor(props: LabelsSelectorProps) {
    super(props);
    this.state = {
      inputVisible: false,
      inputValue: '',
    };
  }

  saveInputRef = (input: any) => this.setState({input: input});

  handleClose = (removedLabel: Label) => {
    const labels = [...this.props.selectedLabels.filter(selectedLabel => selectedLabel.id !== removedLabel.id)];
    this.props.onChange(labels);
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.state.input && this.state.input.focus());
  }

  handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  }

  handleInputConfirm = () => {
    const selectedValue = this.props.labels.find(label => label.name === this.state.inputValue);
    const labels = [...this.props.selectedLabels];
    if (selectedValue) {
      labels.push(selectedValue);
    }
    this.props.onChange(labels);
  }

  handleBlur = () => {

    setTimeout(() => {
      this.setState({ inputValue: '', inputVisible: false });
    }, 100);

  }

  render() {
    const {
      labels,
      selectedLabels,
      buttonMessage,
    } = this.props;

    const {
      inputValue,
      inputVisible,
    } = this.state;

    const onClose = (label: Label) => () => {

      this.handleClose(label);
    };

    const onClick = (a: ClickParam) => {
      const foundLabel = this.props.labels.find(label => label.id === a.key);
      this.setState({
        inputValue: foundLabel && foundLabel.name ? foundLabel.name : '',
      }, () => {
        this.handleInputConfirm();
      });
    };

    const results = labels.filter(label => {
      return (
        label.name.includes(this.state.inputValue) &&
        !selectedLabels.find(existingLabel => existingLabel.id === label.id)
      );
    });

    const overlayMenu = () => {
      return (
        <Menu onClick={onClick} style={{ width: 100, maxHeight: 300, overflow: 'hidden', overflowY: 'scroll' }}>
          {results.length ? results.map(label => {
            return <Menu.Item key={label.id}>{label.name}</Menu.Item>;
          }) :
          <Menu.Item disabled={true}>
            <FormattedMessage {...messages.labelNoResults} />
          </Menu.Item> }
        </Menu>
      );
    };

    return (
      <div className="mcs-labels">
        {selectedLabels.map((label, index) => {
          const isLongTag = label.name.length > 20;
          const labelelem = (
            <Tag className="label" key={label.id} closable={true} afterClose={onClose(label)}>
              {isLongTag ? `${label.name.slice(0, 20)}...` : label.name}
            </Tag>
          );
          return isLongTag ? <Tooltip title={label.name} key={label.id}>{labelelem}</Tooltip> : labelelem;
        })}
        {inputVisible && (
          <Dropdown
            overlay={overlayMenu()}
            visible={inputVisible}

          >
            <Input
              id="labelInput"
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 100 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              onPressEnter={this.handleInputConfirm}
              prefix={<McsIcons type="magnifier" />}
            />
          </Dropdown>
        )}
        {!inputVisible && <Button size="small" className="label-button" onClick={this.showInput}><McsIcons type="plus" />
          <FormattedMessage {...buttonMessage || messages.labelButton} />
          </Button>}
      </div>
    );
  }
}

export default LabelsSelector;
