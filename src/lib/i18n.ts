/**
 * Internationalization (i18n) System
 * Feature 19: Multi-language support
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';

export interface Translations {
  // General
  appTitle: string;
  appSubtitle: string;
  startSimulation: string;
  learnMore: string;

  // Landing page
  whatIsRCVTitle: string;
  whatIsRCVBody: string;
  whatIsExhaustionTitle: string;
  whatIsExhaustionBody: string;
  howTitle: string;
  howBody: string;
  disclaimer: string;

  // Ballot
  fillBallot: string;
  rank1: string;
  rank2: string;
  rank3: string;
  rank4: string;
  submitBallot: string;
  clearBallot: string;

  // Results
  round: string;
  winner: string;
  eliminated: string;
  exhausted: string;
  continuing: string;
  threshold: string;

  // Controls
  previousRound: string;
  nextRound: string;
  restart: string;
  play: string;
  pause: string;

  // Toolbar
  share: string;
  exportCSV: string;
  exportJSON: string;
  print: string;
  colorScheme: string;

  // Features
  voters: string;
  simulatedVoters: string;
  modifyBallot: string;
  howRCVWorks: string;

  // Warnings
  overvoteWarning: string;
  blankRankWarning: string;
  duplicateWarning: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Ranked Choice Voting',
    appSubtitle: 'simulator',
    startSimulation: 'Start simulation',
    learnMore: 'Learn more',

    whatIsRCVTitle: 'What is Ranked Choice Voting?',
    whatIsRCVBody: 'Ranked Choice Voting (RCV) lets you rank candidates in order of preference. In each round of counting, your ballot counts for your highest-ranked continuing candidate.',
    whatIsExhaustionTitle: 'What is ballot exhaustion?',
    whatIsExhaustionBody: 'A ballot is exhausted when it can no longer count for any remaining candidate. This can happen if all of your ranked candidates have been eliminated.',
    howTitle: 'How this simulation works',
    howBody: 'This demo uses randomly selected candidates and synthetic voter ballots based on a spatial voting model.',
    disclaimer: 'This is a nonpartisan, educational simulation.',

    fillBallot: 'Fill Your Ballot',
    rank1: '1st',
    rank2: '2nd',
    rank3: '3rd',
    rank4: '4th',
    submitBallot: 'Submit Ballot',
    clearBallot: 'Clear',

    round: 'Round',
    winner: 'Winner',
    eliminated: 'Eliminated',
    exhausted: 'Exhausted',
    continuing: 'Continuing',
    threshold: 'Threshold',

    previousRound: 'Previous round',
    nextRound: 'Next round',
    restart: 'Restart',
    play: 'Play',
    pause: 'Pause',

    share: 'Share',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    print: 'Print',
    colorScheme: 'Color scheme',

    voters: 'voters',
    simulatedVoters: 'Simulated voters',
    modifyBallot: 'Modify My Ballot',
    howRCVWorks: 'How RCV Works',

    overvoteWarning: 'Overvote detected: multiple candidates at same rank',
    blankRankWarning: 'Blank rank detected: some ranks are empty',
    duplicateWarning: 'Duplicate ranking: same candidate ranked multiple times'
  },

  es: {
    appTitle: 'Votación por Orden de Preferencia',
    appSubtitle: 'simulador',
    startSimulation: 'Iniciar simulación',
    learnMore: 'Saber más',

    whatIsRCVTitle: '¿Qué es la Votación por Orden de Preferencia?',
    whatIsRCVBody: 'La Votación por Orden de Preferencia (RCV) le permite clasificar a los candidatos en orden de preferencia.',
    whatIsExhaustionTitle: '¿Qué es el agotamiento de boletas?',
    whatIsExhaustionBody: 'Una boleta se agota cuando ya no puede contar para ningún candidato restante.',
    howTitle: 'Cómo funciona esta simulación',
    howBody: 'Esta demostración utiliza candidatos seleccionados al azar y boletas de votantes sintéticas.',
    disclaimer: 'Esta es una simulación educativa no partidista.',

    fillBallot: 'Complete su boleta',
    rank1: '1º',
    rank2: '2º',
    rank3: '3º',
    rank4: '4º',
    submitBallot: 'Enviar boleta',
    clearBallot: 'Limpiar',

    round: 'Ronda',
    winner: 'Ganador',
    eliminated: 'Eliminado',
    exhausted: 'Agotado',
    continuing: 'Continuando',
    threshold: 'Umbral',

    previousRound: 'Ronda anterior',
    nextRound: 'Siguiente ronda',
    restart: 'Reiniciar',
    play: 'Reproducir',
    pause: 'Pausar',

    share: 'Compartir',
    exportCSV: 'Exportar CSV',
    exportJSON: 'Exportar JSON',
    print: 'Imprimir',
    colorScheme: 'Esquema de colores',

    voters: 'votantes',
    simulatedVoters: 'Votantes simulados',
    modifyBallot: 'Modificar mi boleta',
    howRCVWorks: 'Cómo funciona RCV',

    overvoteWarning: 'Sobrevoto detectado: múltiples candidatos en el mismo rango',
    blankRankWarning: 'Rango en blanco detectado: algunos rangos están vacíos',
    duplicateWarning: 'Clasificación duplicada: mismo candidato clasificado varias veces'
  },

  fr: {
    appTitle: 'Vote Préférentiel',
    appSubtitle: 'simulateur',
    startSimulation: 'Démarrer la simulation',
    learnMore: 'En savoir plus',

    whatIsRCVTitle: "Qu'est-ce que le Vote Préférentiel?",
    whatIsRCVBody: 'Le Vote Préférentiel (RCV) vous permet de classer les candidats par ordre de préférence.',
    whatIsExhaustionTitle: "Qu'est-ce que l'épuisement du bulletin?",
    whatIsExhaustionBody: "Un bulletin est épuisé lorsqu'il ne peut plus compter pour aucun candidat restant.",
    howTitle: 'Comment fonctionne cette simulation',
    howBody: 'Cette démo utilise des candidats sélectionnés au hasard et des bulletins de vote synthétiques.',
    disclaimer: 'Ceci est une simulation éducative non partisane.',

    fillBallot: 'Remplissez votre bulletin',
    rank1: '1er',
    rank2: '2ème',
    rank3: '3ème',
    rank4: '4ème',
    submitBallot: 'Soumettre le bulletin',
    clearBallot: 'Effacer',

    round: 'Tour',
    winner: 'Gagnant',
    eliminated: 'Éliminé',
    exhausted: 'Épuisé',
    continuing: 'Continuant',
    threshold: 'Seuil',

    previousRound: 'Tour précédent',
    nextRound: 'Tour suivant',
    restart: 'Redémarrer',
    play: 'Lecture',
    pause: 'Pause',

    share: 'Partager',
    exportCSV: 'Exporter CSV',
    exportJSON: 'Exporter JSON',
    print: 'Imprimer',
    colorScheme: 'Schéma de couleurs',

    voters: 'électeurs',
    simulatedVoters: 'Électeurs simulés',
    modifyBallot: 'Modifier mon bulletin',
    howRCVWorks: 'Comment fonctionne RCV',

    overvoteWarning: 'Sur-vote détecté: plusieurs candidats au même rang',
    blankRankWarning: 'Rang vide détecté: certains rangs sont vides',
    duplicateWarning: 'Classement en double: même candidat classé plusieurs fois'
  },

  de: {
    appTitle: 'Rangfolgewahl',
    appSubtitle: 'Simulator',
    startSimulation: 'Simulation starten',
    learnMore: 'Mehr erfahren',

    whatIsRCVTitle: 'Was ist Rangfolgewahl?',
    whatIsRCVBody: 'Bei der Rangfolgewahl (RCV) können Sie Kandidaten nach Präferenz ordnen.',
    whatIsExhaustionTitle: 'Was ist Stimmzettelerschöpfung?',
    whatIsExhaustionBody: 'Ein Stimmzettel ist erschöpft, wenn er für keinen verbleibenden Kandidaten mehr zählen kann.',
    howTitle: 'Wie diese Simulation funktioniert',
    howBody: 'Diese Demo verwendet zufällig ausgewählte Kandidaten und synthetische Wählerstimmzettel.',
    disclaimer: 'Dies ist eine überparteiliche, pädagogische Simulation.',

    fillBallot: 'Füllen Sie Ihren Stimmzettel aus',
    rank1: '1.',
    rank2: '2.',
    rank3: '3.',
    rank4: '4.',
    submitBallot: 'Stimmzettel einreichen',
    clearBallot: 'Löschen',

    round: 'Runde',
    winner: 'Gewinner',
    eliminated: 'Eliminiert',
    exhausted: 'Erschöpft',
    continuing: 'Fortlaufend',
    threshold: 'Schwelle',

    previousRound: 'Vorherige Runde',
    nextRound: 'Nächste Runde',
    restart: 'Neustart',
    play: 'Abspielen',
    pause: 'Pause',

    share: 'Teilen',
    exportCSV: 'CSV exportieren',
    exportJSON: 'JSON exportieren',
    print: 'Drucken',
    colorScheme: 'Farbschema',

    voters: 'Wähler',
    simulatedVoters: 'Simulierte Wähler',
    modifyBallot: 'Meinen Stimmzettel ändern',
    howRCVWorks: 'Wie RCV funktioniert',

    overvoteWarning: 'Überstimme erkannt: mehrere Kandidaten auf demselben Rang',
    blankRankWarning: 'Leerer Rang erkannt: einige Ränge sind leer',
    duplicateWarning: 'Doppelte Rangfolge: derselbe Kandidat mehrfach eingestuft'
  },

  zh: {
    appTitle: '排序复选制投票',
    appSubtitle: '模拟器',
    startSimulation: '开始模拟',
    learnMore: '了解更多',

    whatIsRCVTitle: '什么是排序复选制投票?',
    whatIsRCVBody: '排序复选制投票(RCV)允许您按偏好顺序对候选人进行排名。',
    whatIsExhaustionTitle: '什么是选票耗尽?',
    whatIsExhaustionBody: '当选票无法再为任何剩余候选人计票时，该选票即被耗尽。',
    howTitle: '此模拟如何运作',
    howBody: '此演示使用随机选择的候选人和基于空间投票模型的合成选民选票。',
    disclaimer: '这是一个无党派的教育模拟。',

    fillBallot: '填写您的选票',
    rank1: '第1',
    rank2: '第2',
    rank3: '第3',
    rank4: '第4',
    submitBallot: '提交选票',
    clearBallot: '清除',

    round: '轮次',
    winner: '获胜者',
    eliminated: '淘汰',
    exhausted: '耗尽',
    continuing: '继续',
    threshold: '阈值',

    previousRound: '上一轮',
    nextRound: '下一轮',
    restart: '重新开始',
    play: '播放',
    pause: '暂停',

    share: '分享',
    exportCSV: '导出CSV',
    exportJSON: '导出JSON',
    print: '打印',
    colorScheme: '配色方案',

    voters: '选民',
    simulatedVoters: '模拟选民',
    modifyBallot: '修改我的选票',
    howRCVWorks: 'RCV如何运作',

    overvoteWarning: '检测到多选：同一排名有多个候选人',
    blankRankWarning: '检测到空白排名：某些排名为空',
    duplicateWarning: '重复排名：同一候选人被多次排名'
  }
};

// Current language state
let currentLanguage: Language = 'en';

/**
 * Get browser's preferred language
 */
