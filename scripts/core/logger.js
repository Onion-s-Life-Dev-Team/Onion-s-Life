// New simple logger:
//   logger.info(...)   not really sure what to use this for yet (debug seems more useful)
//   logger.warn(...)   something unexpected, but the game keeps running
//   logger.error(...)  something failed
//   logger.debug(...)  debugging details, only shown in dev mode (npm run dev)

const PREFIX = "[OL]";
const noop = () => {};

export const logger = {
  info: console.log.bind(console, PREFIX),
  warn: console.warn.bind(console, PREFIX),
  error: console.error.bind(console, PREFIX),
  debug: import.meta.env.DEV ? console.debug.bind(console, PREFIX) : noop,
};

export default logger;
