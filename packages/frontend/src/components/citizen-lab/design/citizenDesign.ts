import { CITIZENS, COLORS, FEATURES, featureOptionId, type CitizenId } from "src/components/citizen-lab/design/citizenLabOptions";
import type { CitizenSelection } from "src/components/citizen-lab/portrait/citizenLayout";
import type { CitizenDesign } from "src/components/citizen-lab/design/citizenShareState";

export function cycleOption(index: number, length: number, direction: -1 | 1) {
  return (index + direction + length) % length;
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function randomColor() {
  return COLORS[randomIndex(COLORS.length)];
}

export function citizenOf(design: CitizenDesign) {
  return CITIZENS.find((citizen) => citizen.id === design.citizenId) ?? CITIZENS[0];
}

export function selectionOf(design: CitizenDesign): CitizenSelection {
  return {
    bodyId: citizenOf(design).bodyId,
    headId: featureOptionId("head", design.features.head),
    eyeId: featureOptionId("eyes", design.features.eyes),
    noseId: featureOptionId("nose", design.features.nose),
    hairId: featureOptionId("hair", design.features.hair),
    mouthId: featureOptionId("mouth", design.features.mouth),
    decoId: featureOptionId("deco", design.features.deco),
  };
}

export function randomParts(currentCitizenId?: CitizenId): Pick<CitizenDesign, "citizenId" | "colors" | "features"> {
  const otherCitizens = CITIZENS.filter((citizen) => citizen.id !== currentCitizenId);
  const head = randomColor();
  const contrastColors = COLORS.filter((color) => color !== head);
  const contrastColor = () => contrastColors[randomIndex(contrastColors.length)];
  return {
    citizenId: otherCitizens[randomIndex(otherCitizens.length)].id,
    colors: {
      body: randomColor(),
      head,
      hair: randomColor(),
      deco: randomColor(),
      eyes: contrastColor(),
      nose: contrastColor(),
      mouth: contrastColor(),
    },
    features: Object.fromEntries(
      FEATURES.map(({ key, options }) => [key, randomIndex(options.length)]),
    ) as CitizenDesign["features"],
  };
}
