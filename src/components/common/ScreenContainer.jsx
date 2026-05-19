import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../utils/colors';

export default function ScreenContainer({ children, style, edges }) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges || ['top']}>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
