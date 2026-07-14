/**
 * components/ActogramChart.jsx — Weekly/whole-study sleep pattern chart
 *
 * Renders one vertical bar per morning diary entry, from bedtime (mq1) to
 * out-of-bed time (mq7). Colours reuse the same green/amber/red semantics as
 * the other Final Report metric bars (durationColor, latencyColor, wasoColor
 * in app/final-report.jsx), but softened with the same alpha treatment those
 * bars already use for their reference bands (see BandBar's `color + '33'`):
 *   - soft green (#2E7D32 @ 20%) — asleep
 *   - soft amber (#F59E0B @ 20%) — awake in bed (before falling asleep /
 *                                  after final waking, and the brief
 *                                  falling-asleep window)
 *   - solid red  (#DC2626)       — a night waking marker, kept solid like
 *                                  BandBar's marker line, since it's a point
 *                                  event rather than a background band
 *     (illustrative only — the diary records a count and total duration,
 *      not exact times)
 *
 * The Y axis is fixed on the left; only the bars scroll horizontally, so the
 * chart can span the whole study period. Chevrons page by one week at a time
 * (Apple Health style); free dragging still works for finer navigation, and
 * the header date range updates as you scroll either way.
 */
import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import { locale } from '../i18n';
import { FONTS, SIZES } from '../theme/typography';

const ASLEEP_FILL  = '#2E7D3233'; // green @ 20% — matches BandBar's band alpha
const AWAKE_FILL   = '#F59E0B33'; // amber @ 20%
const WAKING_COLOR = '#DC2626';   // solid — a marker, not a band
const GRID_COLOR   = '#E2EAF4';
const AXIS_TEXT    = '#94A3B8';
const HEADER_TEXT  = '#1E3A5F';

const PX_PER_MIN = 0.5; // 30px per hour
const COL_WIDTH  = 40;
const COL_GAP    = 12;
const BAR_WIDTH  = 26;
const TOP_PAD    = 10;
const LABEL_GAP  = 20;
const AXIS_WIDTH = 46;
const COL_STEP   = COL_WIDTH + COL_GAP;
const WEEK_PX    = COL_STEP * 7;

// Shifts a clock time so hours before noon count as "the next day" — lets us
// compare/plot bedtime and wake time on one continuous scale across midnight.
const shiftedMinutes = (time) => {
  if (!time) return null;
  const h = time.hour < 12 ? time.hour + 24 : time.hour;
  return h * 60 + time.minute;
};

