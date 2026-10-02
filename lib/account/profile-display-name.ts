export type DisplayNameError = 'required' | 'tooLong' | 'invalid'
export type DisplayNameResult =
  | { valid: true; value: string }
  | { valid: false; error: DisplayNameError }

export function validateDisplayName(input: unknown): DisplayNameResult {
  if (typeof input !== 'string') return { valid: false, error: 'invalid' }
  // Match the existing server projection's whitespace normalization; never truncate edits.
  const value = input.trim().replace(/\s+/g, ' ')
  if (!value) return { valid: false, error: 'required' }
  if (Array.from(value).length > 80) return { valid: false, error: 'tooLong' }
  if (/[\u0000-\u001f\u007f-\u009f]/.test(value)) return { valid: false, error: 'invalid' }
  return { valid: true, value }
}
