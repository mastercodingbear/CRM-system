export const PAGINATION_CONFIG = {
  defaultPageSize: 25,
  paginationOptions: [10, 25, 50, 100]
};

export const SEARCH_OPERATORS = [
  {
    value: '*',
    label: 'Contains'
  },
  {
    value: '',
    label: 'Equal to'
  },
  {
    value: '!',
    label: 'Does not equal'
  },
  {
    value: '<',
    label: 'Is less than'
  },
  {
    value: '>',
    label: 'Is greater than'
  },
];
