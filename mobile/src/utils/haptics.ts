/** Light haptic on press — no-op if native module unavailable. */
export async function lightHaptic(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Haptics = require('expo-haptics') as {
      impactAsync: (s: unknown) => Promise<void>;
      ImpactFeedbackStyle: { Light: unknown };
    };
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // optional / not in dev client build
  }
}
