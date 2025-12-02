import type { CellBountyCountry } from '@/components/Mapbox/types/mapbox'

export type IndicatorSide = 'left' | 'right' | 'top' | 'bottom'

export interface CountryLabelPosition {
  id: string
  name: string
  count: number
  style: Record<string, string>
  highlight: boolean
}

export interface RawIndicator {
  id: string
  code: string
  name: string
  side: IndicatorSide
  x: number
  y: number
  projectedX: number
  projectedY: number
  alongEdge: number
  rotation: number
}

export interface EdgeIndicator {
  id: string
  code: string
  name: string
  side: IndicatorSide
  style: Record<string, string>
  rotation: number
  overflow?: CellBountyCountry[]
}

export interface OverlayLayoutContext {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  spacing: number
  indicatorOffset: number
}

export interface ProjectedCountry {
  id: string
  code: string
  name: string
  count: number
  projectedX: number
  projectedY: number
  isVisible: boolean
  highlight: boolean
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const computeArrowRotation = (
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
) => (Math.atan2(targetY - originY, targetX - originX) * 180) / Math.PI + 90

export const classifySideAndPosition = (
  projectedX: number,
  projectedY: number,
  layout: OverlayLayoutContext,
): {
  side: IndicatorSide
  x: number
  y: number
  alongEdge: number
} => {
  const clampedX = clamp(projectedX, layout.xMin, layout.xMax)
  const clampedY = clamp(projectedY, layout.yMin, layout.yMax)

  if (projectedX < layout.xMin) {
    return {
      side: 'left',
      x: clamp(layout.xMin + layout.indicatorOffset, layout.xMin, layout.xMax),
      y: clampedY,
      alongEdge: clampedY,
    }
  }

  if (projectedX > layout.xMax) {
    return {
      side: 'right',
      x: clamp(layout.xMax - layout.indicatorOffset, layout.xMin, layout.xMax),
      y: clampedY,
      alongEdge: clampedY,
    }
  }

  if (projectedY < layout.yMin) {
    const y = clamp(
      layout.yMin + layout.indicatorOffset,
      layout.yMin,
      layout.yMax,
    )
    return {
      side: 'top',
      x: clampedX,
      y,
      alongEdge: clampedX,
    }
  }

  const y = clamp(
    layout.yMax - layout.indicatorOffset,
    layout.yMin,
    layout.yMax,
  )
  return {
    side: 'bottom',
    x: clampedX,
    y,
    alongEdge: clampedX,
  }
}

export const computeLabelsAndRawIndicators = (
  countries: ProjectedCountry[],
  layout: OverlayLayoutContext,
): { labels: CountryLabelPosition[]; rawIndicators: RawIndicator[] } => {
  const labels: CountryLabelPosition[] = []
  const rawIndicators: RawIndicator[] = []

  countries.forEach((country) => {
    if (country.isVisible) {
      labels.push({
        id: country.id,
        name: country.name,
        count: country.count,
        style: {
          transform: `translate(${country.projectedX}px, ${country.projectedY}px)`,
        },
        highlight: country.highlight,
      })
      return
    }

    const classified = classifySideAndPosition(
      country.projectedX,
      country.projectedY,
      layout,
    )

    rawIndicators.push({
      id: country.id,
      code: country.code,
      name: country.name,
      side: classified.side,
      x: classified.x,
      y: classified.y,
      projectedX: country.projectedX,
      projectedY: country.projectedY,
      alongEdge: classified.alongEdge,
      rotation: computeArrowRotation(
        classified.x,
        classified.y,
        country.projectedX,
        country.projectedY,
      ),
    })
  })

  return { labels, rawIndicators }
}

export const layoutIndicatorsWithSpacing = ({
  rawIndicators,
  layout,
  countries,
}: {
  rawIndicators: RawIndicator[]
  layout: OverlayLayoutContext
  countries: CellBountyCountry[]
}): EdgeIndicator[] => {
  const sideOrder: IndicatorSide[] = ['left', 'right', 'top', 'bottom']
  const indicators: EdgeIndicator[] = []

  sideOrder.forEach((side) => {
    const items = rawIndicators
      .filter((indicator) => indicator.side === side)
      .sort((a, b) => a.alongEdge - b.alongEdge)

    const maxPerSide = 3
    const displayed =
      items.length > maxPerSide ? items.slice(0, maxPerSide - 1) : items.slice()
    const overflow =
      items.length > maxPerSide ? items.slice(maxPerSide - 1) : []
    const axisMin = side === 'top' || side === 'bottom' ? layout.xMin : layout.yMin
    const axisMax = side === 'top' || side === 'bottom' ? layout.xMax : layout.yMax
    let lastPosition = -Infinity

    displayed.forEach((indicator) => {
      const desired = indicator.alongEdge
      let resolved = desired

      if (resolved - lastPosition < layout.spacing) {
        resolved = lastPosition + layout.spacing
      }

      resolved = clamp(resolved, axisMin, axisMax)

      let finalX = indicator.x
      let finalY = indicator.y

      if (side === 'left' || side === 'right') {
        finalY = resolved
      } else {
        finalX = resolved
      }

      const positionStyle =
        side === 'left' || side === 'right'
          ? {
              top: `${finalY}px`,
              left: `${indicator.x}px`,
            }
          : {
              left: `${finalX}px`,
              top: `${indicator.y}px`,
            }

      indicators.push({
        id: indicator.id,
        code: indicator.code,
        name: indicator.name,
        side,
        style: positionStyle,
        rotation: computeArrowRotation(
          finalX,
          finalY,
          indicator.projectedX,
          indicator.projectedY,
        ),
      })
      lastPosition = resolved
    })

    if (overflow.length) {
      const overflowLabel = `+${overflow.length}`
      const overflowCountries = overflow
        .map((item) => countries.find((c) => c.id === item.id))
        .filter(Boolean) as CellBountyCountry[]
      const overflowPosition = clamp(
        lastPosition + layout.spacing,
        axisMin,
        axisMax,
      )
      const overflowX =
        side === 'left'
          ? clamp(layout.xMin + layout.indicatorOffset, layout.xMin, layout.xMax)
          : side === 'right'
            ? clamp(layout.xMax - layout.indicatorOffset, layout.xMin, layout.xMax)
            : overflowPosition
      const overflowY =
        side === 'top'
          ? clamp(layout.yMin + layout.indicatorOffset, layout.yMin, layout.yMax)
          : side === 'bottom'
            ? clamp(layout.yMax - layout.indicatorOffset, layout.yMin, layout.yMax)
            : overflowPosition
      const overflowAngle = computeArrowRotation(
        overflowX,
        overflowY,
        overflow[0].projectedX,
        overflow[0].projectedY,
      )

      const overflowStyle =
        side === 'left' || side === 'right'
          ? { top: `${overflowPosition}px`, left: `${overflowX}px` }
          : { left: `${overflowPosition}px`, top: `${overflowY}px` }

      indicators.push({
        id: `${side}-overflow`,
        code: overflowLabel,
        name: `${overflow.length} more`,
        side,
        style: overflowStyle,
        rotation: overflowAngle,
        overflow: overflowCountries,
      })
    }
  })

  return indicators
}
