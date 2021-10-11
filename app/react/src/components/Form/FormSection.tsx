import * as React from 'react';
import { Button, Row, Menu, Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import FormTitle, { FormTitleProps } from './FormTitle';
import { MenuInfo } from 'rc-menu/lib/interface';
import { McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';

const { Dropdown } = PopupContainer;

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
    disabled?: boolean;
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

    const handleClick = (param: MenuInfo) => {
      const currentItem = dropdownItems && dropdownItems.find(item => item.id === param.key);
      currentItem!.onClick();
    };

    const overlay = (
      <Menu className='mcs-dropdown-actions mcs-menu-antd-customized' onClick={handleClick}>
        {displayOptions}
      </Menu>
    );

    return (
      <Dropdown overlay={overlay} trigger={['click']}>
        <Button>
          <McsIcon type='pen' />
          <McsIcon type='chevron' />
        </Button>
      </Dropdown>
    );
  };

  render() {
    const { title, subtitle, button, dropdownItems } = this.props;
    const titleColSpan = 24 - 3 * ((!!button ? 1 : 0) + (!!dropdownItems ? 1 : 0));

    const hasRestCol = !!button || !!dropdownItems;
    const restCol = hasRestCol && (
      <Col span={24 - titleColSpan} className='section-header-buttons'>
        {button && (
          <Button onClick={button.onClick} disabled={button.disabled}>
            {button.message}
          </Button>
        )}

        {dropdownItems && this.renderDropdownButton()}
      </Col>
    );

    return (
      <Row align='middle' justify='space-between' className='section-header'>
        <Col span={titleColSpan}>
          <FormTitle title={title} subtitle={subtitle} />
        </Col>

        {restCol}
      </Row>
    );
  }
}

export default FormSection;
