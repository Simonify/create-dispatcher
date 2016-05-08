import expect, { createSpy, spyOn, isSpy } from 'expect';
import createDispatcher, { DEFAULT_CHANNEL } from '../src';

describe('create-dispatcher', () => {
  it('uses the default channel when no options are provided', () => {
    const { dispatch, subscribe } = createDispatcher();
    const spy = createSpy((channel, event) => null);
    const unsubscribe = subscribe(spy);
    const event = { type: 'hello' };

    dispatch(event);
    expect(spy).toHaveBeenCalledWith(DEFAULT_CHANNEL, event);
    expect(unsubscribe()).toBe(true);
  });

  it('accepts a custom default channel via an options object argument', () => {
    const { dispatch, subscribe } = createDispatcher({ defaultChannel: '@@global' });
    const spy = createSpy((channel, event) => null);
    const unsubscribe = subscribe(spy);
    const event = { type: 'hello' };

    dispatch(event);
    expect(spy).toHaveBeenCalledWith('@@global', event);
    expect(unsubscribe()).toBe(true);
  });

  describe('#dispatch', () => {
    it('uses the default channel if only an event is provided', () => {
      const { dispatch, subscribe } = createDispatcher();
      const spy = createSpy((channel, event) => null);
      const unsubscribe = subscribe(spy);
      dispatch('sup');
      expect(spy).toHaveBeenCalledWith(DEFAULT_CHANNEL, 'sup');
      expect(unsubscribe()).toBe(true);
    });

    it('must only accept a string as a channel', () => {
      const { dispatch } = createDispatcher();
      const data = { type: 'test' };

      expect(() => dispatch(123, data)).toThrow(/must be a string/);
      expect(() => dispatch(false, data)).toThrow(/must be a string/);
      expect(() => dispatch({}, data)).toThrow(/must be a string/);
      expect(() => dispatch(undefined, data)).toThrow(/must be a string/);
      expect(() => dispatch(null, data)).toThrow(/must be a string/);
      expect(() => dispatch('hello', data)).toNotThrow(/must be a string/);
    });

    it('must accept any data type as an event', () => {
      const { dispatch, subscribe } = createDispatcher();
      const spy = createSpy((event) => null);
      const unsubscribe = subscribe(spy);

      dispatch(123);
      expect(spy).toHaveBeenCalledWith(123);
      spy.reset();

      dispatch({ hello: 'ok' });
      expect(spy).toHaveBeenCalledWith({ hello: 'ok' });
      spy.reset();

      dispatch(false);
      expect(spy).toHaveBeenCalledWith(false);
      spy.reset();

      dispatch(null);
      expect(spy).toHaveBeenCalledWith(null);
      spy.reset();

      dispatch(undefined);
      expect(spy).toHaveBeenCalledWith(undefined);
      spy.reset();

      expect(unsubscribe()).toBe(true);
    });
  });

  describe('#subscribe', () => {
    it('should return an unsubscribe function that cancels the subscription', () => {
      const { dispatch, subscribe } = createDispatcher();
      const spy = createSpy((event) => null);
      const unsubscribe = subscribe(spy);

      expect(unsubscribe).toBeA(Function);

      dispatch({ type: 'global_dispatch' });
      expect(spy).toHaveBeenCalled();
      spy.reset();

      expect(unsubscribe()).toBe(true);

      dispatch({ type: 'global_dispatch' });
      expect(spy).toNotHaveBeenCalled();
    });

    it('must only accept a string as a channel, if provided', () => {
      const { dispatch } = createDispatcher();
      const fn = () => {};

      expect(() => dispatch(123, fn)).toThrow(/must be a string/);
      expect(() => dispatch(false, fn)).toThrow(/must be a string/);
      expect(() => dispatch({}, fn)).toThrow(/must be a string/);
      expect(() => dispatch(undefined, fn)).toThrow(/must be a string/);
      expect(() => dispatch(null, fn)).toThrow(/must be a string/);
      expect(() => dispatch('hello', fn)).toNotThrow(/must be a string/);
    });

    describe('receiver', () => {
      it('should only receive the channel an an argument when the function signature accepts two arguments', () => {
        const { dispatch, subscribe } = createDispatcher();

        const eventSpy = createSpy((event) => null);
        const eventUnsubscribe = subscribe(eventSpy);
        const channelSpy = createSpy((channel, event) => null);
        const channelUnsubscribe = subscribe(channelSpy);

        dispatch({ type: 'global_dispatch' });
        expect(eventSpy).toHaveBeenCalledWith({ type: 'global_dispatch' });
        expect(channelSpy).toHaveBeenCalledWith(DEFAULT_CHANNEL, { type: 'global_dispatch' });

        expect(eventUnsubscribe()).toBe(true);
        expect(channelUnsubscribe()).toBe(true);
      });

      it('should only receive events from the channel specified', () => {
        const { dispatch, subscribe } = createDispatcher();
        const spy = createSpy((event) => null);
        const unsubscribe = subscribe('channel', spy);

        dispatch({ type: 'global_dispatch' });
        expect(spy).toNotHaveBeenCalled();

        dispatch('different_channel', { type: 'wrong_channel_dispatch' });
        expect(spy).toNotHaveBeenCalled();

        dispatch('channel', { type: 'correct_channel_dispatch' });
        expect(spy).toHaveBeenCalledWith({ type: 'correct_channel_dispatch' });

        expect(unsubscribe()).toBe(true);
      });
    });

    describe('#unsubscribe', () => {
      it('returns true on the first call and false thereafter', () => {
        const { subscribe } = createDispatcher();
        const unsubscribe = subscribe(() => {});

        expect(unsubscribe()).toBe(true);
        expect(unsubscribe()).toBe(false);
        expect(unsubscribe()).toBe(false);
      });
    });
  });

  describe('#destroy', () => {
    it('forgets all subscriptions', () => {
      const { destroy, dispatch, subscribe } = createDispatcher();
      const spy = createSpy((event) => null);
      const unsubscribe = subscribe(spy);

      dispatch({ type: 'global_dispatch' });
      expect(spy).toHaveBeenCalled();
      spy.reset();

      destroy();

      dispatch({ type: 'global_dispatch' });
      expect(spy).toNotHaveBeenCalled();
      expect(unsubscribe()).toBe(false);
    });

    it('returns true on the first call and false thereafter', () => {
      const { destroy } = createDispatcher();
      expect(destroy()).toBe(true);
      expect(destroy()).toBe(false);
      expect(destroy()).toBe(false);
    });

    it('prevents further subscriptions', () => {
      const { destroy, dispatch, subscribe } = createDispatcher();
      const spy = createSpy((event) => null);

      destroy();

      const unsubscribe = subscribe(spy);

      expect(dispatch({ type: 'test' })).toBe(false);
      expect(spy).toNotHaveBeenCalled();
      expect(unsubscribe).toBe(false);
    });
  });
});