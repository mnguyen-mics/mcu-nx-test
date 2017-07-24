export const getPaginatedApiParam = (page = 1, pageSize = 500) => ({
  first_result: (page - 1) * pageSize,
  max_results: pageSize
});
