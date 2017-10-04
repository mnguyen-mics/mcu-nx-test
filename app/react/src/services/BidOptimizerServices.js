import ApiService from './ApiService';
import PluginServices from './PluginServices';

function getBidOptimizerProperties({ bidOptimizers, selectedIds }) {
  return Promise.all(bidOptimizers.map(bidOptimizer => {
    const { engine_version_id, id } = bidOptimizer;

    const fetchEngineProperties = PluginServices.getEngineProperties(engine_version_id);
    const fetchEngineVersion = PluginServices.getEngineVersion(engine_version_id, id);

    return Promise.all([fetchEngineProperties, fetchEngineVersion]);
  }))
    .then(results => results.map((result) => ({
      name: (result[0].find(elem => elem.technical_name === 'name')).value.value,
      provider: (result[0].find(elem => elem.technical_name === 'provider')).value.value,
      toBeRemoved: (!selectedIds ? false : !(selectedIds.includes(result[1].id))),
      ...result[1],
    }))
  );
}

function getAllBidOptimizers(organisationId) {
  const endpoint = `bid_optimizers?organisation_id=${organisationId}`;

  return ApiService.getRequest(endpoint);
}

function getBidOptimizers(organisationId, selectedIds, options = {}) {
  const { getAll } = options;

  /* getAllBidOptimizers fetches for us some optimizer metadata. */
  return getAllBidOptimizers(organisationId)
  /* However, we need more, why is why we make a second call via getBidOptimizerProperties. */
    .then(({ data, ...rest }) => {
      /* We can fetch either all or selected optimizers thanks to the "getAll" boolean. */
      const reqParams = (getAll
        ? { bidOptimizers: data, selectedIds }
        : { bidOptimizers: data.filter(bidOptimizer => selectedIds.includes(bidOptimizer.id)) }
      );

      return getBidOptimizerProperties(reqParams)
        .then((results) => ({ data: results, ...rest }));
    });
}

export default {
  getAllBidOptimizers,
  getBidOptimizers,
};
