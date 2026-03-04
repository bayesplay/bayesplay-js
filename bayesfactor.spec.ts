import { bayesfactor, type NormalLikelihood, type NormalPrior, type PointPrior, type UniformPrior } from "./index";
import { expect, test } from "bun:test";

test("bayesfactor with normal likelihood and normal prior", () => {
  const likelihood: NormalLikelihood = { family: "normal", mean: 5.5, se: 32.35 }
  const alt_prior: NormalPrior = { family: "normal", mean: 0, sd: 13.3, ll: 0 }
  const null_prior: PointPrior = { family: "point", point: 0 }
  const result = bayesfactor(likelihood, alt_prior, null_prior);

  expect(result).toBe(0.9745933672782535);
});

test("bayesfactor with normal likelihood and uniform prior", () => {

  const likelihood: NormalLikelihood = { family: "normal", mean: 5, se: 10 };
  const alt_prior: UniformPrior = { family: "uniform", min: 0, max: 20 };
  const null_prior: PointPrior = { family: "point", point: 0 };
  const result = bayesfactor(likelihood, alt_prior, null_prior);
  expect(result).toBe(0.8871297633114392);
}
)
