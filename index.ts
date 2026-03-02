import { bayesfactor as bf } from "bayesplay-wasm";

type PriorParams = {
  normal: ["mean", "sd"];
  point: ["point"];
  uniform: ["min", "max"]
};

type LikelihoodParams = {
  normal: ["mean", "se"]
}
type Limits = { normal: ["ll", "ul"], point: [], uniform: [] };


type LikelihoodType<
  Name extends string,
  Keys extends readonly string[]
> = {
  [K in Keys[number]]: number;
} & { distribution: Name };



type Likelihoods<P extends Record<string, readonly string[]>> = {
  [K in keyof P]: LikelihoodType<K & string, P[K]>;
};

type PriorType<
  Name extends string,
  ParamKeys extends readonly string[],
  LimitKeys extends readonly string[]
> = {
  [K in ParamKeys[number]]: number;
} & {
  [K in LimitKeys[number]]?: number | null;
} & { distribution: Name };

type Priors<
  P extends Record<string, readonly string[]>,
  L extends Record<keyof P, readonly string[]>
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


/*
type Interface = {
  family: string,
  params: { name: string, value: number }[]
}
*/

type NumericParamKey<T> = {
  [K in keyof T]-?: Extract<T[K], number> extends never ? never : K;
}[keyof T] & string;

type InterfaceFor<T extends AnyDefinition> = {
  family: T["distribution"];
  params: { name: NumericParamKey<T>, value: number }[];
};

const target = {
  family: "normal",
  params: [{ name: "mean", value: 0 }, { name: "sd", value: 1 }]
}

const transform = <T extends AnyDefinition>(definition: T): InterfaceFor<T> => {
  const params = Object.entries(definition).flatMap(([name, value]) => {
    if (typeof value === "number") {
      return {
        name: name as NumericParamKey<T>,
        value,
      }
    }

    return []
  })

  const actual: InterfaceFor<T> = {
    family: definition.distribution,
    params: params

  }
  return actual
}

export function bayesfactor(likelihood: Likelihood, alt_prior: Prior, null_prior: Prior): number {
  const data = transform(likelihood)
  const h1 = transform(alt_prior)
  const h0 = transform(null_prior)
  return bf(data, h1, h0);
}
export default bayesfactor;
