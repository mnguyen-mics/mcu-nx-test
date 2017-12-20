import * as React from 'react';
import { FieldArray, InjectedFormProps } from 'redux-form';
import { snakeCase } from 'lodash';
import { Spin } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router';

import { EmptyRecords, Form } from '../../../../../../../components';
import AdGroupCardList from './AdGroupCardList';
import messages from '../../../messages';
import { AdFieldModel } from './domain';
import { updateDisplayCreative } from '../../../../../../../formServices/CreativeServiceWrapper';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../../../components/Drawer';
import { PropertyResourceShape } from '../../../../../../../models/plugin';

export interface AdsProps {
  AdFields: AdFieldModel[];
  RxF: InjectedFormProps;
  handlers: {
    closeNextDrawer: () => void;
    openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
    updateTableFieldStatus: (obj: { index: number, tableName: string }) => () => void;
    updateTableFields: (obj: { newFields: any[], tableName: string }) => () => void;
    updateDisplayAdTableFields: (obj: {newFields: AdFieldModel[], tableName: string }) => () => void;
  };
}

const { FormSection } = Form;

type JoinedProps = AdsProps & RouteComponentProps<{ organisationId: string }> & InjectedIntlProps;

class Ads extends React.Component<JoinedProps> {

  state = { loading: false };

  updateCreative = (creative: any, properties: PropertyResourceShape[]) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      handlers,
      Afields,
      RxF,
    } = this.props;

    const AdFields = fields.getAll();
    const formattedObject = Object.keys(creative).reduce((acc: any, key: any) => ({
      ...acc,
      [key.indexOf('Table') !== -1 ? key : snakeCase(key.replace('adGroup', ''))]: creative[key],
    }), {});
    const updatedValues = formValues.map((item) => {
      return item.id === formattedObject.id ? formattedObject : item;
    });
    updateDisplayCreative(organisationId, creative, properties)
    .then(() => {
      this.setState({ loading: true }, () => {
        handlers.updateDisplayAdTableFields({ newFields: updatedValues, tableName: 'adTable' });
        this.setState({ loading: false });
        this.props.handlers.closeNextDrawer();
      });
    });
  }

  render() {
    const {
      intl: {
        formatMessage,
      },
      formValues,
      handlers,
    } = this.props;

    return (
      <div id="ads">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openWindowNewCreative,
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitleAds}
          title={messages.sectionTitleAds}
        />
        <Spin spinning={this.state.loading}>
          <div className="ad-group-ad-section">
            <FieldArray
              component={AdGroupCardList}
              data={formValues} // data doesn't exist on type FieldArray
              loading={this.state.loading} // loading doesn't exist on type FieldArray
              name="adTable"
              updateTableFieldStatus={handlers.updateTableFieldStatus} // updateTableFieldStatus doesn't exist on type FieldArray
              handlers={this.props.handlers}
              updateCreative={this.updateCreative}
            />

            {!formValues.filter(ad => !ad.toBeRemoved).length
              && (
                <EmptyRecords
                  iconType="ads"
                  message={formatMessage(messages.contentSectionAdEmptyTitle)}
                />
              )
            }
          </div>
        </Spin>
      </div>
    );
  }
}

export default injectIntl(Ads);
