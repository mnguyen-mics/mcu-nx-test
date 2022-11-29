import { defineMessages } from 'react-intl';

export default defineMessages({
  testActionbarTitle: {
    id: 'automation.test.actionbar.title',
    defaultMessage: 'Test',
  },
  contentTitle: {
    id: 'automation.test.content.title',
    defaultMessage: 'Test your automation',
  },
  contentSubtitle: {
    id: 'automation.test.content.subtitle',
    defaultMessage:
      'Your user point ({userPointId}) will go through the automation. All waiting nodes will be bypassed for the purpose of testing.',
  },
  contentSubtitleNoUserPoint: {
    id: 'automation.test.content.subtitle.noUserPoint',
    defaultMessage:
      'Since we will be using your own user point to test the scenario, you should make sure your current browser is linked to some activity on one of your channels before you can launch a test.',
  },
  buttonTitle: {
    id: 'automation.test.content.button.title',
    defaultMessage: 'Launch test',
  },
  testSuccessfullyLaunched: {
    id: 'automation.test.launched.message',
    defaultMessage: 'Your test was successfully launched.',
  },
});
