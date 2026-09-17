import assert from 'node:assert/strict';
import test from 'node:test';
import { filterStories, normalizeNickname, toggleReaction } from './domain.ts';

const stories = [
  { id: '1', title: 'Flores para mi ex', category: 'Ex', parts: [{ text: 'Esperé bajo la lluvia' }] },
  { id: '2', title: 'La última llamada', category: 'Ghosting', parts: [{ text: 'Nunca volvió a contestar' }] },
];

test('normaliza un nickname y rechaza formatos inseguros', () => {
  assert.deepEqual(normalizeNickname(' @Yael_01 '), { value: 'Yael_01' });
  assert.deepEqual(normalizeNickname('ab'), { error: 'Usa de 3 a 20 letras, números o guiones bajos.' });
  assert.deepEqual(normalizeNickname('nombre con espacios'), { error: 'Usa de 3 a 20 letras, números o guiones bajos.' });
});

test('busca sin distinguir mayúsculas o acentos y combina categoría', () => {
  assert.deepEqual(filterStories(stories, 'ultima', null).map((story) => story.id), ['2']);
  assert.deepEqual(filterStories(stories, '', 'Ex').map((story) => story.id), ['1']);
  assert.deepEqual(filterStories(stories, 'lluvia', 'Ghosting'), []);
});

test('una segunda pulsación elimina la reacción seleccionada', () => {
  assert.deepEqual(toggleReaction({}, 'historia', 'Te entiendo'), { historia: 'Te entiendo' });
  assert.deepEqual(toggleReaction({ historia: 'Te entiendo' }, 'historia', 'Te entiendo'), {});
  assert.deepEqual(toggleReaction({ historia: 'Te entiendo' }, 'historia', 'Continúa'), { historia: 'Continúa' });
});
