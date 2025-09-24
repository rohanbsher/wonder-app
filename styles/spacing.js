// Spacing system - Steve Jobs would insist on consistency
// Based on 8px grid system for perfect alignment

export const Spacing = {
  // Base unit
  unit: 8,

  // Scale
  xs: 8,    // 1 unit
  sm: 16,   // 2 units
  md: 24,   // 3 units - DEFAULT for all padding
  lg: 32,   // 4 units
  xl: 40,   // 5 units
  xxl: 48,  // 6 units
  xxxl: 56, // 7 units
  huge: 64, // 8 units

  // Component-specific spacing
  screen: {
    paddingHorizontal: 24, // Consistent across ALL screens
    paddingVertical: 40,
  },

  card: {
    padding: 24,
    borderRadius: 20,
  },

  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },

  input: {
    padding: 16,
    borderRadius: 15,
  },

  // Gaps between elements
  gap: {
    tiny: 4,
    small: 8,
    medium: 12,
    large: 16,
    huge: 24,
  },

  // Section spacing
  section: {
    marginBottom: 40,
  },
};

// Helper functions
export const spacing = (multiplier = 1) => Spacing.unit * multiplier;

export const getSpacing = (size) => {
  return Spacing[size] || Spacing.md;
};

// Export for StyleSheet
export default Spacing;