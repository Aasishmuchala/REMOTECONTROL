'use client'

import { useEffect, useRef } from 'react'
import { createChart, AreaSeries, ColorType } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import { computeCumulativeDepth } from '@/lib/depth-utils'
import type { BookLevel } from '@/types/socket'

interface DepthChartProps {
  bids: BookLevel[]
  asks: BookLevel[]
}

export default function DepthChart({ bids, asks }: DepthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const bidSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const askSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)

  // Initialize chart once (SSR-safe: useEffect only runs client-side)
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(240, 240, 255, 0.35)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      height: 200,
      autoSize: true,
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    })

    // v5 API: addSeries(AreaSeries, options) — NOT addAreaSeries()
    const bidSeries = chart.addSeries(AreaSeries, {
      lineColor: '#00ff88',
      topColor: 'rgba(0, 255, 136, 0.3)',
      bottomColor: 'rgba(0, 255, 136, 0.02)',
      lineWidth: 2,
    })

    const askSeries = chart.addSeries(AreaSeries, {
      lineColor: '#ff4466',
      topColor: 'rgba(255, 68, 102, 0.3)',
      bottomColor: 'rgba(255, 68, 102, 0.02)',
      lineWidth: 2,
    })

    chartRef.current = chart
    bidSeriesRef.current = bidSeries
    askSeriesRef.current = askSeries

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Update series data on bids/asks change (D-07: every orderbook event)
  useEffect(() => {
    if (!bidSeriesRef.current || !askSeriesRef.current) return

    const bidData = computeCumulativeDepth(bids, false)
    const askData = computeCumulativeDepth(asks, true)

    if (bidData.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bidSeriesRef.current.setData(bidData as any)
    }
    if (askData.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      askSeriesRef.current.setData(askData as any)
    }
  }, [bids, asks])

  return (
    <div className="glass rounded-2xl p-3">
      <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
        Depth Chart
      </h3>
      <div ref={containerRef} className="w-full h-[200px]" />
    </div>
  )
}
