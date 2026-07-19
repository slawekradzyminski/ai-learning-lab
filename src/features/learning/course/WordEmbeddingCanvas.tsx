import { useMemo } from 'react';
import type { GloveWord } from './gloveWordEmbeddings';
import { FocusedEmbeddingPlot } from './FocusedEmbeddingPlot';
import { projectWordSpace } from './wordEmbeddingMath';

type WordEmbeddingCanvasProps = {
  rows: GloveWord[];
  selectedIndex: number;
  visibleIndices: number[];
  onSelect: (index: number) => void;
  highlightedIndices?: number[];
  connectionPairs?: Array<[number, number]>;
};

export function WordEmbeddingCanvas({ rows, selectedIndex, visibleIndices, onSelect, highlightedIndices = [], connectionPairs = [] }: WordEmbeddingCanvasProps) {
  const vectors = useMemo(() => rows.map(({ vector }) => vector), [rows]);
  const projected = useMemo(() => projectWordSpace(vectors), [vectors]);
  const uniqueIndices = Array.from(new Set(visibleIndices)).filter((index) => rows[index] && projected[index]);

  return (
    <div data-testid="word-embedding-canvas">
      <FocusedEmbeddingPlot
        points={uniqueIndices.map((index) => ({ id: index, label: rows[index].word, ...projected[index], testId: `word-embedding-point-${rows[index].word}` }))}
        selectedId={selectedIndex}
        highlightedIds={highlightedIndices}
        connections={connectionPairs}
        onSelect={(id) => onSelect(Number(id))}
        ariaLabel={`Focused three-dimensional PCA neighborhood containing ${uniqueIndices.length} real GloVe word vectors`}
      />
    </div>
  );
}
