import { StyleSheet } from 'react-native'
import { tokens as t } from '../theme/tokens'
export const shellStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.color.canvas }, fill: { flex: 1 },
  scroll: { flexGrow: 1, padding: t.space.medium },
  container: { width: '100%', maxWidth: 1400, alignSelf: 'center', gap: t.space.medium },
  medium: { maxWidth: 840 }, title: { fontSize: t.font.title, fontWeight: t.font.semibold, color: t.color.text },
  text: { fontSize: t.font.body, color: t.color.secondary, lineHeight: 24 },
  panes: { gap: t.space.medium }, expanded: { flexDirection: 'row', alignItems: 'stretch' },
  pane: { flex: 1, minWidth: 0, padding: t.space.large, borderWidth: 1, borderColor: t.color.border,
    backgroundColor: t.color.surface, borderRadius: t.radius, gap: t.space.medium },
  secondary: { backgroundColor: t.color.lavender },
  control: { minHeight: t.controlHeight, borderWidth: 1, borderColor: t.color.border, borderRadius: t.radius,
    padding: t.space.small, justifyContent: 'center' },
  focused: { borderColor: t.color.focus, borderWidth: 2 },
})
