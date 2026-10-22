/** Projection of styles/talentry-tokens.css. rem values use its documented 16px base.
 * Native system font follows the CSS system fallback; no new font dependency.
 * No motion is used in this diagnostic shell.
 */
export const tokens = {
  color: { // --talentry-color-{canvas,surface,surface-lavender,text,text-secondary,border,border-focus}
    canvas: '#F4F6FB', surface: '#FFFFFF', lavender: '#F7F5FF', text: '#202944',
    secondary: '#475569', border: '#E8E8F2', focus: '#7657E8',
  },
  space: { small: 8, medium: 16, large: 24, wide: 32 }, // --talentry-space-{2,4,6,8}
  radius: 12, // --talentry-radius-md
  font: { body: 16, title: 24, regular: '400', semibold: '600' }, // size-md/2xl, weight-regular/semibold
  controlHeight: 44, // --talentry-button-height-md
} as const
