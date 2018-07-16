import * as React from 'react';
import { Button, Row, Menu } from 'antd';
import { FormattedMessage } from 'react-intl';
import FormTitle, { FormTitleProps } from './FormTitle';
import { ClickParam } from 'antd/lib/menu';

import { Dropdown } from '../../components/PopupContainers';
import McsIcon from '../McsIcon';

interface DropdownButtonItemProps {
  id: string;
  message: FormattedMessage.MessageDescriptor;
  onClick: () => void;
  disabled?: boolean;
}

interface FormSectionProps extends FormTitleProps {
  button?: {
    message: string;
    onClick: () => void;
  };
  dropdownItems?: DropdownButtonItemProps[];
}

class FormSection extends React.Component<FormSectionProps> {
  renderDropdownButton = () => {
    const { dropdownItems } = this.props;

    const displayOptions =
      dropdownItems &&
      dropdownItems.map(item => (
        <Menu.Item key={item.id} disabled={item.disabled}>
          <FormattedMessage {...item.message} />
        </Menu.Item>
      ));

    const handleClick = (param: ClickParam) => {
      const currentItem =
        dropdownItems && dropdownItems.find(item => item.id === param.key);

      currentItem!.onClick();
    };

    const overlay = (
      <Menu className="mcs-dropdown-actions" onClick={handleClick}>
        {displayOptions}
      </Menu>
    );

    return (
      <Dropdown overlay={overlay} trigger={['click']}>
        <Button>
          <McsIcon type="pen" />
          <McsIcon type="chevron" />
        </Button>
      </Dropdown>
    );
  };

  render() {
    const { title, subtitle, button, dropdownItems } = this.props;

    return (
      <Row
        type="flex"
        align="middle"
        justify="space-between"
        className="section-header"
      >
        <FormTitle title={title} subtitle={subtitle} />

        {button && <Button onClick={button.onClick}>{button.message}</Button>}

        {dropdownItems && this.renderDropdownButton()}
      </Row>
    );
  }
}

export default FormSection;
