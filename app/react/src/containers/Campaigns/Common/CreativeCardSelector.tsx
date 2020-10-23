import * as React from 'react';
import { compose } from 'recompose';
import Button, { ButtonProps } from 'antd/lib/button/button';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  FormattedMessage,
  injectIntl,
  InjectedIntlProps,
  defineMessages,
} from 'react-intl';
import { SearchFilter } from '../../../components/ElementSelector';
import {
  CreativesOptions,
  ICreativeService,
} from '../../../services/CreativeService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import {
  CreativeType,
  CreativeResourceShape,
} from '../../../models/creative/CreativeResource';
import CreativeCard, { CreativeCardProps } from './CreativeCard';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { CollectionSelector } from '@mediarithmics-private/mcs-components-library';
import { CollectionSelectorProps } from '@mediarithmics-private/mcs-components-library/lib/components/collection-selector';

const CreativeCollectionSelector: React.ComponentClass<
  CollectionSelectorProps<CreativeResourceShape>
> = CollectionSelector;
const CreativeResourceCard: React.ComponentClass<
  CreativeCardProps<CreativeResourceShape>
> = CreativeCard;

const messages = defineMessages({
  titleForEmailTemplates: {
    id: 'creative-email-selector-title',
    defaultMessage: 'Add Email Templates',
  },
  placeholderForEmailTemplates: {
    id: 'creative-email-selector-search-placeholder',
    defaultMessage: 'Search Email Templates',
  },
  placeholderForDisplayAd: {
    id: 'creative-display-selector-search-placeholder',
    defaultMessage: 'Search Ads',
  },
  titleForDisplayAd: {
    id: 'creative-display-selector-title',
    defaultMessage: 'Add Display Ads',
  },
  selectButton: {
    id: 'creative-display-selector-select-button',
    defaultMessage: 'Select',
  },
  selectButtonSelected: {
    id: 'creative-display-selector-select-button-selected',
    defaultMessage: 'Selected !',
  },
  addElementText: {
    id: 'creative-card-selector.add',
    defaultMessage: 'Add',
  },
});

export interface CreativeCardSelectorProps {
  selectedCreativeIds: string[];
  creativeType: CreativeType;
  singleSelection?: boolean;
  save: (creatives: CreativeResourceShape[]) => void;
  close: () => void;
}

type Props = CreativeCardSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

const SUPPORTED_CREATIVES: CreativeType[] = ['DISPLAY_AD', 'EMAIL_TEMPLATE'];

class CreativeCardSelector extends React.Component<Props> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: Props) {
    super(props);
    const { creativeType } = this.props;
    if (!SUPPORTED_CREATIVES.includes(creativeType)) {
      throw new Error(`Unsupported creative type ${creativeType}`);
    }
  }

  fetchCreatives = (filter: SearchFilter) => {
    const {
      creativeType,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: CreativesOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.keywords = [filter.keywords];
    }

    if (creativeType === 'EMAIL_TEMPLATE') {
      options.archived=false
      return this._creativeService.getEmailTemplates(organisationId, options);
    }
    return this._creativeService.getDisplayAds(organisationId, options);
  };

  fetchCreative = (creativeId: string) => {
    return this._creativeService.getCreative(creativeId);
  };

  renderCreativeTitle = (creative: CreativeResourceShape) => (
    <span>{creative.name ? creative.name : 'No Title'}</span>
  );

  renderCreativeFooter = (
    isSelected: boolean,
    handleSelect: (element: CreativeResourceShape) => void,
  ) => (creative: CreativeResourceShape) => {
    const buttonProps: ButtonProps = {
      onClick: () => handleSelect(creative),
    };
    let selectButtonLabel = messages.selectButton;
    if (isSelected) {
      selectButtonLabel = messages.selectButtonSelected;
      buttonProps.className = 'mcs-primary';
      buttonProps.type = 'primary';
    }

    return (
      <Button {...buttonProps}>
        <FormattedMessage {...selectButtonLabel} />
      </Button>
    );
  };

  renderCreative = (
    creative: CreativeResourceShape,
    isSelected: boolean,
    handleSelect: (element: CreativeResourceShape) => void,
  ) => {
    return (
      <CreativeResourceCard
        key={creative.id}
        creative={creative}
        renderTitle={this.renderCreativeTitle}
        renderFooter={this.renderCreativeFooter(isSelected, handleSelect)}
      />
    );
  };

  saveCreatives = (
    creativeIds: string[],
    creatives: CreativeResourceShape[],
  ) => {
    this.props.save(creatives);
  };

  render() {
    const {
      creativeType,
      singleSelection,
      selectedCreativeIds,
      intl: { formatMessage },
      close,
    } = this.props;

    let title = `${creativeType}`;
    let placeholder = `${creativeType}`;

    if (creativeType === 'DISPLAY_AD') {
      title = formatMessage(messages.titleForDisplayAd);
      placeholder = formatMessage(messages.placeholderForDisplayAd);
    } else if (creativeType === 'EMAIL_TEMPLATE') {
      title = formatMessage(messages.titleForEmailTemplates);
      placeholder = formatMessage(messages.placeholderForEmailTemplates);
    }

    return (
      <CreativeCollectionSelector
        actionBarTitle={title}
        displayFiltering={true}
        searchPlaceholder={placeholder}
        selectedIds={selectedCreativeIds}
        singleSelection={singleSelection}
        fetchDataList={this.fetchCreatives}
        fetchData={this.fetchCreative}
        renderCollectionItem={this.renderCreative}
        save={this.saveCreatives}
        close={close}
        addButtonText={formatMessage(messages.addElementText)}
        noElementText=''
      />
    );
  }
}

export default compose<Props, CreativeCardSelectorProps>(
  injectIntl,
  withRouter,
)(CreativeCardSelector);
