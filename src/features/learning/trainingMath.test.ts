import { describe, expect, test } from 'vitest';
import {
  BACKPROP_PRESETS,
  REGRESSION_INITIAL_STATE,
  REGRESSION_OPTIMUM,
  REGRESSION_SAMPLES,
  backpropagate,
  backpropagationStep,
  binaryCrossEntropy,
  gradientDescentStep,
  numericalBackpropGradient,
  numericalRegressionGradient,
  regressionLoss,
  regressionTrace,
  runGradientDescent,
  sigmoid,
  xorDepthTrace,
  xorTruthTable,
} from './trainingMath';

describe('gradient descent math', () => {
  test('computes the exact regression loss and analytic gradient', () => {
    const trace = regressionTrace(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE);
    expect(trace.rows.map((row) => row.prediction)).toEqual([3.5, 2, 0.5]);
    expect(trace.rows.map((row) => row.residual)).toEqual([6.5, 3, -0.5]);
    expect(trace.loss).toBeCloseTo(17.1666666667, 9);
    expect(trace.gradient.weight).toBeCloseTo(-14 / 3, 9);
    expect(trace.gradient.bias).toBe(6);
  });

  test('matches central finite differences and converges with a useful learning rate', () => {
    const analytic = regressionTrace(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE).gradient;
    const numerical = numericalRegressionGradient(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE);
    expect(numerical.weight).toBeCloseTo(analytic.weight, 6);
    expect(numerical.bias).toBeCloseTo(analytic.bias, 6);

    const history = runGradientDescent(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE, 0.2, 40);
    const final = history[history.length - 1];
    expect(final.weight).toBeCloseTo(REGRESSION_OPTIMUM.weight, 3);
    expect(final.bias).toBeCloseTo(REGRESSION_OPTIMUM.bias, 6);
    expect(regressionLoss(REGRESSION_SAMPLES, final)).toBeLessThan(1e-5);
  });

  test('shows that an unstable learning rate grows the loss', () => {
    const history = runGradientDescent(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE, 1.1, 12);
    expect(regressionLoss(REGRESSION_SAMPLES, history[history.length - 1])).toBeGreaterThan(
      regressionLoss(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE),
    );
  });

  test('validates regression inputs and steps', () => {
    expect(() => regressionTrace([], REGRESSION_INITIAL_STATE)).toThrow('at least one');
    expect(() => gradientDescentStep(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE, 0)).toThrow('Learning rate');
    expect(() => numericalRegressionGradient(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE, -1)).toThrow('Epsilon');
    expect(() => runGradientDescent(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE, 0.1, 1.5)).toThrow('Steps');
  });
});

describe('backpropagation math', () => {
  test('traces the active ReLU forward and backward passes', () => {
    const trace = backpropagate(BACKPROP_PRESETS.active);
    expect(trace.forward.z1).toBeCloseTo(1.2, 10);
    expect(trace.forward.hidden).toBeCloseTo(1.2, 10);
    expect(trace.forward.z2).toBeCloseTo(0.86, 10);
    expect(trace.forward.prediction).toBeCloseTo(sigmoid(0.86), 10);
    expect(trace.backward.dLossDz2).toBeCloseTo(trace.forward.prediction - 1, 10);
    expect(trace.backward.reluDerivative).toBe(1);
    expect(trace.backward.dLossDWeight1).not.toBe(0);
  });

  test('matches numerical gradients for every trainable parameter', () => {
    const trace = backpropagate(BACKPROP_PRESETS.active);
    const expected = {
      weight1: trace.backward.dLossDWeight1,
      bias1: trace.backward.dLossDBias1,
      weight2: trace.backward.dLossDWeight2,
      bias2: trace.backward.dLossDBias2,
    };
    (Object.keys(expected) as Array<keyof typeof expected>).forEach((field) => {
      expect(numericalBackpropGradient(BACKPROP_PRESETS.active, field)).toBeCloseTo(expected[field], 5);
    });
  });

  test('makes the inactive ReLU stop the gradient to the first layer', () => {
    const trace = backpropagate(BACKPROP_PRESETS.inactive);
    expect(trace.forward.hidden).toBe(0);
    expect(trace.backward.reluDerivative).toBe(0);
    expect(trace.backward.dLossDWeight1).toBe(0);
    expect(trace.backward.dLossDBias1).toBe(0);
    expect(trace.backward.dLossDWeight2).toBe(0);
    expect(trace.backward.dLossDBias2).not.toBe(0);
  });

  test('takes an update that reduces active-example loss', () => {
    const before = backpropagate(BACKPROP_PRESETS.active).forward.loss;
    const updated = backpropagationStep(BACKPROP_PRESETS.active, 0.2);
    const after = backpropagate(updated).forward.loss;
    expect(after).toBeLessThan(before);
    expect(binaryCrossEntropy(0.9, 1)).toBeCloseTo(-Math.log(0.9), 10);
  });
});

describe('depth and XOR math', () => {
  test('builds OR and AND hidden features that solve the XOR truth table', () => {
    const table = xorTruthTable();
    expect(table.map((row) => row.output)).toEqual([0, 1, 1, 0]);
    expect(table.map((row) => row.output)).toEqual(table.map((row) => row.target));
    expect(table.map((row) => [row.orFeature, row.andFeature])).toEqual([
      [0, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ]);
  });

  test('exposes the complete composed calculation for one input', () => {
    expect(xorDepthTrace({ x1: 1, x2: 1, target: 0 })).toMatchObject({
      orScore: 1.5,
      orFeature: 1,
      andScore: 0.5,
      andFeature: 1,
      outputScore: -1.5,
      output: 0,
    });
    expect(() => xorDepthTrace({ x1: 2 as 0, x2: 0, target: 0 })).toThrow('binary');
  });
});
