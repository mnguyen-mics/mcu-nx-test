import { injectable } from 'inversify';

export interface Mics {
  init: (siteToken: string) => void;
  push: (eventName: string, properties: any) => void;
  addProperty: (propertyType: string, property: any) => void;
}

export interface MicsWindow extends Window {
  mics: Mics;
}

export interface IMicsTagService {
  pushPageView: (datalayer?: any) => void;
  addUserAccountProperty: (userAccountId: string) => void;
  setUserProperties: (user: { id: string }) => void;
}

@injectable()
export class MicsTagService implements IMicsTagService {
  pushPageView = (datalayer?: any): void => {
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
}
