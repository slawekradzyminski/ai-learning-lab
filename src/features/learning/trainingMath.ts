export type RegressionSample = {
  x: number;
  target: number;
};

export type RegressionState = {
  weight: number;
  bias: number;
};

export type RegressionTrace = {
  rows: Array<RegressionSample & {
    prediction: number;
    residual: number;
    squaredError: number;
    weightGradientContribution: number;
    biasGradientContribution: number;
  }>;
  loss: number;
  gradient: RegressionState;
};

export const REGRESSION_SAMPLES: RegressionSample[] = [
  { x: -1, target: -3 },
  { x: 0, target: -1 },
  { x: 1, target: 1 },
];

export const REGRESSION_INITIAL_STATE: RegressionState = { weight: -1.5, bias: 2 };
export const REGRESSION_OPTIMUM: RegressionState = { weight: 2, bias: -1 };

function assertFinite(values: number[], message: string) {
  if (values.some((value) => !Number.isFinite(value))) throw new Error(message);
}

function assertRegressionInputs(samples: RegressionSample[], state: RegressionState) {
  if (!samples.length) throw new Error('Regression requires at least one sample');
  assertFinite([state.weight, state.bias], 'Regression parameters must be finite');
  samples.forEach((sample) => assertFinite([sample.x, sample.target], 'Regression samples must be finite'));
}

export function regressionTrace(samples: RegressionSample[], state: RegressionState): RegressionTrace {
  assertRegressionInputs(samples, state);
  const rows = samples.map((sample) => {
    const prediction = state.weight * sample.x + state.bias;
    const residual = prediction - sample.target;
    return {
      ...sample,
      prediction,
      residual,
      squaredError: residual ** 2,
      weightGradientContribution: 2 * residual * sample.x,
      biasGradientContribution: 2 * residual,
    };
  });
  const divisor = samples.length;
  return {
    rows,
    loss: rows.reduce((sum, row) => sum + row.squaredError, 0) / divisor,
    gradient: {
      weight: rows.reduce((sum, row) => sum + row.weightGradientContribution, 0) / divisor,
      bias: rows.reduce((sum, row) => sum + row.biasGradientContribution, 0) / divisor,
    },
  };
}

export function regressionLoss(samples: RegressionSample[], state: RegressionState): number {
  return regressionTrace(samples, state).loss;
}

export function numericalRegressionGradient(
  samples: RegressionSample[],
  state: RegressionState,
  epsilon = 1e-4,
): RegressionState {
  if (!Number.isFinite(epsilon) || epsilon <= 0) throw new Error('Epsilon must be positive and finite');
  const derivative = (field: keyof RegressionState) => {
    const plus = { ...state, [field]: state[field] + epsilon };
    const minus = { ...state, [field]: state[field] - epsilon };
    return (regressionLoss(samples, plus) - regressionLoss(samples, minus)) / (2 * epsilon);
  };
  return { weight: derivative('weight'), bias: derivative('bias') };
}

export function gradientDescentStep(
  samples: RegressionSample[],
  state: RegressionState,
  learningRate: number,
): RegressionState {
  if (!Number.isFinite(learningRate) || learningRate <= 0) {
    throw new Error('Learning rate must be positive and finite');
  }
  const { gradient } = regressionTrace(samples, state);
  return {
    weight: state.weight - learningRate * gradient.weight,
    bias: state.bias - learningRate * gradient.bias,
  };
}

export function runGradientDescent(
  samples: RegressionSample[],
  initialState: RegressionState,
  learningRate: number,
  steps: number,
): RegressionState[] {
  if (!Number.isInteger(steps) || steps < 0) throw new Error('Steps must be a non-negative integer');
  const history = [{ ...initialState }];
  for (let index = 0; index < steps; index += 1) {
    history.push(gradientDescentStep(samples, history[history.length - 1], learningRate));
  }
  return history;
}

export type BackpropConfig = {
  x: number;
  target: 0 | 1;
  weight1: number;
  bias1: number;
  weight2: number;
  bias2: number;
};

export type BackpropTrace = {
  forward: {
    x: number;
    z1: number;
    hidden: number;
    z2: number;
    prediction: number;
    loss: number;
  };
  backward: {
    dLossDz2: number;
    dLossDWeight2: number;
    dLossDBias2: number;
    dLossDHidden: number;
    reluDerivative: 0 | 1;
    dLossDz1: number;
    dLossDWeight1: number;
    dLossDBias1: number;
  };
};

export const BACKPROP_PRESETS: Record<'active' | 'inactive', BackpropConfig> = {
  active: { x: 2, target: 1, weight1: 0.5, bias1: 0.2, weight2: 0.8, bias2: -0.1 },
  inactive: { x: 2, target: 1, weight1: -0.8, bias1: 0.1, weight2: 0.8, bias2: -0.1 },
};