const floorTo = (mins, step) => Math.floor(mins / step) * step;
const ceilTo  = (mins, step) => Math.ceil(mins / step) * step;
const clamp   = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const formatClock = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function ActogramChart({ entries }) {
  const scrollRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const morning = useMemo(
    () => entries
      .filter((e) => e.type === 'morning' && e.answers?.mq1 && e.answers?.mq7)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [entries],
  );

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (morning.length === 0) return { rangeStart: 20 * 60, rangeEnd: 36 * 60 };
    let min = Infinity;
    let max = -Infinity;
    for (const e of morning) {
      const bed = shiftedMinutes(e.answers.mq1);
      const out = shiftedMinutes(e.answers.mq7);
      if (bed !== null) min = Math.min(min, bed);
      if (out !== null) max = Math.max(max, out);
    }
    return {
      rangeStart: floorTo(min - 30, 120),
      rangeEnd:   ceilTo(max + 30, 120),
    };
  }, [morning]);

  const chartHeight = (rangeEnd - rangeStart) * PX_PER_MIN;
  const yFor = (mins) => (mins - rangeStart) * PX_PER_MIN;

  const gridTimes = [];
  for (let m = rangeStart; m <= rangeEnd; m += 120) gridTimes.push(m);

  const plotWidth   = morning.length * COL_STEP + COL_GAP;
  const maxScrollX  = Math.max(0, plotWidth - viewportWidth);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [morning.length]);

  const handleScroll = useCallback((e) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  }, []);

  const goToWeek = (direction) => {
    const next = clamp(scrollX + direction * WEEK_PX, 0, maxScrollX);
    scrollRef.current?.scrollTo({ x: next, animated: true });
    setScrollX(next);
  };

  if (morning.length === 0) return null;

  const totalHeight = chartHeight + TOP_PAD * 2 + LABEL_GAP;

  // Date range currently in view, for the header label — mirrors Apple Health's
  // "18 – 24 May" style heading above the chart.
  const leftIndex  = clamp(Math.round(scrollX / COL_STEP), 0, morning.length - 1);
  const rightIndex = clamp(Math.round((scrollX + viewportWidth) / COL_STEP) - 1, leftIndex, morning.length - 1);
  const startDate  = new Date(`${morning[leftIndex].date}T12:00:00`);
  const endDate    = new Date(`${morning[rightIndex].date}T12:00:00`);
  const sameMonth  = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  const rangeLabel = sameMonth
    ? `${startDate.toLocaleDateString(locale, { day: 'numeric' })} \u2013 ${endDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
    : `${startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} \u2013 ${endDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const atStart = scrollX <= 0;
  const atEnd   = scrollX >= maxScrollX - 1;

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goToWeek(-1)} disabled={atStart} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={atStart ? '#C8D5E0' : HEADER_TEXT} />
        </TouchableOpacity>
        <Text style={[styles.headerLabel, { fontFamily: FONTS.bodyMedium }]}>{rangeLabel}</Text>
        <TouchableOpacity onPress={() => goToWeek(1)} disabled={atEnd} hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color={atEnd ? '#C8D5E0' : HEADER_TEXT} />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Svg width={AXIS_WIDTH} height={totalHeight}>
          {gridTimes.map((m) => (
            <SvgText
              key={m}
              x={0}
              y={yFor(m) + TOP_PAD + 4}
              fontFamily={FONTS.bodyMedium}
              fontSize={12}
              fill={AXIS_TEXT}
            >
              {formatClock(m)}
            </SvgText>
          ))}
        </Svg>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Svg width={plotWidth} height={totalHeight}>
            {gridTimes.map((m) => (
              <Line
                key={m}
                x1={0} y1={yFor(m) + TOP_PAD}
                x2={plotWidth} y2={yFor(m) + TOP_PAD}
                stroke={GRID_COLOR}
                strokeDasharray="3,4"
              />
            ))}

            {morning.map((entry, i) => {
              const a = entry.answers;
              const colCenter = COL_GAP + i * COL_STEP + COL_WIDTH / 2;
              const x = colCenter - BAR_WIDTH / 2;

              const bed      = shiftedMinutes(a.mq1);
              const tried    = shiftedMinutes(a.mq2) ?? bed;
              const solMin   = a.mq3 ? a.mq3.hours * 60 + a.mq3.minutes : 0;
              const onset    = tried + solMin;
              const outOfBed = shiftedMinutes(a.mq7);
              const finalWake = shiftedMinutes(a.mq6) ?? outOfBed;
              if (bed === null || outOfBed === null) return null;

              const yBed   = yFor(bed) + TOP_PAD;
              const yTried = yFor(tried) + TOP_PAD;
              const yOnset = yFor(onset) + TOP_PAD;
              const yWake  = yFor(finalWake) + TOP_PAD;
              const yOut   = yFor(outOfBed) + TOP_PAD;

              const wakings = a.mq4 === 'yes' ? (a.mq4b ?? 0) : 0;
              const dots = [];
              for (let k = 1; k <= wakings; k++) {
                dots.push(yOnset + ((yWake - yOnset) * k) / (wakings + 1));
              }

              const dayLabel = new Date(`${entry.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' });

              return (
                <React.Fragment key={entry.id}>
                  <Rect x={x} y={yBed}   width={BAR_WIDTH} height={Math.max(0, yTried - yBed)} rx={4} fill={AWAKE_FILL} />
                  <Rect x={x} y={yTried} width={BAR_WIDTH} height={Math.max(0, yOnset - yTried)} fill={AWAKE_FILL} />
                  <Rect x={x} y={yOnset} width={BAR_WIDTH} height={Math.max(0, yWake - yOnset)} fill={ASLEEP_FILL} />
                  <Rect x={x} y={yWake}  width={BAR_WIDTH} height={Math.max(0, yOut - yWake)} rx={4} fill={AWAKE_FILL} />
                  {dots.map((dy, idx) => (
                    <Circle key={idx} cx={colCenter} cy={dy} r={4} fill={WAKING_COLOR} />
                  ))}
                  <SvgText
                    x={colCenter}
                    y={chartHeight + TOP_PAD * 2 + LABEL_GAP - 6}
                    fontFamily={FONTS.bodyMedium}
                    fontSize={12}
                    fill={AXIS_TEXT}
                    textAnchor="middle"
                  >
                    {dayLabel}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  headerLabel: { fontSize: SIZES.caption, color: '#1E3A5F' },
});
