// ClockFace.tsx — drop-in replacement untuk komponen ClockFace di settings-notification.tsx
// Fix semua masalah:
// 1. Jarum mengikuti jari secara real-time (PanResponder)
// 2. Tidak loncat/bouncy — tidak ada spring animation, langsung update
// 3. Inner ring (0, 13-23) terdeteksi dengan benar berdasarkan jarak sentuhan
// 4. Jam 12 dan 0 di-handle dengan benar
// 5. Smooth karena pakai direct state update tanpa Animated

import React, { useRef } from 'react';
import { PanResponder, View, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const CLOCK_SIZE = 256;
const CLOCK_CENTER = CLOCK_SIZE / 2; // 128
const OUTER_RADIUS = 96;
const INNER_RADIUS = 60;
const NUM_SIZE_OUTER = 36;
const NUM_SIZE_INNER = 28;

// Threshold jarak untuk menentukan inner vs outer ring
const RING_THRESHOLD = (OUTER_RADIUS + INNER_RADIUS) / 2; // ~78

interface ClockFaceProps {
  mode: 'hour' | 'minute';
  hour: number;    // 0-23
  minute: number;  // 0-59
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onRelease?: () => void;
}

// Hitung posisi ujung jarum dari nilai jam/menit
function getHandPosition(mode: 'hour' | 'minute', hour: number, minute: number) {
  let angle: number;
  let radius: number;

  if (mode === 'hour') {
    // Inner ring: 0 dan 13-23
    const isInner = hour === 0 || hour > 12;
    radius = isInner ? INNER_RADIUS : OUTER_RADIUS;
    const h12 = hour % 12; // 0-11
    angle = (h12 / 12) * 360 - 90; // -90 supaya 12 ada di atas
  } else {
    radius = OUTER_RADIUS;
    angle = (minute / 60) * 360 - 90;
  }

  const rad = (angle * Math.PI) / 180;
  return {
    x: CLOCK_CENTER + radius * Math.cos(rad),
    y: CLOCK_CENTER + radius * Math.sin(rad),
  };
}

// Hitung nilai jam/menit dari posisi sentuhan
function positionToValue(
  mode: 'hour' | 'minute',
  dx: number, // dx dari center
  dy: number, // dy dari center
  dist: number,
): number {
  // Sudut dalam derajat, 0 = kanan, naik searah jarum jam dari atas
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (angle < 0) angle += 360;
  if (angle >= 360) angle -= 360;

  if (mode === 'hour') {
    const useInner = dist < RING_THRESHOLD;
    let h = Math.round(angle / 30) % 12; // 0-11

    if (useInner) {
      // Inner ring: 0 dan 13-23
      // h=0 → 0 (tengah malam), h=1→13, h=2→14, ..., h=11→23
      h = h === 0 ? 0 : h + 12;
    } else {
      // Outer ring: 1-12
      h = h === 0 ? 12 : h;
    }
    return h;
  } else {
    // Menit: 0-59
    return Math.round(angle / 6) % 60;
  }
}

export function ClockFace({
  mode,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  onRelease,
}: ClockFaceProps) {
  const containerRef = useRef<View>(null);
  // Simpan offset layout supaya bisa hitung posisi sentuhan relatif ke center clock
  const layoutOffset = useRef({ x: 0, y: 0 });

  const handleValue = (pageX: number, pageY: number) => {
    const dx = pageX - layoutOffset.current.x - CLOCK_CENTER;
    const dy = pageY - layoutOffset.current.y - CLOCK_CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const value = positionToValue(mode, dx, dy, dist);

    if (mode === 'hour') {
      onHourChange(value);
    } else {
      onMinuteChange(value);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        handleValue(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderMove: (e) => {
        handleValue(e.nativeEvent.pageX, e.nativeEvent.pageY);
      },
      onPanResponderRelease: () => {
        if (onRelease) onRelease();
      },
    })
  ).current;

  const handPos = getHandPosition(mode, hour, minute);

  // Outer ring: 12, 1, 2, ..., 11
  const outerNums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Inner ring: 00, 13, 14, ..., 23
  const innerNums = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const isInnerSelected = mode === 'hour' && (hour === 0 || hour > 12);

  return (
    <View
      ref={containerRef}
      style={{
        width: CLOCK_SIZE,
        height: CLOCK_SIZE,
        position: 'relative',
        backgroundColor: '#F5F0EA',
        borderRadius: CLOCK_SIZE / 2,
      }}
      onLayout={() => {
        // Ukur posisi absolut container di layar
        containerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
          layoutOffset.current = { x: pageX, y: pageY };
        });
      }}
      {...panResponder.panHandlers}
    >
      {/* SVG untuk jarum — di atas angka */}
      <Svg
        width={CLOCK_SIZE}
        height={CLOCK_SIZE}
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none"
      >
        {/* Garis jarum */}
        <Line
          x1={CLOCK_CENTER}
          y1={CLOCK_CENTER}
          x2={handPos.x}
          y2={handPos.y}
          stroke="#7B5EA7"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Titik pivot tengah */}
        <Circle cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={4} fill="#7B5EA7" />
        {/* Bulatan ujung jarum */}
        <Circle cx={handPos.x} cy={handPos.y} r={18} fill="#7B5EA7" />
      </Svg>

      {/* Outer ring numbers */}
      {outerNums.map((num, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const x = CLOCK_CENTER + OUTER_RADIUS * Math.cos(angle) - NUM_SIZE_OUTER / 2;
        const y = CLOCK_CENTER + OUTER_RADIUS * Math.sin(angle) - NUM_SIZE_OUTER / 2;

        const isHourSelected =
          mode === 'hour' && !isInnerSelected &&
          (hour === num || (num === 12 && hour === 12));
        const isMinSelected =
          mode === 'minute' && (num * 5) % 60 === minute;
        const isSelected = isHourSelected || isMinSelected;

        return (
          <Text
            key={`outer-${num}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: NUM_SIZE_OUTER,
              height: NUM_SIZE_OUTER,
              textAlign: 'center',
              textAlignVertical: 'center',
              lineHeight: NUM_SIZE_OUTER,
              fontSize: 14,
              fontFamily: 'Fredoka_500Medium',
              color: isSelected ? '#FFFFFF' : '#3D3340',
              backgroundColor: isSelected ? '#7B5EA7' : 'transparent',
              borderRadius: NUM_SIZE_OUTER / 2,
              zIndex: 2,
            }}
          >
            {mode === 'minute' ? String((num * 5) % 60).padStart(2, '0') : num}
          </Text>
        );
      })}

      {/* Inner ring numbers (hour only) */}
      {mode === 'hour' &&
        innerNums.map((num, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          const x = CLOCK_CENTER + INNER_RADIUS * Math.cos(angle) - NUM_SIZE_INNER / 2;
          const y = CLOCK_CENTER + INNER_RADIUS * Math.sin(angle) - NUM_SIZE_INNER / 2;
          const isSelected = hour === num;
          const label = num === 0 ? '00' : String(num);

          return (
            <Text
              key={`inner-${num}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: NUM_SIZE_INNER,
                height: NUM_SIZE_INNER,
                textAlign: 'center',
                textAlignVertical: 'center',
                lineHeight: NUM_SIZE_INNER,
                fontSize: 11,
                fontFamily: 'Fredoka_500Medium',
                color: isSelected ? '#FFFFFF' : '#7A6A72',
                backgroundColor: isSelected ? '#7B5EA7' : 'transparent',
                borderRadius: NUM_SIZE_INNER / 2,
                zIndex: 2,
              }}
            >
              {label}
            </Text>
          );
        })}
    </View>
  );
}