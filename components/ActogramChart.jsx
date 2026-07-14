/**
 * components/ActogramChart.jsx — Weekly/whole-study sleep pattern chart
 *
 * Renders one vertical bar per morning diary entry, from bedtime (mq1) to
 * out-of-bed time (mq7), coloured with the same green/amber/red semantics
 * used by the other Final Report metric bars (see durationColor, latencyColor,
 * wasoColor in app/final-report.jsx):
 *   - green  (#2E7D32) — asleep
 *   - amber  (#F59E0B) — awake in bed (before falling asleep / after final
 *                        waking, and the brief falling-asleep window)
 *   - red    (#DC2626) — a night waking (illustrative marker only — the diary
 *                        records a count and total duration, not exact times)
 *
 * The Y axis is fixed on the left; only the bars scroll horizontally, so the
 * chart can span the whole study period rather than just one week.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Line, Text as SvgText } from 'react-native-svg';
import { locale } from '../i18n';
import { FONTS } from '../theme/typography';

const ASLEEP_COLOR = '#2E7D32';
const AWAKE_COLOR  = '#F59E0B';
const WAKING_COLOR = '#DC2626';
const GRID_COLOR   = '#E2EAF4';
const AXIS_TEXT    = '#94A3B8';

const PX_PER_MIN = 0.5; // 30px per hour
const COL_WIDTH  = 40;
const COL_GAP    = 12;
const BAR_WIDTH  = 26;
const TOP_PAD    = 10;
const LABEL_GAP  = 20;
const AXIS_WIDTH = 46;

// Shifts a clock time so hours before noon count as "the next day" — lets us
// compare/plot bedtime and wake time on one continuous scale across midnight.
const shiftedMinutes = (time) => {
  if (!time) return null;
  const h = time.hour < 12 ? time.hour + 24 : time.hour;
  return h * 60 + time.minute;
};

const floorTo = (mins, step) => Math.floor(mins / step) * step;
const ceilTo  = (mins, step) => Math.ceil(mins / step) * step;

const formatClock = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function ActogramChart({ entries }) {
  const scrollRef = useRef(null);

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

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [morning.length]);

  if (morning.length === 0) return null;

  const plotWidth  = morning.length * (COL_WIDTH + COL_GAP) + COL_GAP;
  const totalHeight = chartHeight + TOP_PAD * 2 + LABEL_GAP;

  return (
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

      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
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
            const colCenter = COL_GAP + i * (COL_WIDTH + COL_GAP) + COL_WIDTH / 2;
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
                <Rect x={x} y={yBed}   width={BAR_WIDTH} height={Math.max(0, yTried - yBed)} rx={4} fill={AWAKE_COLOR} />
                <Rect x={x} y={yTried} width={BAR_WIDTH} height={Math.max(0, yOnset - yTried)} fill={AWAKE_COLOR} />
                <Rect x={x} y={yOnset} width={BAR_WIDTH} height={Math.max(0, yWake - yOnset)} fill={ASLEEP_COLOR} />
                <Rect x={x} y={yWake}  width={BAR_WIDTH} height={Math.max(0, yOut - yWake)} rx={4} fill={AWAKE_COLOR} />
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
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
