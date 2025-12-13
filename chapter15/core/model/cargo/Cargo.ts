import { Money } from "../../../generic/money/Money";

export class Cargo {
  constructor(
    public readonly cargoId: string,
    public readonly weightKg: number,
    public readonly declaredValue: Money
  ) {}
}
