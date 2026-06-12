export const getItemAsync = (key) => Promise.resolve(localStorage.getItem(key));
export const setItemAsync = (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); };
export const deleteItemAsync = (key) => { localStorage.removeItem(key); return Promise.resolve(); };
