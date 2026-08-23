// Ported from Dart WordImportParserService

export interface WordImportResult {
  isSuccess: boolean;
  word?: string;
  ipa?: string;
  partOfSpeech?: string;
  difficulty?: string;
  simpleMeaning?: string;
  advancedMeaning?: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  commonCollocations: string[];
  memoryTrick?: string;
  commonMistakes?: string;
}

const KNOWN_HEADERS = [
  'word',
  'pronunciation',
  'ipa',
  'simple meaning',
  'meaning',
  'simple',
  'advanced meaning',
  'advanced',
  'definition',
  'synonyms',
  'synonym',
  'antonyms',
  'antonym',
  'examples',
  'example',
  'common collocations',
  'common collocation',
  'collocations',
  'collocation',
  'memory trick',
  'mnemonic',
  'common mistakes',
  'common mistake',
  'mistakes',
  'part of speech',
  'difficulty',
  'notes',
  'personal notes'
];

function isStructuredVocabulary(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  const hasMultipleLines = text.split('\n').filter(l => l.trim().length > 0).length > 2;
  const hasColonHeader = /^[\w\s]+:/m.test(text);
  const hasBoldHeader = /\*\*(.*?)\*\*/m.test(text);

  return hasMultipleLines && (hasColonHeader || hasBoldHeader);
}

function normalizeString(text: string): string {
  if (!text) return '';
  return text.replace(/^[\s\-•*]+/, '').trim();
}

function parseList(text: string): string[] {
  if (!text) return [];
  // Split by newlines or commas
  if (text.includes('\n')) {
    return text.split('\n')
      .map(normalizeString)
      .filter(s => s.length > 0);
  }
  return text.split(',')
    .map(normalizeString)
    .filter(s => s.length > 0);
}

function parseSentences(text: string): string[] {
  if (!text) return [];
  return text.split(/(?<=[.!?])\s+|\n+/)
    .map(normalizeString)
    .filter(s => s.length > 3);
}

export function parsePastedText(text: string): WordImportResult {
  if (!isStructuredVocabulary(text)) {
    return { isSuccess: false, synonyms: [], antonyms: [], examples: [], commonCollocations: [] };
  }

  const lines = text.split('\n');
  let currentKey = 'word';
  let currentBuffer: string[] = [];
  const extracted: Record<string, string> = {};

  for (const line of lines) {
    const l = line.trim();
    if (l.length === 0) continue;

    const isBolded = l.startsWith('**') || l.startsWith('*') || l.startsWith('###');
    const cleanLine = l
      .replace(/^[\#\-\>]\s*/, '')
      .replace(/\*\*|\*|__|_/g, '')
      .trim();

    // Match "Header: Content"
    const match = cleanLine.match(/^([\w\s]+):\s*(.*)$/);
    if (match) {
      const possibleHeader = match[1].trim().toLowerCase();
      if (
        KNOWN_HEADERS.some(h => possibleHeader === h || possibleHeader.includes(h)) ||
        (isBolded && possibleHeader.split(' ').length <= 4)
      ) {
        extracted[currentKey] = currentBuffer.join('\n').trim();
        currentKey = possibleHeader;
        currentBuffer = [match[2].trim()];
        continue;
      }
    }

    // Match standalone header "**Header**"
    const possibleStandaloneHeader = cleanLine.toLowerCase();
    const matchesKnown = KNOWN_HEADERS.some(h => possibleStandaloneHeader === h || possibleStandaloneHeader.startsWith(h));
    const containsKnownShort = KNOWN_HEADERS.some(h => possibleStandaloneHeader.includes(h)) && 
                               possibleStandaloneHeader.split(' ').length <= 5 && 
                               !possibleStandaloneHeader.endsWith('.');

    if (matchesKnown || containsKnownShort || (isBolded && possibleStandaloneHeader.split(' ').length <= 5 && l.length < 50)) {
      extracted[currentKey] = currentBuffer.join('\n').trim();
      currentKey = possibleStandaloneHeader;
      currentBuffer = [];
      continue;
    }

    currentBuffer.push(l);
  }
  
  extracted[currentKey] = currentBuffer.join('\n').trim();

  let word, ipa, pos, difficulty, simpleMeaning, advMeaning, memoryTrick, commonMistakes;
  let synonyms: string[] = [];
  let antonyms: string[] = [];
  let examples: string[] = [];
  let commonCollocations: string[] = [];

  if (extracted['word'] && extracted['word'].trim().length > 0) {
    word = normalizeString(extracted['word']);
  }

  for (const [key, value] of Object.entries(extracted)) {
    if (!value || value.trim().length === 0) continue;
    
    const normalized = normalizeString(value);
    
    if (key === 'word') {
      word = normalized;
    } else if (key.includes('pronunciation') || key.includes('ipa')) {
      ipa = normalized;
    } else if (key.includes('simple meaning') || key === 'meaning' || key === 'simple') {
      simpleMeaning = normalized;
    } else if (key.includes('advanced meaning') || key.includes('definition') || key === 'advanced') {
      advMeaning = normalized;
    } else if (key.includes('synonym')) {
      synonyms = parseList(value);
    } else if (key.includes('antonym')) {
      antonyms = parseList(value);
    } else if (key.includes('example')) {
      examples = parseSentences(value);
    } else if (key.includes('collocation')) {
      commonCollocations = parseList(value);
    } else if (key.includes('memory trick') || key.includes('mnemonic')) {
      memoryTrick = normalized;
    } else if (key.includes('common mistake') || key.includes('mistakes')) {
      commonMistakes = normalized;
    } else if (key.includes('part of speech')) {
      pos = normalized;
    } else if (key.includes('difficulty')) {
      difficulty = normalized;
    }
  }

  if (!word || word.length === 0) {
    return { isSuccess: false, synonyms: [], antonyms: [], examples: [], commonCollocations: [] };
  }

  // Extract POS from "(Verb)" appended to word
  const posMatch = word.match(/^(.*?)\s*\((.*?)\)$/);
  if (posMatch) {
    word = posMatch[1].trim();
    if (!pos || pos.length === 0) {
      pos = posMatch[2].trim();
    }
  }

  return {
    isSuccess: true,
    word,
    ipa,
    partOfSpeech: pos,
    difficulty,
    simpleMeaning,
    advancedMeaning: advMeaning,
    synonyms,
    antonyms,
    examples,
    commonCollocations,
    memoryTrick,
    commonMistakes
  };
}
