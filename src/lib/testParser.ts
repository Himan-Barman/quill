import { parsePastedText } from './wordParser';

const testText = `
**Word:** Serendipity
**Meaning:** This is simple.
**Advanced:** This is advanced.
`;

console.log(parsePastedText(testText));