export function detectLanguage(): Language {
  const browserLang = navigator.language.split('-')[0] as Language;
  return translations[browserLang] ? browserLang : 'en';
}

/**
 * Initialize language from localStorage or browser
 */
export function initLanguage(): Language {
  const stored = localStorage.getItem('rcv-sim-language') as Language | null;
  currentLanguage = stored && translations[stored] ? stored : detectLanguage();
  document.documentElement.setAttribute('lang', currentLanguage);
  return currentLanguage;
}

/**
 * Set current language
 */
export function setLanguage(lang: Language): void {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('rcv-sim-language', lang);
    document.documentElement.setAttribute('lang', lang);
  }
}

/**
 * Get current language
 */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * Get translation for a key
 */
export function t(key: keyof Translations): string {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

/**
 * Get all translations for current language
 */
export function getTranslations(): Translations {
  return translations[currentLanguage];
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' }
  ];
}

/**
 * Render language selector
 */
export function renderLanguageSelector(container: HTMLElement, onChange?: () => void): void {
  const select = document.createElement('select');
  select.className = 'language-select';
  select.setAttribute('aria-label', 'Select language');

  getAvailableLanguages().forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    option.selected = lang.code === currentLanguage;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    setLanguage(select.value as Language);
    if (onChange) onChange();
    // Reload to apply translations
    window.location.reload();
  });

  container.appendChild(select);
}
