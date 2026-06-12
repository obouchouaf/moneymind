const Purchases = {
  configure: () => {},
  getCustomerInfo: () => Promise.resolve({ entitlements: { active: {} } }),
  purchasePackage: () => Promise.resolve({}),
  restorePurchases: () => Promise.resolve({}),
};
export default Purchases;
export const LOG_LEVEL = { DEBUG: 'debug' };
