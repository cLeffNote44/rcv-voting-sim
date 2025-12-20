import { t } from './lib/i18n';

/**
 * Landing page copy - now uses i18n translations
 * Falls back to English if translation not available
 */
export const landingCopy = {
  get whatIsRCVTitle() { return t('whatIsRCVTitle'); },
  get whatIsRCVBody() { return t('whatIsRCVBody'); },
  get whatIsExhaustionTitle() { return t('whatIsExhaustionTitle'); },
  get whatIsExhaustionBody() { return t('whatIsExhaustionBody'); },
  get howTitle() { return t('howTitle'); },
  get howBody() { return t('howBody'); },
  get disclaimer() { return t('disclaimer'); },
};

