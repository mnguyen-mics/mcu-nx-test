import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class SchemaVisualizer extends Page {
  constructor() {
    super();
  }

  get myself() {
    return cy.get('.schema-visualizer');
  }

  @logGetter()
  get searchBar() {
    return this.myself.find('.mcs-schemaVizualizer_search_bar');
  }

  @logFunction()
  shouldContain(field: string) {
    this.myself.should('contain', field);
  }

  @logFunction()
  shouldNotContain(field: string) {
    this.myself.should('not.contain', field);
  }
}

export default SchemaVisualizer;
