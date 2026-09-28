import { RideOptions } from "./RideOptions";

/** /ride/options[?to=<placeId>] — `to` starts a new draft toward that place (used by Explorer / promos links). */
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  return <RideOptions to={to} />;
}
