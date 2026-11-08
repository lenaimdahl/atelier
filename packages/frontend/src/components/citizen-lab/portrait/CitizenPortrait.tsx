import { useId, type Ref } from "react";
import { portraitUrls } from "src/components/citizen-lab/portrait/citizenAssets";
import { DECO_DEFAULT_COLOR } from "src/components/citizen-lab/design/citizenLabOptions";
import {
  CANVAS,
  computePortraitLayout,
  type Box,
  type CitizenSelection,
  type DecoLayer,
  type DecoPiece,
  logoBox,
} from "src/components/citizen-lab/portrait/citizenLayout";
import type { CitizenColors, CitizenLogo, CitizenTag } from "src/components/citizen-lab/design/citizenTypes";

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

const filterUrl = (id: string) => `url(#${id})`;

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

function PortraitImage({
  href,
  box,
  fit = "xMidYMid meet",
  filter,
}: {
  href: string;
  box: Box;
  fit?: "none" | "xMidYMid meet";
  filter?: string;
}) {
  return (
    <image
      href={href}
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      preserveAspectRatio={fit}
      style={filter ? { filter } : undefined}
    />
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
      <PortraitImage key={`${box.x},${box.y}`} href={href} box={box} filter={filter} />
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
      ? filterUrl(decoTint.mode === "fill" ? filterIds.decoFill : filterIds.decoMultiply)
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
        <PortraitImage
          href={urls.body}
          box={layout.body}
          filter={layout.body.white ? filterUrl(filterIds.body) : undefined}
        />
        <PortraitImage href={urls.head} box={layout.head} fit="none" filter={filterUrl(filterIds.head)} />
        {decoInLayer("body")}
        <PortraitImage href={urls.hair} box={layout.hair} fit="none" filter={filterUrl(filterIds.hair)} />
        {decoInLayer("head")}
        <PortraitImage href={urls.eyes} box={layout.eyes} />
        {decoInLayer("eyes")}
        <PortraitImage href={urls.mouth} box={layout.mouth} />
        {decoInLayer("mouth")}
        <PortraitImage href={urls.nose} box={layout.nose} />
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
          <PortraitImage href={urls.logo} box={logoBox(logo.style)} filter={filterUrl(filterIds.logo)} />
        )}
      </g>
    </svg>
  );
}
