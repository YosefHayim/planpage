import { Flashcard, type FlashcardProps } from "../../components/Flashcard";

export interface FlashcardsProps {
  readonly title: string;
  readonly intro?: string;
  readonly cards: ReadonlyArray<FlashcardProps>;
}

/**
 * A flip-card study deck — a responsive grid of Flashcards (tap to flip: term → definition + code).
 * Pure CSS, no client JS. The learn half of the teach/coach flow (pairs with the Quiz); renders a
 * grill-me-stack glossary or a teach concept set.
 */
export const Flashcards = ({ title, intro, cards }: FlashcardsProps) => {
  if (cards.length === 0) throw new Error("Flashcards: cards[] is required and non-empty");
  return (
    <div class="space-y-6">
      <div>
        <h2 class="font-semibold text-lg text-slate-900 dark:text-white">{title}</h2>
        {intro ? <p class="mt-1 text-slate-500 text-sm dark:text-slate-400">{intro}</p> : null}
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Flashcard key={card.front} {...card} />
        ))}
      </div>
    </div>
  );
};
