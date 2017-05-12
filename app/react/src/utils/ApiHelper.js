export const getPaginatedApiParam = (page, pageSize) => ({
  first_result: (page - 1) * pageSize,
  max_results: pageSize
});
