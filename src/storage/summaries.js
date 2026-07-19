export function calculationSummary(calculator, values) {
  const summaries = {
    dose: () => `${values.requiredDose} ${values.requiredDoseUnit} от ${values.availableAmount} ${values.availableAmountUnit} в ${values.availableVolume} ${values.availableVolumeUnit}`,
    dilution: () =>
      `${values.availableAmount} ${values.availableAmountUnit}/${values.availableVolume} ${values.availableVolumeUnit} към ${values.targetAmount} ${values.targetAmountUnit}/${values.targetVolume} ${values.targetVolumeUnit}, ${values.finalVolume} ${values.finalVolumeUnit}`,
    reconstitution: () =>
      values.requiredDose
        ? `${values.vialAmount} ${values.vialAmountUnit}, ${values.finalVolume} ${values.finalVolumeUnit}, доза ${values.requiredDose} ${values.requiredDoseUnit}`
        : `${values.vialAmount} ${values.vialAmountUnit}, ${values.finalVolume} ${values.finalVolumeUnit}`,
    infusion: () =>
      values.mode === "volumeTime"
        ? `${values.volume} ${values.volumeUnit} за ${values.time} ${values.timeUnit}`
        : `${values.medicationAmount} ${values.medicationAmountUnit} в ${values.finalVolume} ${values.finalVolumeUnit}, ${values.prescribedRate} ${values.prescribedRateUnit}`,
  };

  return summaries[calculator]?.() || "";
}
