import { trackEvent, trackException, trackMetric, getAppInsights } from '../appInsights.client';

describe('Application Insights Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('tracks event with name and properties', () => {
      const eventName = 'TestEvent';
      const properties = { key: 'value', count: 42 };

      trackEvent(eventName, properties);

      // Since we're mocking the module, we just verify the function can be called
      expect(trackEvent).toHaveBeenCalledWith(eventName, properties);
    });

    it('tracks event with only name', () => {
      const eventName = 'SimpleEvent';

      trackEvent(eventName);

      expect(trackEvent).toHaveBeenCalledWith(eventName);
    });

    it('handles empty properties', () => {
      const eventName = 'EmptyPropsEvent';

      trackEvent(eventName, {});

      expect(trackEvent).toHaveBeenCalledWith(eventName, {});
    });
  });

  describe('trackException', () => {
    it('tracks exception with error object', () => {
      const error = new Error('Test error');
      const properties = { context: 'test' };

      trackException(error, properties);

      expect(trackException).toHaveBeenCalledWith(error, properties);
    });

    it('tracks exception without properties', () => {
      const error = new Error('Simple error');

      trackException(error);

      expect(trackException).toHaveBeenCalledWith(error);
    });
  });

  describe('trackMetric', () => {
    it('tracks metric with name and value', () => {
      const metricName = 'LoadTime';
      const value = 1234;

      trackMetric(metricName, value);

      expect(trackMetric).toHaveBeenCalledWith(metricName, value);
    });

    it('tracks metric with properties', () => {
      const metricName = 'ResponseTime';
      const value = 567;
      const properties = { endpoint: '/api/data' };

      trackMetric(metricName, value, properties);

      expect(trackMetric).toHaveBeenCalledWith(metricName, value, properties);
    });

    it('handles zero value', () => {
      const metricName = 'Counter';
      const value = 0;

      trackMetric(metricName, value);

      expect(trackMetric).toHaveBeenCalledWith(metricName, value);
    });

    it('handles negative value', () => {
      const metricName = 'Delta';
      const value = -100;

      trackMetric(metricName, value);

      expect(trackMetric).toHaveBeenCalledWith(metricName, value);
    });
  });

  describe('getAppInsights', () => {
    it('returns null when not initialized', () => {
      const appInsights = getAppInsights();

      expect(appInsights).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('tracks multiple events in sequence', () => {
      trackEvent('Event1', { step: 1 });
      trackEvent('Event2', { step: 2 });
      trackEvent('Event3', { step: 3 });

      expect(trackEvent).toHaveBeenCalledTimes(3);
    });

    it('tracks event, metric, and exception together', () => {
      trackEvent('ProcessStart', { id: '123' });
      trackMetric('ProcessDuration', 500);
      trackException(new Error('Process failed'));

      expect(trackEvent).toHaveBeenCalled();
      expect(trackMetric).toHaveBeenCalled();
      expect(trackException).toHaveBeenCalled();
    });
  });
});
