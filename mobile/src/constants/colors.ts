/**
 * App Color Palette
 * Only using the three brand colors
 */

export const Colors = {
  // Brand colors only
  primary: '#0b2735',      // Primary - Dark teal/blue
  secondary: '#efb291',    // Secondary - Peach/Orange accent
  tertiary: '#e5e2db',     // Tertiary - Light beige/cream
  
  // Derived from brand colors
  text: '#0b2735',         // Primary for text
  textSecondary: '#0b2735', // Primary with opacity for secondary text
  background: '#e5e2db',   // Tertiary for background
  white: '#ffffff',        // White for cards/contrast
  border: '#e5e2db',       // Tertiary for borders
  shadow: 'rgba(11, 39, 53, 0.15)', // Primary with opacity for shadows
  placeholder: 'rgba(11, 39, 53, 0.45)', // Input placeholder
} as const;

export default Colors;
