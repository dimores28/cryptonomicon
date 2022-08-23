const API_KEY =
  "5719dce4d6447b6e5a05773d07cf80682cc4f2baf452fe78b5b717e39bd619d0";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";

socket.addEventListener("message", e => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: missingCurrency
  } = JSON.parse(e.data);

  if (type === INVALID_SUB) {
    markTheWrongTicker(missingCurrency);
  }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
});

const tickersHandlers = new Map();

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function markTheWrongTicker(missingCurrency) {
  let currency = missingCurrency.split("~")[2];
  console.log(currency);

  tickersHandlers.set(currency, "null");
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

window.tickers = tickersHandlers;

//TYPE: "500", MESSAGE: "INVALID_SUB", PARAMETER: "5~CCCAGG~FOO~USD"
