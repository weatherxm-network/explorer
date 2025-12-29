export const formatNearbyStationsLabel = (
  count: number,
  isCellBounty: boolean,
) => {
  if (isCellBounty) {
    if (count <= 0) return null
    return `Active cell bounties: ${count}`
  }

  return `${count} active stations in this area`
}
