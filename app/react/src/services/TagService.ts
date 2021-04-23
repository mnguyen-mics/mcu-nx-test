import { DataLayerDefinition } from './../routes/domain';
import { injectable } from 'inversify';

export interface Mics {
  init: (siteToken: string) => void;
  push: (eventName: string, properties: any) => void;
  addProperty: (propertyType: string, property: any) => void;
}

export interface MicsWindow extends Window {
  mics: Mics;
}

export interface ITagService {
  pushPageView: (datalayer?: DataLayerDefinition) => void;
  addUserAccountProperty: (userAccountId: string) => void;
  setUserProperties: (user: { id: string }) => void;
  googleAnalyticsTrack: (pathname: string) => void;
  sendEvent: (eventName: string, category?: string, action?: string) => void;
}

@injectable()
export class TagService implements ITagService {
  pushPageView = (datalayer?: DataLayerDefinition): void => {
    if ((window as any).mics && (window as any).mics.push) {
      (window as any).mics.push('PageView', datalayer ? datalayer : {});
    }
  };

  addUserAccountProperty = (userAccountId: string): void => {
    if ((window as any).mics && (window as any).mics.addProperty) {
      (window as any).mics.addProperty('$user_account_id', userAccountId);
    }
  };

  setUserProperties = (user: { id: string }): void => {
    if ((window as any).mics && (window as any).mics.addProperty) {
      (window as any).mics.addProperty('$set_user_profile_properties', {
        $user_account_id: user.id,
      });
    }
  };

/**
 * gtag for Google Analytics
 */

  // Google Analytics Tracker function for navigator's virtual pageviews
  // (https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications)
  googleAnalyticsTrack = (pathname: string) => {
    if (window as any) {
      const dataLayer = (window as any).dataLayer || [];
      function gtag(...arg: any) {
        dataLayer.push(arguments);
      }
      gtag('config', (global as any).window.MCS_CONSTANTS.GTAG_ID, {
        send_page_view: false,
      });
      gtag('event', 'page_view', {
        page_title: pathname,
        page_path: pathname,
        send_to: (global as any).window.MCS_CONSTANTS.GTAG_ID
      });
    }
  };

  sendEvent = (eventName: string, category?: string, action?: string) => {
    if (window as any) {
      const dataLayer = (window as any).dataLayer || [];
      function gtag(...arg: any) {
        dataLayer.push(arguments);
      }
      gtag('event', eventName, {
        category: category,
        action: action
      });
    }
  };
}
