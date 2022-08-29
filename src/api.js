const API_KEY =
  "5719dce4d6447b6e5a05773d07cf80682cc4f2baf452fe78b5b717e39bd619d0";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";
const FAILED_TO_SUBSCRIBE = "INVALID_SUB";
let btcPrice = 1;
// const TRADING_PAIR_TO_BTC = "";
// const TRADING_PAIR_TO_USD = "";

socket.addEventListener("message", e => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: missingCurrency,
    TOSYMBOL: quotation,
    MESSAGE: message
  } = JSON.parse(e.data);

  // if (btcPrice === 0) {
  //   subscribeToTickerOnWs("BTC");
  //   console.log("subscribe");
  //   return;
  // }

  if (type === INVALID_SUB && message === FAILED_TO_SUBSCRIBE) {
    const currencyPair = tickerUnboxing(missingCurrency);

    if (currencyPair.quotation === "USD") {
      subscribeToTickeTtoBtcOnWs(currencyPair.basic);
      if (!tickersHandlers.has("BTC")) {
        subscribeToTicker("BTC", () => {});
      }
      return;
    }

    const errorHaandlers = tickersHandlers.get(currencyPair.basic) ?? {
      done: [],
      err: []
    };

    errorHaandlers.err.forEach(fn => fn(currencyPair.basic));
    return;
  }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  if (currency === "BTC") {
    btcPrice = newPrice;
  }

  const handlers = tickersHandlers.get(currency) ?? { done: [], err: [] };
  if (quotation === "BTC") {
    console.log(newPrice, btcPrice);
    handlers.done.forEach(fn => fn(newPrice * btcPrice));
    return;
  }

  handlers.done.forEach(fn => fn(newPrice));
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

function subscribeToTickeTtoBtcOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~BTC`]
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`, `5~CCCAGG~${ticker}~BTC`]
  });
}

// function unsubscribeFromTickerToBtcOnWs(ticker) {
//   sendToWebSocket({
//     action: "SubRemove",
//     subs: [`5~CCCAGG~${ticker}~BTC`]
//   });
// }

function tickerUnboxing(missingCurrency) {
  const pair = missingCurrency.split("~");
  return { basic: pair[2], quotation: pair[3] };
}

export const subscribeToTicker = (ticker, cb, err) => {
  const subscribers = tickersHandlers.get(ticker) || { done: [], err: [] };
  tickersHandlers.set(ticker, {
    done: [...subscribers.done, cb],
    err: [...subscribers.err, err]
  });
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

window.tickers = tickersHandlers;
window.priceBtc = btcPrice;

//TYPE: "500", MESSAGE: "INVALID_SUB", PARAMETER: "5~CCCAGG~FOO~USD"
