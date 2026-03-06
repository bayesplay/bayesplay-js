import {
  bayesfactor,
  likelihood,
  prior,
  type NormalLikelihood,
  type NormalPrior,
  type PointPrior,
  type UniformPrior,
} from "../src/index";
import { expect, test } from "bun:test";

test("normal prior", () => {
  const prior_definition: NormalPrior = { family: "normal", mean: 0.0, sd: 1 };
  const x = [1];
  const result = prior(prior_definition, x);
  const expected = 1 / Math.sqrt((2 * Math.PI)) * Math.exp(-0.5);
  expect(Math.abs((result[0]?.y || 0) - expected)).toBeLessThan(1e-10);
})

test("normal likelihood", () => {
  const likelihood_definition: NormalLikelihood = { family: "normal", mean: 0.0, se: 1 };
  const x = [0.0];
  const result = likelihood(likelihood_definition, x);
  expect(result[0]?.y).toBe(0.39894228040143265);

});

test("bayesfactor with normal likelihood and normal prior", () => {
  const likelihood: NormalLikelihood = { family: "normal", mean: 5.5, se: 32.35 };
  const alt_prior: NormalPrior = { family: "normal", mean: 0, sd: 13.3, ll: 0 };
  const null_prior: PointPrior = { family: "point", point: 0 };
  const result = bayesfactor(likelihood, alt_prior, null_prior);

  expect(result).toBe(0.9745933672782535);
});

test("bayesfactor with normal likelihood and uniform prior", () => {
  const likelihood: NormalLikelihood = { family: "normal", mean: 5, se: 10 };
  const alt_prior: UniformPrior = { family: "uniform", min: 0, max: 20 };
  const null_prior: PointPrior = { family: "point", point: 0 };
  const result = bayesfactor(likelihood, alt_prior, null_prior);

  expect(result).toBe(0.8871297633114392);
});
