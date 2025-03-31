const actual = jest.requireActual('react');

export default {
  ...actual,
  useState: jest.fn().mockImplementation((init) => [init, jest.fn()]),
};
