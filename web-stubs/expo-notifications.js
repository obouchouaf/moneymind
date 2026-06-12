export const requestPermissionsAsync = () => Promise.resolve({ status: 'denied' });
export const getPermissionsAsync = () => Promise.resolve({ status: 'denied' });
export const scheduleNotificationAsync = () => Promise.resolve('');
export const cancelAllScheduledNotificationsAsync = () => Promise.resolve();
export const addNotificationReceivedListener = () => ({ remove: () => {} });
export const addNotificationResponseReceivedListener = () => ({ remove: () => {} });
export const setNotificationHandler = () => {};
export const AndroidImportance = { MAX: 5 };
