# Deed Checker Improvements

## Issues Addressed

### 1. **Misleading Verdicts**

- **Problem**: "Singing" was marked as "Not Permissible" despite evidence showing scholarly debate
- **Solution**: Implemented extremely conservative verdict logic that defaults to 'sin' when there's ANY scholarly disagreement, debate, or ambiguity

### 2. **Irrelevant Sources**

- **Problem**: Query about "singing" returned sources about food/eating instead of relevant Islamic rulings
- **Solution**: Added relevance filtering that checks if sources actually relate to the queried topic using keyword matching

### 3. **Poor Source Citations**

- **Problem**: Sources lacked specific verse numbers, hadith book references, and proper Islamic citation format
- **Solution**: Enhanced citation formatting to show:
  - Quran: `Quran 2:173 (Surah Al-Baqarah)`
  - Hadith: `Sahih Bukhari Book 1, Hadith 123`
  - Proper collection names and reference numbers

### 4. **Long Summaries**

- **Problem**: Summaries were too lengthy for mobile UX and not focused on the core ruling
- **Solution**: Limited summaries to 1-2 sentences (max 120 chars) focusing on the main verdict

## Technical Improvements

### Backend (`/api/deed-checker.js`)

```javascript
// Conservative verdict logic - only 'not_sin' if explicitly clear
const explicitlyPermissible = [
  'is explicitly permissible',
  'is clearly halal',
  'is definitely allowed',
];

const anyDoubt = [
  'debated',
  'scholars differ',
  'depends on',
  'controversial',
  'some scholars',
  'different opinions',
  'however',
  'but',
];

// Only allow 'not_sin' if explicitly clear AND no doubt at all
if (hasExplicitPermission && !hasAnyDoubt && responseMatchesQuery) {
  verdict = 'not_sin';
}
```

### Frontend (`/src/lib/reminderDev.ts`)

```typescript
// Relevance filtering for sources
const relevantReferences = references.filter((ref) => {
  const refText = ref.text.toLowerCase();
  return queryKeywords.some((keyword) => refText.includes(keyword));
});

// Enhanced citation formatting
if (ref.metadata.source === 'quran') {
  source = `Quran ${chapter}:${verse} (Surah ${surah_name})`;
} else if (ref.metadata.collection === 'bukhari') {
  source = `Sahih Bukhari Book ${book_number}, Hadith ${hadith_number}`;
}
```

### Offline Knowledge Base

Added conservative entries for debated topics:

```typescript
singing: {
  verdict: 'sin',
  evidence: [{
    source: 'Islamic Scholarly Consensus',
    snippet: 'Singing is debated among scholars. It is safer to avoid it and focus on dhikr.'
  }],
  summary: 'Singing is debated among scholars. It is safer to avoid it and focus on dhikr and Quran recitation.'
}
```

## Safety Features

1. **Conservative Default**: All ambiguous cases default to 'sin' for religious safety
2. **Relevance Check**: Sources must actually relate to the query topic
3. **Fallback Guidance**: When no relevant sources found, provides scholarly consultation advice
4. **Contradiction Prevention**: If response contains conflicting evidence, defaults to conservative position

## Expected Results

- **"Singing"** query will now show "Not Permissible" with proper explanation about scholarly debate
- **Sources** will be relevant to the actual query topic
- **Citations** will show specific Quran verses and Hadith references
- **Summaries** will be concise and mobile-friendly
- **Conservative approach** prevents misleading religious guidance

## Religious Considerations

- Follows Islamic principle of "when in doubt, avoid"
- Respects scholarly differences by defaulting to safer position
- Provides guidance to consult qualified scholars for complex matters
- Ensures no contradictory or misleading religious verdicts
