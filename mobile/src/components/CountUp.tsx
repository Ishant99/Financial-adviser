import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TextStyle, StyleProp } from "react-native";
import { formatCurrency } from "../lib/format";

// Animated currency count-up — gives the hero number a little life on each visit.
export function CountUp({ value, style, duration = 900 }: {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, duration, anim]);

  return <Text style={style}>{formatCurrency(display)}</Text>;
}
