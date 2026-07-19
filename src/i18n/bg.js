export const bg = {
  app: {
    name: "Дозатор",
    home: "Начало",
    menu: "Меню",
    skipToContent: "Към съдържанието",
    version: (version) => `Версия ${version}`,
    offlineReady: "Работи офлайн след първоначално зареждане.",
    safetyStrip: "Проверява аритметиката. Не замества назначение, инструкция на производителя, аптека или болничен протокол.",
  },
  calculators: {
    dose: {
      title: "Доза от готов разтвор",
      subtitle: "Изчислява обема за изтегляне от налична концентрация.",
      homeDescription: "Колко mL да се изтеглят",
      menuDescription: "Обем за изтегляне",
    },
    dilution: {
      title: "Разреждане до концентрация",
      subtitle: "Изчислява лекарство и разтворител за желана крайна концентрация.",
      homeDescription: "Колко лекарство и разтворител",
      menuDescription: "Лекарство плюс разтворител",
    },
    reconstitution: {
      title: "Разтваряне на флакон",
      subtitle: "Изчислява концентрация след разтваряне и обем за изтегляне.",
      homeDescription: "Крайна концентрация и обем",
      menuDescription: "Концентрация след разтваряне",
    },
    infusion: {
      title: "Инфузионна скорост",
      subtitle: "Изчислява mL/h по доза или по обем и време.",
      homeDescription: "mL/h по доза или време",
      menuDescription: "Скорост на помпа",
    },
  },
  actions: {
    back: "Назад",
    calculate: "Изчисли",
    cancel: "Отказ",
    close: "Затвори",
    copy: "Копирай",
    copyLink: "Копирай връзка",
    createLabel: "Етикет",
    done: "Готово",
    edit: "Промени",
    history: "История",
    newCalculation: "Ново изчисление",
    open: "Отвори",
    print: "Печат",
    save: "Запази",
    delete: "Изтрий",
    shareQr: "QR код",
  },
  theme: {
    lightButton: "Светла",
    darkButton: "Тъмна",
    enableLight: "Включи светла тема",
    enableDark: "Включи тъмна тема",
  },
  home: {
    title: "Какво подготвяте?",
  },
  result: {
    title: "Резултат",
    preparation: "Подготовка",
    verification: "Проверка",
    conversionTitle: "Преобразуване",
    conversionNotice: "Единиците са преобразувани за изчислението.",
    enteredData: "Въведени данни",
    successRegionLabel: "Резултат от изчислението",
    errorRegionLabel: "Грешки в изчислението",
  },
  menu: {
    calculators: "Калкулатори",
    memory: "Памет",
    safetyAndValidation: "Безопасност",
    validationTitle: "Как са проверени изчисленията",
    validationDescription: "Формули, единици и ограничения",
    historyDescription: "Последните 10 за всеки калкулатор",
    savedTitle: "Шаблони",
    savedDescription: "Често използвани изчисления",
  },
  validation: {
    title: "Как са проверени изчисленията",
    intro:
      "Дозатор използва стандартни аритметични формули и показва проверка на сметката след всеки резултат. Медицинската терминология и клиничната употреба очакват външна проверка от медицински специалист.",
    sections: [
      {
        title: "Единици",
        lines: [
          "Масовите единици се преобразуват към mg.",
          "Обемните единици се преобразуват към mL.",
          "Директните концентрации се свеждат към mg/mL; 1% се приема като 10 mg/mL.",
          "При преобразуване приложението показва приложената конверсия.",
        ],
      },
      {
        title: "Формули",
        lines: [
          "Доза от готов разтвор: доза / налична концентрация.",
          "Разреждане към краен обем: V1 = (C2 x V2) / C1, разтворител = V2 - V1.",
          "Разреждане на наличен обем: краен обем = (C1 x V1) / C2, разтворител = краен обем - V1.",
          "Флакон: количество / краен разтворен обем.",
          "Инфузия по дозова скорост: концентрация = количество / краен обем; mL/h = обща доза за час / концентрация.",
          "Инфузия по kg: /min се умножава по kg и по 60; /h се умножава по kg без x60.",
          "Инфузия по обем и време: mL/h = обем / време.",
        ],
      },
      {
        title: "Ограничения",
        lines: [
          "Приложението не препоръчва лекарство, доза или разтворител.",
          "Не проверява съвместимост, стабилност, срок на годност или клинична правилност.",
          "Проверявайте резултата спрямо назначението, опаковката и местния протокол.",
        ],
      },
    ],
    documentNote: "Подробният работен документ е в docs/clinical-validation.md.",
  },
  safety: {
    firstUseTitle: "Преди употреба",
    firstUseLines: [
      "Използвайте само ако сте обучен медицински специалист.",
      "Проверете назначението, продукта, концентрацията и протокола независимо.",
      "Дозатор не препоръчва лекарство, доза, разтворител или срок на годност.",
    ],
    acknowledge: "Разбирам",
    positiveField: (label) => `${label} трябва да бъде положително число.`,
    smallVolume: "Изчисленият обем е под 0.1 mL и може да не бъде измерим точно с избраната спринцовка.",
    highAlert:
      "Високорисков медикамент: направете независима двойна проверка на назначението, концентрацията на продукта, болничния протокол и изчислението.",
    restoredCalculation:
      "Заредено е предишно изчисление. Проверете отново всички стойности спрямо текущото назначение и лекарствената опаковка.",
  },
  sharing: {
    title: "QR код за изчислението",
    help: "Сканирането отваря същото изчисление и го преизчислява в браузъра.",
    disclaimer:
      "Споделя се само въведеното изчисление. Линкът не удостоверява назначение, лекарство, разтворител или клинична правилност.",
    urlLabel: "Връзка",
    qrAriaLabel: "QR код",
  },
  label: {
    title: "Етикет за подготовка",
    medication: "Лекарство: __________",
    totalAmount: (value) => `Общо количество: ${value || "__________"}`,
    finalVolume: (value) => `Краен обем: ${value || "__________"}`,
    concentration: (value) => `Концентрация: ${value || "__________"}`,
    diluent: (value) => `Разтворител: ${value}`,
    preparedAt: (value) => `Подготвено: ${value}`,
    preparedBy: "Подготвено от: __________",
    checkedBy: "Проверено от: __________",
    recipeTitle: "Подготовка:",
  },
  storage: {
    favoriteModalTitle: "Запази изчисление",
    favoriteNameLabel: "Име по желание",
    favoriteNamePlaceholder: "например: честа подготовка",
    noPatientData: "Не въвеждайте лични данни на пациент.",
    favoritesTitle: "Шаблони",
    noFavorites: "Няма шаблони.",
    clearHistory: "Изчисти историята",
    historyTitle: "История",
    historyForCalculator: (title) => `История: ${title}`,
    noHistory: "Няма последни изчисления.",
    noCalculatorHistory: "Няма последни изчисления за този калкулатор.",
  },
  forms: {
    dose: {
      prescribedDose: "Назначена доза",
      dose: "Доза",
      availableSolution: "Наличен разтвор",
      amount: "Количество",
      inVolume: "В обем",
    },
    dilution: {
      mode: "Режим",
      modeAriaLabel: "Режим за разреждане",
      prepareFinalVolumeMode: "Приготвяне на краен обем",
      prepareFinalVolumeDescription: "Имате целеви краен обем и търсите колко разтвор и разтворител да използвате.",
      diluteAvailableAmountMode: "Разреждане на наличен обем",
      diluteAvailableAmountDescription: "Имате обем от наличния разтвор и търсите крайния обем след разреждане.",
      availableConcentration: "Налична концентрация",
      availableConcentrationValue: "Концентрация",
      targetConcentration: "Желана концентрация",
      targetConcentrationValue: "Концентрация",
      finalQuantity: "Крайно количество",
      finalVolume: "Краен обем",
      availableQuantity: "Наличен обем",
      stockVolume: "Обем от наличния разтвор",
    },
    reconstitution: {
      vial: "Флакон",
      vialAmount: "Количество лекарство във флакона",
      powderDissolving: "Разтваряне на праха",
      diluentVolume: "Обем добавен разтворител",
      finalVolumeAfterDissolving: "Краен обем след разтваряне",
      optionalDose: "Ако трябва конкретна доза",
      doseToWithdraw: "Доза, която трябва да се изтегли",
    },
    infusion: {
      mode: "Режим",
      modeAriaLabel: "Режим за инфузионна скорост",
      doseRateMode: "Доза за час",
      doseRateDescription: "Имате количество лекарство, краен обем и назначена скорост, включително по kg.",
      volumeTimeMode: "Обем и време",
      volumeTimeDescription: "Имате общ обем и време за вливане.",
      infusion: "Инфузия",
      medicationAmount: "Количество лекарство",
      finalVolume: "Краен обем",
      patientWeight: "Тегло на пациента",
      prescribedRate: "Назначена дозова скорост",
      hoursToRun: "Часове за вливане",
      volumeTime: "Обем и време",
      volume: "Обем",
      time: "Време",
    },
    common: {
      highAlertLabel: "Лекарството е определено като високорисково според местния протокол",
      diluentLabel: "Име на използвания разтворител",
      diluentPlaceholder: "попълва се от инструкция, аптека или протокол",
      unitAriaLabel: (label) => `${label} единица`,
    },
  },
  fields: {
    prescribedDose: "Назначена доза",
    availableAmount: "Налично количество",
    availableVolume: "Наличен обем",
    availableConcentration: "Налична концентрация",
    availableConcentrationAmount: "Налична концентрация - количество",
    availableConcentrationVolume: "Налична концентрация - обем",
    targetConcentration: "Желана концентрация",
    targetConcentrationAmount: "Желана концентрация - количество",
    targetConcentrationVolume: "Желана концентрация - обем",
    finalVolume: "Краен обем",
    stockVolume: "Обем от наличния разтвор",
    vialAmount: "Количество във флакона",
    diluentAdded: "Добавен разтворител",
    finalReconstitutedVolume: "Краен разтворен обем",
    medicationAmount: "Количество лекарство",
    patientWeight: "Тегло на пациента",
    prescribedRate: "Назначена дозова скорост",
    hoursToRun: "Часове за вливане",
    volume: "Обем",
    time: "Време",
  },
  calculations: {
    dose: {
      withdraw: (volume) => `Изтеглете ${volume} от наличния разтвор.`,
      contains: (amount) => `Обемът съдържа ${amount}.`,
      finalDose: (amount) => `Назначена доза: ${amount}`,
    },
    dilution: {
      impossibleTarget: "Желаната концентрация е по-висока от наличната. Това не може да се получи чрез разреждане.",
      medicationVolumeGreaterThanFinal: "Необходимият обем от лекарството е по-голям от крайния обем.",
      withdraw: (volume) => `Изтеглете ${volume} от първоначалния разтвор.`,
      addDiluent: (volume) => `Добавете ${volume} от посочения разтворител.`,
      finalVolume: (volume) => `Краен обем: ${volume}.`,
      finalConcentration: (concentration) => `Крайна концентрация: ${concentration}.`,
      totalAmount: (amount) => `Общо количество: ${amount}`,
      finalVolumeLine: (volume) => `Краен обем: ${volume}`,
      finalConcentrationLine: (concentration) => `Крайна концентрация: ${concentration}`,
      recipe: (medicationVolume, diluentVolume) => `Изтеглете ${medicationVolume} лекарство. Добавете ${diluentVolume} разтворител.`,
    },
    reconstitution: {
      addDiluent: (volume) => `Добавете ${volume} от посочения разтворител към флакона.`,
      useFinalVolume: (volume) => `Използвайте крайния разтворен обем от инструкцията: ${volume}.`,
      resultingConcentration: (concentration) => `Получена концентрация: ${concentration}.`,
      vialAmount: (amount) => `Количество във флакона: ${amount}`,
      finalVolume: (volume) => `Краен разтворен обем: ${volume}`,
      concentration: (concentration) => `Концентрация: ${concentration}`,
      baseRecipe: (diluentVolume, finalVolume) => `Добавете ${diluentVolume} разтворител. Краен разтворен обем: ${finalVolume}.`,
      doseWithdraw: (amount, volume) => `За доза ${amount} изтеглете ${volume}.`,
      doseLine: (amount) => `Доза за изтегляне: ${amount}`,
    },
    infusion: {
      concentration: (concentration) => `Концентрация в инфузията: ${concentration}.`,
      setPump: (rate) => `Настройте помпата на ${rate} mL/h.`,
      amount: (amount) => `Количество: ${amount}`,
      finalVolume: (volume) => `Краен обем: ${volume}`,
      weight: (weight) => `Тегло: ${weight} kg`,
      speed: (rate) => `Обща дозова скорост: ${rate} mg/h`,
      hoursToRun: (hours) => `Часове за вливане: ${hours} h`,
      volumeRate: (rate, hours) => `Ако целият обем се влива за ${hours} h, скоростта по обем е ${rate} mL/h.`,
      doseRateRecipe: (amount, volume, rate) => `Пригответе ${amount} в краен обем ${volume}. Настройте помпата на ${rate} mL/h.`,
      volume: (volume) => `Обем: ${volume}`,
      time: (hours) => `Време: ${hours} h`,
      volumeTimeRecipe: (volume, hours, rate) => `Инфузирайте ${volume} за ${hours} h при ${rate} mL/h.`,
    },
  },
  summaries: {
    dose: (values) =>
      `${values.requiredDose} ${values.requiredDoseUnit} от ${values.availableAmount} ${values.availableAmountUnit} в ${values.availableVolume} ${values.availableVolumeUnit}`,
    dilution: (values) =>
      values.availableConcentration
        ? `${values.availableConcentration} ${values.availableConcentrationUnit} към ${values.targetConcentration} ${values.targetConcentrationUnit}, ${
            values.mode === "diluteAvailableAmount"
              ? `${values.stockVolume} ${values.stockVolumeUnit}`
              : `${values.finalVolume} ${values.finalVolumeUnit}`
          }`
        : `${values.availableAmount} ${values.availableAmountUnit}/${values.availableVolume} ${values.availableVolumeUnit} към ${values.targetAmount} ${values.targetAmountUnit}/${values.targetVolume} ${values.targetVolumeUnit}, ${values.finalVolume} ${values.finalVolumeUnit}`,
    reconstitution: (values) =>
      values.requiredDose
        ? `${values.vialAmount} ${values.vialAmountUnit}, ${values.finalVolume} ${values.finalVolumeUnit}, доза ${values.requiredDose} ${values.requiredDoseUnit}`
        : `${values.vialAmount} ${values.vialAmountUnit}, ${values.finalVolume} ${values.finalVolumeUnit}`,
    infusion: (values) =>
      values.mode === "volumeTime"
        ? `${values.volume} ${values.volumeUnit} за ${values.time} ${values.timeUnit}`
        : `${values.medicationAmount} ${values.medicationAmountUnit} в ${values.finalVolume} ${values.finalVolumeUnit}, ${values.prescribedRate} ${values.prescribedRateUnit}${values.prescribedRateUnit?.includes("/kg/") ? `, ${values.patientWeight} kg` : ""}${values.hoursToRun ? `, ${values.hoursToRun} h` : ""}`,
  },
  inputSummary: {
    dose: (values) => [
      `Доза: ${values.requiredDose} ${values.requiredDoseUnit}`,
      `Налично: ${values.availableAmount} ${values.availableAmountUnit} в ${values.availableVolume} ${values.availableVolumeUnit}`,
    ],
    dilution: (values) => [
      ...(values.availableConcentration
        ? [
            `Налична концентрация: ${values.availableConcentration} ${values.availableConcentrationUnit}`,
            `Желана концентрация: ${values.targetConcentration} ${values.targetConcentrationUnit}`,
            ...(values.mode === "diluteAvailableAmount"
              ? [`Обем от наличния разтвор: ${values.stockVolume} ${values.stockVolumeUnit}`]
              : [`Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`]),
          ]
        : [
            `Налично: ${values.availableAmount} ${values.availableAmountUnit} в ${values.availableVolume} ${values.availableVolumeUnit}`,
            `Желано: ${values.targetAmount} ${values.targetAmountUnit} в ${values.targetVolume} ${values.targetVolumeUnit}`,
            `Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`,
          ]),
    ],
    reconstitution: (values) => [
      `Флакон: ${values.vialAmount} ${values.vialAmountUnit}`,
      `Разтворител: ${values.diluentVolume} ${values.diluentVolumeUnit}`,
      `Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`,
    ],
    infusion: (values) =>
      values.mode === "volumeTime"
        ? [`Обем: ${values.volume} ${values.volumeUnit}`, `Време: ${values.time} ${values.timeUnit}`]
        : [
            `Количество: ${values.medicationAmount} ${values.medicationAmountUnit}`,
            `Краен обем: ${values.finalVolume} ${values.finalVolumeUnit}`,
            ...(values.prescribedRateUnit?.includes("/kg/") ? [`Тегло: ${values.patientWeight} kg`] : []),
            `Назначение: ${values.prescribedRate} ${values.prescribedRateUnit}`,
            ...(values.hoursToRun ? [`Часове за вливане: ${values.hoursToRun} h`] : []),
          ],
  },
};
