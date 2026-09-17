import type { Reaction } from './data';

const nicknameError = 'Usa de 3 a 20 letras, números o guiones bajos.';

export function normalizeNickname(input: string): { value: string } | { error: string } {
  const value = input.trim().replace(/^@/, '');
  return /^[a-zA-Z0-9_]{3,20}$/.test(value) ? { value } : { error: nicknameError };
}

type SearchableStory = {
  title: string;
  category: string;
  parts: Array<{ text: string }>;
};

function searchable(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-MX');
}

export function filterStories<T extends SearchableStory>(stories: T[], term: string, category: string | null): T[] {
  const query = searchable(term.trim());
  return stories.filter((story) => {
    const body = searchable(`${story.title} ${story.parts.map((part) => part.text).join(' ')} ${story.category}`);
    return (!query || body.includes(query)) && (!category || story.category === category);
  });
}

export function toggleReaction(
  reactions: Record<string, Reaction>,
  storyId: string,
  reaction: Reaction,
): Record<string, Reaction> {
  const next = { ...reactions };

  // Si pulsa nuevamente la misma reacción, se elimina.
  if (next[storyId] === reaction) {
    delete next[storyId];
  } else {
    // Si selecciona otra, reemplaza la anterior.
    next[storyId] = reaction;
  }

  return next;
}