export function sigmoid(value: number): number {
  if (!Number.isFinite(value)) throw new Error('Sigmoid input must be finite');
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const exponential = Math.exp(value);
  return exponential / (1 + exponential);
}

export function binaryCrossEntropy(prediction: number, target: 0 | 1): number {
  if (!Number.isFinite(prediction) || prediction < 0 || prediction > 1) {
    throw new Error('Prediction must be a probability');
  }
  const safe = Math.min(1 - 1e-12, Math.max(1e-12, prediction));
  return -(target * Math.log(safe) + (1 - target) * Math.log(1 - safe));
}

function assertBackpropConfig(config: BackpropConfig) {
  assertFinite(
    [config.x, config.weight1, config.bias1, config.weight2, config.bias2],
    'Backpropagation values must be finite',
  );
  if (config.target !== 0 && config.target !== 1) throw new Error('Target must be zero or one');
}

export function backpropagate(config: BackpropConfig): BackpropTrace {
  assertBackpropConfig(config);
  const z1 = config.weight1 * config.x + config.bias1;
  const hidden = Math.max(0, z1);
  const z2 = config.weight2 * hidden + config.bias2;
  const prediction = sigmoid(z2);
  const loss = binaryCrossEntropy(prediction, config.target);
  const dLossDz2 = prediction - config.target;
  const dLossDWeight2 = hidden === 0 ? 0 : dLossDz2 * hidden;
  const dLossDBias2 = dLossDz2;
  const dLossDHidden = dLossDz2 * config.weight2;
  const reluDerivative: 0 | 1 = z1 > 0 ? 1 : 0;
  const dLossDz1 = reluDerivative === 0 ? 0 : dLossDHidden;
  const dLossDWeight1 = dLossDz1 === 0 ? 0 : dLossDz1 * config.x;
  const dLossDBias1 = dLossDz1;

  return {
    forward: { x: config.x, z1, hidden, z2, prediction, loss },
    backward: {
      dLossDz2,
      dLossDWeight2,
      dLossDBias2,
      dLossDHidden,
      reluDerivative,
      dLossDz1,
      dLossDWeight1,
      dLossDBias1,
    },
  };
}

export function backpropagationStep(
  config: BackpropConfig,
  learningRate: number,
): BackpropConfig {
  if (!Number.isFinite(learningRate) || learningRate <= 0) {
    throw new Error('Learning rate must be positive and finite');
  }
  const { backward } = backpropagate(config);
  return {
    ...config,
    weight1: config.weight1 - learningRate * backward.dLossDWeight1,
    bias1: config.bias1 - learningRate * backward.dLossDBias1,
    weight2: config.weight2 - learningRate * backward.dLossDWeight2,
    bias2: config.bias2 - learningRate * backward.dLossDBias2,
  };
}

export function numericalBackpropGradient(
  config: BackpropConfig,
  field: 'weight1' | 'bias1' | 'weight2' | 'bias2',
  epsilon = 1e-5,
): number {
  if (!Number.isFinite(epsilon) || epsilon <= 0) throw new Error('Epsilon must be positive and finite');
  const plus = { ...config, [field]: config[field] + epsilon };
  const minus = { ...config, [field]: config[field] - epsilon };
  return (backpropagate(plus).forward.loss - backpropagate(minus).forward.loss) / (2 * epsilon);
}

export type XorInput = {
  x1: 0 | 1;
  x2: 0 | 1;
  target: 0 | 1;
};

export type XorTrace = XorInput & {
  orScore: number;
  orFeature: 0 | 1;
  andScore: number;
  andFeature: 0 | 1;
  outputScore: number;
  output: 0 | 1;
};

export const XOR_INPUTS: XorInput[] = [
  { x1: 0, x2: 0, target: 0 },
  { x1: 0, x2: 1, target: 1 },
  { x1: 1, x2: 0, target: 1 },
  { x1: 1, x2: 1, target: 0 },
];

function hardStep(value: number): 0 | 1 {
  return value >= 0 ? 1 : 0;
}

export function xorDepthTrace(input: XorInput): XorTrace {
  if (![input.x1, input.x2, input.target].every((value) => value === 0 || value === 1)) {
    throw new Error('XOR inputs and target must be binary');
  }
  const orScore = input.x1 + input.x2 - 0.5;
  const orFeature = hardStep(orScore);
  const andScore = input.x1 + input.x2 - 1.5;
  const andFeature = hardStep(andScore);
  const outputScore = orFeature - 2 * andFeature - 0.5;
  const output = hardStep(outputScore);
  return { ...input, orScore, orFeature, andScore, andFeature, outputScore, output };
}

export function xorTruthTable(): XorTrace[] {
  return XOR_INPUTS.map(xorDepthTrace);
}
