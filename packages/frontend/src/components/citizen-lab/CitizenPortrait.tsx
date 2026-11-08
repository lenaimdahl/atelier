import { useId, type Ref } from "react";
import { portraitUrls } from "src/components/citizen-lab/citizenAssets";
import { DECO_DEFAULT_COLOR, type LogoStyle } from "src/components/citizen-lab/citizenLabOptions";
import {
  CANVAS,
  computePortraitLayout,
  type CitizenSelection,
  type DecoLayer,
  type DecoPiece,
  logoBox,
} from "src/components/citizen-lab/citizenLayout";


export type CitizenColors = {
  body: string;
  head: string;
  hair: string;
  deco: string;
  eyes: string;
  nose: string;
  mouth: string;
};
export type CitizenTag = { text: string; fontFamily: string; color: string };
export type CitizenLogo = { style: LogoStyle; color: string };

type CitizenPortraitProps = {
  portraitRef: Ref<SVGSVGElement>;
  citizenName: string;
  selection: CitizenSelection;
  colors: CitizenColors;
  tag: CitizenTag;
  logo: CitizenLogo;
  tilted: boolean;
};

const TILT = `translate(${CANVAS.centerX} ${CANVAS.height / 2}) rotate(-4) scale(1.05) translate(${-CANVAS.centerX} ${-CANVAS.height / 2})`;

function TintFilter({ id, color, mode }: { id: string; color: string; mode: "fill" | "multiply" }) {
  if (mode === "fill") {
    return (
      <filter id={id}>
        <feFlood floodColor={color} result="tint" />
        <feComposite in="tint" in2="SourceAlpha" operator="in" />
      </filter>
    );
  }
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feFlood floodColor={color} result="tint" />
      <feBlend in="SourceGraphic" in2="tint" mode="multiply" result="tinted" />
      <feComposite in="tinted" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

function DecoPieces({ href, pieces, filter }: { href: string; pieces: DecoPiece[]; filter: string | undefined }) {
  return pieces.map(({ crop, ...box }) =>
    crop ? (
      <svg key={crop.viewBox} {...box} viewBox={crop.viewBox} preserveAspectRatio={crop.preserveAspectRatio}>
        <image
          href={href}
          x="0"
          y="0"
          width={crop.assetWidth}
          height={crop.assetHeight}
          style={filter ? { filter } : undefined}
        />
      </svg>
    ) : (
      <image
        key={`${box.x},${box.y}`}
        href={href}
        {...box}
        preserveAspectRatio="xMidYMid meet"
        style={filter ? { filter } : undefined}
      />
    ),
  );
}

export function CitizenPortrait({ portraitRef, citizenName, selection, colors, tag, logo, tilted }: CitizenPortraitProps) {
  const layout = computePortraitLayout(selection);
  const urls = portraitUrls(selection, colors, logo);
  const filterPrefix = useId();
  const filterIds = {
    head: `${filterPrefix}head-color`,
    hair: `${filterPrefix}hair-color`,
    decoMultiply: `${filterPrefix}deco-multiply`,
    decoFill: `${filterPrefix}deco-fill`,
    body: `${filterPrefix}body-color`,
    logo: `${filterPrefix}logo-color`,
  };
  const tagText = tag.text.trim();
  const tagNaturalWidth = tagText.length * 6.5;
  const tagScale = Math.min(1, layout.tag.maxWidth / tagNaturalWidth);

  const decoTint = layout.deco?.tint;
  const decoFilter =
    decoTint && decoTint.mode !== "replace" && colors.deco !== DECO_DEFAULT_COLOR
      ? `url(#${decoTint.mode === "fill" ? filterIds.decoFill : filterIds.decoMultiply})`
      : undefined;
  const decoInLayer = (layer: DecoLayer) =>
    layout.deco?.layer === layer ? (
      <DecoPieces
        href={urls.deco}
        pieces={layout.deco.pieces}
        filter={decoFilter}
      />
    ) : null;

  return (
    <svg
      ref={portraitRef}
      className="citizen-portrait"
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      aria-labelledby="citizen-portrait-title"
    >
      <title id="citizen-portrait-title">{citizenName} citizen portrait</title>
      <defs>
        <TintFilter id={filterIds.head} color={colors.head} mode="fill" />
        <TintFilter id={filterIds.hair} color={colors.hair} mode="fill" />
        <TintFilter id={filterIds.decoMultiply} color={colors.deco} mode="multiply" />
        <TintFilter id={filterIds.decoFill} color={colors.deco} mode="fill" />
        <TintFilter id={filterIds.logo} color={logo.color} mode="fill" />
        {layout.body.white && <TintFilter id={filterIds.body} color={colors.body} mode="multiply" />}
      </defs>
      <g transform={tilted ? TILT : undefined}>
        <image
          href={urls.body}
          x={layout.body.x}
          y={layout.body.y}
          width={layout.body.width}
          height={layout.body.height}
          preserveAspectRatio="xMidYMid meet"
          style={layout.body.white ? { filter: `url(#${filterIds.body})` } : undefined}
        />
        <image
          href={urls.head}
          {...layout.head}
          preserveAspectRatio="none"
          style={{ filter: `url(#${filterIds.head})` }}
        />
        {decoInLayer("body")}
        <image
          href={urls.hair}
          {...layout.hair}
          preserveAspectRatio="none"
          style={{ filter: `url(#${filterIds.hair})` }}
        />
        {decoInLayer("head")}
        <image href={urls.eyes} {...layout.eyes} preserveAspectRatio="xMidYMid meet" />
        {decoInLayer("eyes")}
        <image href={urls.mouth} {...layout.mouth} preserveAspectRatio="xMidYMid meet" />
        {decoInLayer("mouth")}
        <image href={urls.nose} {...layout.nose} preserveAspectRatio="xMidYMid meet" />
        {tagText && (
          <text
            x={layout.tag.x}
            y={layout.tag.y}
            textAnchor="end"
            fill={tag.color}
            fontFamily={tag.fontFamily}
            fontSize={11 * tagScale}
            textLength={tagNaturalWidth * tagScale}
            lengthAdjust="spacingAndGlyphs"
            fontWeight="bold"
          >
            {tagText}
          </text>
        )}
        {logo.style !== "none" && urls.logo && (
          <image
            href={urls.logo}
            {...logoBox(logo.style)}
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: `url(#${filterIds.logo})` }}
          />
        )}
      </g>
    </svg>
  );
}
