import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "src/routes/paths";
import type {
  Citizen,
  Feature,
} from "src/components/citizen-lab/design/citizenLabOptions";
import {
  cycleOption,
  randomParts,
  selectionOf,
} from "src/components/citizen-lab/design/citizenDesign";
import {
  DEFAULT_DESIGN,
  decodeDesign,
  encodeDesign,
  hairPositionFor,
  type CitizenDesign,
} from "src/components/citizen-lab/design/citizenShareState";
import type { CitizenLogo } from "src/components/citizen-lab/design/citizenTypes";
import {
  decodeAsset,
  portraitUrls,
  predecodeAssets,
} from "src/components/citizen-lab/portrait/citizenAssets";

export function useCitizenDesign() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState<CitizenDesign>(
    () =>
      (code ? decodeDesign(code) : null) ?? {
        ...DEFAULT_DESIGN,
        ...randomParts(),
      },
  );

  useEffect(() => {
    void predecodeAssets();
  }, []);

  useEffect(() => {
    const nextCode = encodeDesign(design);
    if (nextCode !== code) {
      void navigate(`${PATHS.CITIZENLAB}/${nextCode}`, { replace: true });
    }
  }, [design, code, navigate]);

  // Swapping in a design only after its images are decoded keeps parts from flashing empty.
  const [shownDesign, setShownDesign] = useState(design);
  useEffect(() => {
    let current = true;
    const urls = Object.values(
      portraitUrls(selectionOf(design), design.colors, design.logo),
    );
    void Promise.all(urls.filter((url) => url !== null).map(decodeAsset)).then(
      () => {
        if (current) {
          setShownDesign(design);
        }
      },
    );
    return () => {
      current = false;
    };
  }, [design]);

  function updateDesign(
    change: (current: CitizenDesign) => Partial<CitizenDesign>,
  ) {
    setDesign((current) => ({ ...current, ...change(current) }));
  }

  function updateLogo(change: Partial<CitizenLogo>) {
    updateDesign((current) => ({ logo: { ...current.logo, ...change } }));
  }

  function selectCitizen(citizen: Citizen) {
    updateDesign((current) => ({
      citizenId: citizen.id,
      features: { ...current.features, hair: hairPositionFor(citizen) },
    }));
  }

  function cycleFeature(feature: Feature, length: number, direction: -1 | 1) {
    updateDesign((current) => ({
      features: {
        ...current.features,
        [feature]: cycleOption(current.features[feature], length, direction),
      },
    }));
  }

  function randomizeCitizen() {
    updateDesign(() => randomParts(design.citizenId));
  }

  return {
    design,
    shownDesign,
    updateDesign,
    updateLogo,
    selectCitizen,
    cycleFeature,
    randomizeCitizen,
  };
}
