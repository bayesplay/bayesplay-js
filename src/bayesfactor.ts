import { bayesfactor as bf, likelihood as likelihood_wasm, prior as prior_wasm, likelihood_prior } from "bayesplay-wasm";

type PlotPoint = { x: number; y: number };
type MultiPlot = { x: number, posterior: number, likelihood: number, prior: number }[];

export function multplot(likelihood: Likelihood, prior: Prior, values: number[]): { likelihood: PlotPoint[]; alt_prior: PlotPoint[]; null_prior: PlotPoint[] } {
  const likelihood_definition = transform(likelihood, "likelihood");
  const prior_definition = transform(prior, "prior");
  return likelihood_prior(likelihood_definition, prior_definition, new Float64Array(values));
}

export function prior(prior: Prior, x_values: number[]): PlotPoint[] {
  const data_model = transform(prior, "prior");
  let x_array = new Float64Array(x_values);
  return prior_wasm(data_model, x_array);
}

export function likelihood(likelihood: Likelihood, x_values: number[]): PlotPoint[] {
  const data_model = transform(likelihood, "likelihood");
  let x_array = new Float64Array(x_values);
  return likelihood_wasm(data_model, x_array);
}

type PriorParams = {
  normal: ["mean", "sd"];
  point: ["point"];
  uniform: ["min", "max"];
};

type LikelihoodParams = {
  normal: ["mean", "se"];
};

type Limits = { normal: ["ll", "ul"]; point: []; uniform: [] };

const PRIOR_PARAMS: PriorParams = {
  normal: ["mean", "sd"],
  point: ["point"],
  uniform: ["min", "max"],
};

const LIKELIHOOD_PARAMS: LikelihoodParams = {
  normal: ["mean", "se"],
};

type LikelihoodType<Name extends string, Keys extends readonly string[]> = {
  [K in Keys[number]]: number;
} & { family: Name };

type Likelihoods<P extends Record<string, readonly string[]>> = {
  [K in keyof P]: LikelihoodType<K & string, P[K]>;
};

type PriorType<
  Name extends string,
  ParamKeys extends readonly string[],
  LimitKeys extends readonly string[],
> = {
  [K in ParamKeys[number]]: number;
} & {
    [K in LimitKeys[number]]?: number | null;
  } & { family: Name };

type Priors<
  P extends Record<string, readonly string[]>,
  L extends Record<keyof P, readonly string[]>,
> = {
    [K in keyof P]: PriorType<K & string, P[K], L[K]>;
  };

type AllLikelihoods = Likelihoods<LikelihoodParams>;
type AllPriors = Priors<PriorParams, Limits>;

type Likelihood = AllLikelihoods[keyof AllLikelihoods];
type Prior = AllPriors[keyof AllPriors];
type AnyDefinition = Likelihood | Prior;

export type NormalLikelihood = AllLikelihoods["normal"];
export type NormalPrior = AllPriors["normal"];
export type PointPrior = AllPriors["point"];
export type UniformPrior = AllPriors["uniform"];

type NumericParamKey<T> = {
  [K in keyof T]-?: Extract<T[K], number> extends never ? never : K;
}[keyof T] & string;

type InterfaceFor<T extends AnyDefinition> = {
  family: T["family"];
  params: { name: NumericParamKey<T>; value: number }[];
};

const transform = <T extends AnyDefinition>(
  definition: T,
  kind: "prior" | "likelihood",
): InterfaceFor<T> => {
  if (typeof definition.family !== "string") {
    throw new Error("Invalid definition: missing or invalid 'family' property");
  }

  const requiredParams =
    kind === "prior"
      ? PRIOR_PARAMS[definition.family as keyof PriorParams] ?? []
      : LIKELIHOOD_PARAMS[definition.family as keyof LikelihoodParams] ?? [];

  for (const name of requiredParams) {
    const value = definition[name as keyof T];
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(
        `Invalid definition for '${definition.family}': missing or invalid '${name}' parameter`,
      );
    }
  }

  const params = Object.entries(definition).flatMap(([name, value]) => {
    if (typeof value === "number") {
      return {
        name: name as NumericParamKey<T>,
        value,
      };
    }

    return [];
  });

  const transformed_definition: InterfaceFor<T> = {
    family: definition.family,
    params: params,
  };
  return transformed_definition;
};

export function bayesfactor(
  likelihood: Likelihood,
  alt_prior: Prior,
  null_prior: Prior,
): number {
  const data = transform(likelihood, "likelihood");
  const h1 = transform(alt_prior, "prior");
  const h0 = transform(null_prior, "prior");
  return bf(data, h1, h0);
}
