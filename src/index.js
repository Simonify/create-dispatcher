export default function createDispatcher({ defaultChannel } = { defaultChannel: '*' }) {
  let subscribers = {};

  function subscribe(_channel, _receiver) {
    let channel;
    let receiver;

    if (typeof _receiver === 'undefined') {
      [channel, receiver] = [defaultChannel, _channel];
    } else {
      [channel, receiver] = [_channel, _receiver];
    }

    if (typeof channel !== 'string') {
      throw new Error('`channel` must be a string');
    }

    if (typeof receiver !== 'function') {
      throw new Error('`receiver` must be a function');
    }

    if (!subscribers[channel]) {
      subscribers[channel] = [];
    }

    subscribers[channel].push(receiver);

    let bound = true;

    return () => {
      if (!bound || subscribers === null) {
        return false;
      }

      bound = false;

      if (subscribers[channel].length === 1) {
        delete subscribers[channel];
      } else {
        subscribers[channel].splice(subscribers[channel].indexOf(receiver), 1);
      }

      return true;
    };
  }

  function dispatch(channel, event) {
    if (subscribers === null) {
      return false;
    }

    if (typeof event === 'undefined') {
      [channel, event] = [defaultChannel, channel];
    }

    if (typeof channel !== 'string') {
      throw new Error('`channel` must be a string');
    }

    if (!subscribers[channel]) {
      return true;
    }

    for (const subscriber of subscribers[channel]) {
      if (subscriber.length === 1) {
        subscriber(event);
      } else {
        subscriber(channel, event);
      }
    }

    return true;
  }

  function destroy() {
    if (subscribers === null) {
      return false;
    }

    subscribers = null;

    return true;
  }

  return { destroy, dispatch, subscribe };
}
