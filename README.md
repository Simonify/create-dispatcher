# create-dispatcher

`create-dispatcher` provides a simple, minimal event dispatcher.

[![build status](https://img.shields.io/travis/simonify/create-dispatcher/master.svg)](https://travis-ci.org/simonify/create-dispatcher)
[![npm version](https://img.shields.io/npm/v/create-dispatcher.svg)](https://www.npmjs.com/package/create-dispatcher)
[![npm downloads](https://img.shields.io/npm/dm/create-dispatcher.svg)](https://www.npmjs.com/package/create-dispatcher)

## Install
```bash
npm install create-dispatcher --save
```

## Usage
```js
import createDispatcher from 'create-dispatcher';

const { dispatch, subscribe } = createDispatcher({ defaultChannel: '!!GLOBAL!!' });

const unsubscribeGlobal = subscribe((channel, event) => {
  // !!GLOBAL!! {"type":"hello world","payload":{"hello":"world"}}
  console.log(channel, event);
});

const unsubscribeChannel = subscribe('custom:channel', (event) => {
  // {"type":"PING"}
  console.log(event);
});

dispatch({ type: 'hello world', payload: { hello: 'world' } });
dispatch('custom:channel', { type: 'PING' });

unsubscribeGlobal();
unsubscribeChannel();
```

## API

`dispatcher` exports a single function for creating a Dispatcher instance:

```js
createDispatcher(options:Object) => Dispatcher
```

The function accepts a single (optional) argument — an object which can contain a `defaultChannel` property that will be used when a channel is not specified in the `subscribe` and `dispatch` methods (defaults to `*`).

The returned `Dispatcher` is an object exposing three methods:

### Dispatcher.dispatch

The `dispatch` method can be provided with one or two arguments. If two arguments are provided, the first argument will be treated as a `channel` to dispatch to and the second will be treated as the `event`. If one argument is provided, it will be treated as the `event` and the `channel` will default to the `defaultChannel`. The function will return a bool, indicating whether the event was successfully dispatched or not.

```js
Dispatcher.dispatch(channel:String, event:?) => Boolean
Dispatcher.dispatch(event:?) => Boolean
```

### Dispatcher.subscribe

The `subscribe` method can be provided with one or two arguments. If two arguments are provided, the first argument will be treated as a `channel` to subscribe to and the second will be treated as the `receiver` function. If one argument is provided, it will be treated as the `receiver` function and the `channel` will default to the `defaultChannel`.

If the subscription is successful, the function will return an `unsubscribe` function which can be called to cancel the subscription — it will return `true` the first time it's called and `false` thereafter. If the subscription is *not* successful (i.e. you've called `destroy`), the function will return `false`.

```js
Dispatcher.subscribe(channel:String, receiver:Function) => unsubscribe:Function|Boolean
Dispatcher.subscribe(receiver:Function) => unsubscribe:Function|Boolean
```

The `receiver` argument will be called whenever an event is dispatched to the channel you are subscribing to. The `receiver` function you provide should accept either one or two arguments. If one argument is accepted, it will be the `event`. If two arguments are accepted, the first will be the `channel` and the second will be the `event` (see Usage section).

### Dispatcher.destroy

The `destroy` method can be used to untrack all subscriptions and prevent new ones. I recommend you try not to use this method and instead just cancel any subscriptions you create (using the returned `unsubscribe` function). The function will return `true` the first time it's called and `false` thereafter.

```js
Dispatcher.destroy() => Boolean
```
