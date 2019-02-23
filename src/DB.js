export const DB = (function () {
  const LS_KEY = 'memory-matrix';

  return {
    save({ level }) {
      localStorage.setItem(LS_KEY, JSON.stringify({ level }));
    },
    load() {
      return JSON.parse(localStorage.getItem(LS_KEY));
    }
  }
})();
