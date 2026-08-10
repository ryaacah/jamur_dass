// components/BottomNav.tsx
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, styles } from "../app/styles";

const IconHome = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} />
    <Path d="M9 21V12h6v9" stroke={color} />
  </Svg>
);

const IconStats = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={12} width={4} height={9} rx={1} stroke={color} />
    <Rect x={10} y={7} width={4} height={14} rx={1} stroke={color} />
    <Rect x={17} y={3} width={4} height={18} rx={1} stroke={color} />
  </Svg>
);

const IconJournal = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} />
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} />
  </Svg>
);

export default function BottomNav({ active }: { active?: "home" | "chart" | "journal" }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.bottomNavWrapper, { paddingBottom: insets.bottom }]}
      pointerEvents="box-none"
    >
      <View style={styles.bottomNav}>
        <Link href="/" asChild>
          <TouchableOpacity
            style={StyleSheet.flatten([styles.navItem, active === "home" && styles.navItemActive])}
            activeOpacity={1}
            accessibilityLabel="Beranda"
            accessibilityRole="button"
          >
            <IconHome color={active === "home" ? colors.ink : colors.inkSoft} />
          </TouchableOpacity>
        </Link>

        <Link href="/journal" asChild>
          <TouchableOpacity
            style={StyleSheet.flatten([styles.navItem, active === "journal" && styles.navItemActive])}
            activeOpacity={1}
            accessibilityLabel="Jurnal"
            accessibilityRole="button"
          >
            <IconJournal color={active === "journal" ? colors.ink : colors.inkSoft} />
          </TouchableOpacity>
        </Link>

        <Link href="/dass-history" asChild>
          <TouchableOpacity
            style={StyleSheet.flatten([styles.navItem, active === "chart" && styles.navItemActive])}
            activeOpacity={1}
            accessibilityLabel="Statistik"
            accessibilityRole="button"
          >
            <IconStats color={active === "chart" ? colors.ink : colors.inkSoft} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}