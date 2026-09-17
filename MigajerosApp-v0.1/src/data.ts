export const CATEGORIES = [
  'Casi algo',
  'Ex',
  'Rogué demasiado',
  'Ghosting',
  'Red Flags',
  'Amor universitario',
  'Chisme',
  'Desahogo',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const REACTIONS = [
  'Migajero',
  'Sal de ahí',
  'Contexto',
  'Te entiendo',
  'No puede ser',
  'Continúa',
] as const;

export type Reaction = (typeof REACTIONS)[number];

export type StoryPart = {
  id: string;
  text: string;
};

export type StoryComment = {
  id: string;
  author: string;
  text: string;
};

export type Story = {
  id: string;
  authorId: string;
  nickname: string;
  anonymous: boolean;
  title: string;
  category: Category;
  parts: StoryPart[];
  comments: StoryComment[];
  reactionCount: number;
  finished: boolean;
  createdAt: number;
};

const now = Date.now();

export const INITIAL_STORIES: Story[] = [
  {
    id: 'flores',
    authorId: 'auroramx',
    nickname: 'auroramx',
    anonymous: false,
    title: 'Le llevé flores a su ex',
    category: 'Casi algo',
    parts: [
      { id: 'flores-1', text: 'Dijo que necesitaba cerrar un ciclo. Yo pensé que llevar flores ayudaría. Era la casa de su ex…' },
      { id: 'flores-2', text: 'Volvió a escribirme hoy. Le respondí que necesitaba pensar.' },
    ],
    comments: [{ id: 'flores-c1', author: 'lunita', text: 'Te mereces algo mejor.' }],
    reactionCount: 64,
    finished: false,
    createdAt: now - 3_600_000,
  },
  {
    id: 'viaje',
    authorId: 'cuenta-anonima',
    nickname: 'cuenta-anonima',
    anonymous: true,
    title: 'Viajé cuatro horas por un “tal vez”',
    category: 'Rogué demasiado',
    parts: [{ id: 'viaje-1', text: 'Al llegar me dijo que mejor otro día. Hay una segunda Migaja, pero aún no sé cómo contarla.' }],
    comments: [],
    reactionCount: 23,
    finished: false,
    createdAt: now - 86_400_000,
  },
];

export function publicAuthor(story: Story): string {
  return story.anonymous ? 'Anónimo' : `@${story.nickname}`;
}
