import * as React from 'react';
import { GenericFieldArray, Field, FieldArray, InjectedFormProps } from 'redux-form';
import { RouteComponentProps } from 'react-router';

import messages from '../../../messages';
import { FormSection } from '../../../../../../../components/Form';
import { AdFieldModel } from './domain';
import Ads, { AdsProps } from './Ads';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../../../components/Drawer';
import DisplayCreativeContent from '../../../../../../../containers/Creative/DisplayAds/Edit/CreatePage/DisplayCreativeContent';
import { PropertyResourceShape } from '../../../.../../../../../../models/plugin';
import { RendererDataProps } from '../../../.../../../../../../models/campaign/display/AdResource';
import CreativeService from '../../../../../../../services/CreativeService';
import CreativeCardSelector from '../../../../../Email/Edit/CreativeCardSelector';

const AdsFieldArray = FieldArray as new() => GenericFieldArray<Field, AdsProps>;

export interface AdsSectionProps {
  formValues: AdFieldModel[];
  RxF: InjectedFormProps;
  handlers: {
    closeNextDrawer: () => void;
    openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
    updateTableFieldStatus: (obj: { index: number, tableName: string }) => () => void;
    updateTableFields: (obj: { newFields: any[], tableName: string }) => () => void;
    updateDisplayAdTableFields: (obj: {newFields: AdFieldModel[], tableName: string }) => () => void;
  };
}

type JoinedProps = AdsSectionProps & RouteComponentProps<{ organisationId: string }>;

class AdsSection extends React.Component<JoinedProps> {

  getAllAds = (options: object) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;

    return CreativeService.getDisplayAds(organisationId, options)
      .then(({ data, total }) => ({ data, total }));
  }

  openWindowNewCreativeDrawer = () => {
    const { handlers } = this.props;

    const additionalProps = {
      onClose: handlers.closeNextDrawer,
      save: this.addNewCreativeToAdSelection,
      drawerMode: true,
    };

    const options = {
      additionalProps: additionalProps,
      isModal: true,
    };

    handlers.openNextDrawer(DisplayCreativeContent, options);
  }

  openExistingAdsDrawer = () => {
    const { formValues, handlers } = this.props;

    const emailTemplateSelectorProps = {
      close: handlers.closeNextDrawer,
      fetchData: this.getAllAds,
      selectedData: formValues.filter((ad: AdFieldModel) => !ad.toBeRemoved),
      save: this.addExistingAdsToAdSelection,
      filterKey: 'id',
    };

    const options = {
      additionalProps: emailTemplateSelectorProps,
      isModal: true,
    };

    handlers.openNextDrawer(CreativeCardSelector, options);
  }

  addNewCreativeToAdSelection =
  (creativeData: Partial<AdFieldModel>,
   formattedProperties: PropertyResourceShape[],
   rendererData: RendererDataProps,
  ) => {
    const { formValues, handlers } = this.props;
    const valuesToAdd: Array<Partial<AdFieldModel>> = [];
    formValues.map((item: Partial<AdFieldModel>) => {
      const displayAd = {
        id: generateFakeId(),
        resource: {
          displayAdResource: item,
          creativeResource: null,
        },
        deleted: item.toBeRemoved,
      };
      valuesToAdd.push(displayAd);
    });
    const creative = {
      id: generateFakeId(),
      resource: {
        displayAdResource: null,
        creativeResource: creativeData,
      },
      deleted: false,
    };
    valuesToAdd.push(creative);
    this.setState({ loading: true }, () => {
      handlers.updateTableFields({ newFields: valuesToAdd, tableName: 'adTable' });
      this.props.handlers.closeNextDrawer();
    });
    this.setState({ loading: false });
  }

  addExistingAdsToAdSelection = (selectedAds: DisplayAdResource[]) => {
    const { handlers } = this.props;
    const selectedIds = selectedAds.map(selection => selection.id);

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    Promise.all(selectedIds.map((creativeId: string) => {
      return CreativeService.getCreative(creativeId).then(res => res.data);
    })).then(response => {
      handlers.updateTableFields({ newFields: response, tableName: 'adTable' });
      return this.setState({ loading: false });
    });

  }

  render() {

    const adFields = fields.getAll();

    return (
      <div id="locationTargeting" className="locationTargeting">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openWindowNewCreativeDrawer,
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openExistingAdsDrawer,
            },
          ]}
          subtitle={messages.sectionSubtitleAds}
          title={messages.sectionTitleAds}
        />

        <AdsFieldArray
          name="adTable"
          component={Ads}
          RxF={this.props.RxF}
          rerenderOnEveryChange={true}
          handlers={this.props.handlers}
        />

      </div>

    );
  }
}

export default AdsSection;
