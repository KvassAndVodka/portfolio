import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { alpha2ToNumeric } from "i18n-iso-countries";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldAtlas from "world-atlas/countries-110m.json";

interface CountryStat {
  countryCode: string;
  views: number;
  visitors: number;
}

interface CountryProperties {
  name: string;
}

type CountryFeature = Feature<Geometry, CountryProperties>;

const MAP_WIDTH = 960;
const MAP_HEIGHT = 500;
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const atlas = worldAtlas as unknown as Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;

const countryFeatures = (
  feature(atlas, atlas.objects.countries) as FeatureCollection<Geometry, CountryProperties>
).features.filter((country) => String(country.id).padStart(3, "0") !== "010");

const countryCollection: FeatureCollection<Geometry, CountryProperties> = {
  type: "FeatureCollection",
  features: countryFeatures,
};

const projection = geoNaturalEarth1().fitExtent(
  [[10, 10], [MAP_WIDTH - 10, MAP_HEIGHT - 10]],
  countryCollection,
);
const mapPath = geoPath(projection);

function countryName(countryCode: string) {
  try {
    return regionNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

function numericCountryCode(countryCode: string) {
  return alpha2ToNumeric(countryCode)?.padStart(3, "0");
}

function visitorFill(visitors: number, maximum: number) {
  if (visitors === 0) return "var(--admin-map-land)";
  const intensity = Math.log1p(visitors) / Math.log1p(Math.max(maximum, 1));
  if (intensity <= 0.25) return "var(--admin-map-level-1)";
  if (intensity <= 0.5) return "var(--admin-map-level-2)";
  if (intensity <= 0.75) return "var(--admin-map-level-3)";
  return "var(--admin-map-level-4)";
}

export default function VisitorCountryMap({ countries }: { countries: CountryStat[] }) {
  const maximumVisitors = Math.max(...countries.map((country) => country.visitors), 1);
  const countriesByNumericCode = new Map(
    countries.flatMap((country) => {
      const numericCode = numericCountryCode(country.countryCode);
      return numericCode ? [[numericCode, country] as const] : [];
    }),
  );

  return (
    <section className="admin-panel overflow-hidden" aria-labelledby="countries-heading">
      <div className="border-b border-[var(--admin-border)] p-5 md:px-6">
        <h2 id="countries-heading" className="admin-section-title">Visitors by country</h2>
        <p className="mt-1 text-sm admin-muted">
          Country-level estimates from aggregated IP data over the last 30 days.
        </p>
      </div>

      {countries.length > 0 ? (
        <div className="grid xl:grid-cols-[minmax(0,1.75fr)_minmax(17rem,0.65fr)]">
          <figure className="min-w-0 bg-[var(--admin-map-water)] p-3 sm:p-5 md:p-6">
            <svg
              className="block h-auto w-full"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="img"
              aria-labelledby="visitor-map-title visitor-map-description"
            >
              <title id="visitor-map-title">Estimated visitors by country</title>
              <desc id="visitor-map-description">
                Countries with more estimated visitors use a stronger orange fill. Exact values are available by focusing a shaded country and in the ranking beside the map.
              </desc>
              {countryFeatures.map((country) => {
                const numericCode = String(country.id).padStart(3, "0");
                const countryStat = countriesByNumericCode.get(numericCode);
                const path = mapPath(country as CountryFeature);
                if (!path) return null;

                const label = countryStat
                  ? `${countryName(countryStat.countryCode)}: ${countryStat.visitors.toLocaleString()} estimated visitors and ${countryStat.views.toLocaleString()} page views`
                  : undefined;

                return (
                  <path
                    key={numericCode}
                    d={path}
                    fill={visitorFill(countryStat?.visitors ?? 0, maximumVisitors)}
                    stroke="var(--admin-map-border)"
                    strokeWidth="0.75"
                    vectorEffect="non-scaling-stroke"
                    className={countryStat ? "visitor-country" : undefined}
                    tabIndex={countryStat ? 0 : undefined}
                    aria-label={label}
                    aria-hidden={countryStat ? undefined : true}
                  >
                    {label && <title>{label}</title>}
                  </path>
                );
              })}
            </svg>

            <figcaption className="mt-2 flex flex-col gap-2 text-xs admin-muted sm:flex-row sm:items-center sm:justify-between">
              <span>Natural Earth boundaries · country-level only</span>
              <span className="flex items-center gap-1.5" aria-label="Map color scale from fewer to more visitors">
                <span>Fewer</span>
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className="size-3 rounded-[0.2rem] border border-[var(--admin-map-border)]"
                    style={{ background: `var(--admin-map-level-${level})` }}
                    aria-hidden="true"
                  />
                ))}
                <span>More</span>
              </span>
            </figcaption>
          </figure>

          <ol className="divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)] xl:border-l xl:border-t-0">
            {countries.slice(0, 8).map((country, index) => (
              <li key={country.countryCode} className="grid min-h-16 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                <span className="text-xs tabular-nums admin-muted">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{countryName(country.countryCode)}</p>
                  <p className="mt-0.5 text-xs admin-muted">{country.views.toLocaleString()} views</p>
                </div>
                <div className="text-right">
                  <strong className="block text-sm tabular-nums">{country.visitors.toLocaleString()}</strong>
                  <span className="text-[0.6875rem] admin-muted">visitors</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="px-5 py-12 md:px-6">
          <p className="font-medium">No visitor countries yet</p>
          <p className="mt-1 max-w-xl text-sm admin-muted">
            Local and private-network traffic cannot be geolocated. Countries will appear after public visits are resolved.
          </p>
        </div>
      )}
    </section>
  );
}
