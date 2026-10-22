import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { layoutClass } from './layout-class'
import { shellStyles as styles } from './shell-styles'

export function AdaptiveShell({ title, children, secondary }: { title: string; children: ReactNode; secondary: ReactNode }) {
  const { width, fontScale } = useWindowDimensions()
  const layout = layoutClass(width, fontScale)
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.container, layout === 'medium' && styles.medium]}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text style={styles.text}>Layout probe: {layout}. Window width: {Math.round(width)}.</Text>
            <View style={[styles.panes, layout === 'expanded' && styles.expanded]}>
              <View style={styles.pane}>{children}</View>
              <View style={[styles.pane, styles.secondary]}>{secondary}</View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
