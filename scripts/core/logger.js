// New simple logger:
//   logger.info(...)    not really sure what to use this for yet (debug seems more useful)
//   logger.warn(...)    something unexpected, but the game keeps running
//   logger.error(...)   something failed
//   logger.debug(...)   developer facing logs, only shown in dev mode (npm run dev)
//   logger.verbose(...) verbose/messy logging for specific debugging

const PREFIX = "[OL]";
const noop = () => {};

export const logger = {
  info: console.log.bind(console, PREFIX),
  warn: console.warn.bind(console, PREFIX),
  error: console.error.bind(console, PREFIX),
  debug: import.meta.env.DEV ? console.log.bind(console, PREFIX) : noop,
  verbose: import.meta.env.DEV ? console.debug.bind(console, PREFIX) : noop,
};

export default logger;