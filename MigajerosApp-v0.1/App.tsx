import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, INITIAL_STORIES, REACTIONS, publicAuthor, type Category, type Reaction, type Story } from './src/data';
import { filterStories, normalizeNickname, toggleReaction } from './src/domain';
import { Action, palette, Pill, Surface } from './src/ui';

type Screen = 'welcome' | 'feed' | 'story' | 'compose' | 'search' | 'saved' | 'profile' | 'publicProfile';
type FeedTab = 'Para ti' | 'Siguiendo' | 'Recientes';
type Draft = { title: string; text: string; category: Category; anonymous: boolean };
const emptyDraft = (): Draft => ({ title: '', text: '', category: 'Casi algo', anonymous: false });

function Label({ children }: { children: string }) { return <Text style={s.label}>{children}</Text>; }
function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={s.linkHit}><Text style={s.link}>{label}</Text></Pressable>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [demoAccount, setDemoAccount] = useState(false);
  const [demoName, setDemoName] = useState('tumigajero');
  const [nameInput, setNameInput] = useState('tumigajero');
  const [accountPrompt, setAccountPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [nameError, setNameError] = useState('');
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [storyId, setStoryId] = useState(INITIAL_STORIES[0].id);
  const [storyOrigin, setStoryOrigin] = useState<Screen>('feed');
  const [profileOrigin, setProfileOrigin] = useState<Screen>('story');
  const [profileAuthorId, setProfileAuthorId] = useState('auroramx');
  const [feedTab, setFeedTab] = useState<FeedTab>('Para ti');
  const [following, setFollowing] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [myReactions, setMyReactions] = useState<Record<string, Reaction>>({});
  const [composeFor, setComposeFor] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [draftError, setDraftError] = useState('');
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<Category | null>(null);

  const selectedStory = stories.find((story) => story.id === storyId);
  const continuationStory = composeFor ? stories.find((story) => story.id === composeFor) : undefined;
  const visibleStories = useMemo(() => {
    if (feedTab === 'Siguiendo') return stories.filter((story) => !story.anonymous && following.includes(story.authorId));
    if (feedTab === 'Recientes') return [...stories].sort((a, b) => b.createdAt - a.createdAt);
    return [...stories].sort((a, b) => b.reactionCount - a.reactionCount);
  }, [feedTab, following, stories]);

  function requireAccount(action: () => void) {
    if (demoAccount) action();
    else { setPendingAction(() => action); setAccountPrompt(true); }
  }
  function closePrompt() { setAccountPrompt(false); setPendingAction(null); setNameError(''); }
  function startDemo() {
    const result = normalizeNickname(nameInput);
    if ('error' in result) { setNameError(result.error); return; }
    setDemoName(result.value); setDemoAccount(true); setAccountPrompt(false); setNameError('');
    const next = pendingAction; setPendingAction(null);
    if (next) next(); else setScreen('feed');
  }
  function openStory(story: Story) {
    setStoryOrigin(screen === 'story' ? storyOrigin : screen);
    setStoryId(story.id); setComment(''); setScreen('story');
  }
  function openPublicProfile(story: Story) {
    if (story.anonymous) return;
    setProfileOrigin(screen); setProfileAuthorId(story.authorId); setScreen('publicProfile');
  }
  function openComposer(existing?: Story) {
    requireAccount(() => {
      setComposeFor(existing?.id ?? null);
      setDraft({ ...emptyDraft(), category: existing?.category ?? 'Casi algo' });
      setDraftError(''); setScreen('compose');
    });
  }
  function publish() {
    const text = draft.text.trim(), title = draft.title.trim();
    if (text.length < 10 || (!continuationStory && title.length < 5)) {
      setDraftError('Escribe un título de 5 caracteres y una Migaja de al menos 10 caracteres.'); return;
    }
    if (text.length > 3000) { setDraftError('La Migaja no puede superar los 3000 caracteres.'); return; }
    if (continuationStory) {
      if (continuationStory.authorId !== 'demo' || continuationStory.finished) return;
      setStories((previous) => previous.map((story) => story.id === continuationStory.id
        ? { ...story, parts: [...story.parts, { id: `part-${Date.now()}`, text }] } : story));
      setStoryId(continuationStory.id);
    } else {
      const id = `story-${Date.now()}`;
      setStories((previous) => [{ id, authorId: 'demo', nickname: demoName, anonymous: draft.anonymous,
        title, category: draft.category, parts: [{ id: `${id}-1`, text }], comments: [],
        reactionCount: 0, finished: false, createdAt: Date.now() }, ...previous]);
      setStoryId(id);
    }
    setStoryOrigin('feed'); setComposeFor(null); setDraft(emptyDraft()); setDraftError(''); setScreen('story');
  }
 function reactTo(story: Story, reaction: Reaction) {
  requireAccount(() => {
    setMyReactions((previous) =>
      toggleReaction(previous, story.id, reaction)
    );
  });
}
  function toggleSaved(story: Story) {
    requireAccount(() => setSavedIds((previous) => previous.includes(story.id)
      ? previous.filter((id) => id !== story.id) : [...previous, story.id]));
  }
  function addComment(story: Story) {
    const message = comment.trim(); if (!message) return;
    requireAccount(() => {
      setStories((previous) => previous.map((item) => item.id === story.id ? {
        ...item, comments: [...item.comments, { id: `comment-${Date.now()}`,
          author: story.anonymous && story.authorId === 'demo' ? 'Autor/a' : demoName, text: message }],
      } : item));
      setComment('');
    });
  }
  function navigateToTab(target: Screen) {
    if (target === 'compose') openComposer();
    else if (target === 'saved' || target === 'profile') requireAccount(() => setScreen(target));
    else setScreen(target);
  }
  function header(title: string, backTo?: Screen) {
    return <View style={s.header}>
      {backTo ? <Link label="‹ Volver" onPress={() => setScreen(backTo)} /> : <Text style={s.brandGlyph}>M</Text>}
      <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      <Text style={s.demoBadge}>DEMO</Text>
    </View>;
  }
  function storyCard(story: Story) {
    return <Surface key={story.id}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir Historia ${story.title}`} onPress={() => openStory(story)}>
        <Text style={s.meta}>{publicAuthor(story)} · {story.category} · {story.parts.length} {story.parts.length === 1 ? 'Migaja' : 'Migajas'}</Text>
        <Text style={s.storyTitle}>{story.title}</Text>
        <Text style={s.bodyText} numberOfLines={3}>{story.parts[0].text}</Text>
      </Pressable>
      <View style={s.cardActions}>
        <Link label={`Reaccionar (${story.reactionCount + (myReactions[story.id] ? 1 : 0)})`}onPress={() => reactTo(story, 'Te entiendo')} />
        <Link label={`Comentar (${story.comments.length})`} onPress={() => openStory(story)} />
        <Link label={savedIds.includes(story.id) ? 'Guardada' : 'Guardar'} onPress={() => toggleSaved(story)} />
      </View>
    </Surface>;
  }
  function bottomNavigation() {
    return <View style={s.bottomNav}>
      {([['feed','Inicio'],['search','Buscar'],['compose','Soltar'],['saved','Guardados'],['profile','Perfil']] as const)
        .map(([target, label]) => <Pressable key={target} accessibilityRole="tab" accessibilityLabel={label}
          accessibilityState={{ selected: screen === target }} onPress={() => navigateToTab(target)} style={s.tab}>
          <Text style={[s.tabGlyph, screen === target && s.tabActive]}>{target === 'compose' ? '+' : '•'}</Text>
          <Text style={[s.tabLabel, screen === target && s.tabActive]}>{label}</Text>
        </Pressable>)}
    </View>;
  }

  function content() {
    if (screen === 'welcome') return <View style={s.welcome}>
      <View style={s.pigeonPlaceholder}><Text style={s.pigeonLetter}>M</Text></View>
      <Text style={s.welcomeTitle}>Migajeros</Text>
      <Text style={s.welcomeText}>Todos hemos sido migajeros alguna vez. Aquí venimos a contarlo.</Text>
      <Text style={s.welcomeCaption}>Historias de amor que hoy podemos contar con humor.</Text>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: ageConfirmed }}
        accessibilityLabel="Confirmo que tengo 18 años o más" onPress={() => setAgeConfirmed((value) => !value)} style={s.checkboxRow}>
        <Text style={s.checkbox}>{ageConfirmed ? '✓' : ' '}</Text>
        <Text style={s.checkboxLabel}>Confirmo que tengo 18 años o más</Text>
      </Pressable>
      <Action label="Explorar Historias" disabled={!ageConfirmed} onPress={() => setScreen('feed')} />
      <Action label="Crear cuenta" secondary disabled={!ageConfirmed} onPress={() => setAccountPrompt(true)} />
      <Link label="Iniciar sesión" onPress={() => { if (ageConfirmed) setAccountPrompt(true); }} />
      <Text style={s.demoHint}>Esta primera versión guarda los cambios sólo durante la sesión de prueba.</Text>
    </View>;

    if (screen === 'feed') return <>
      {header('Migajeros')}
      <View style={s.pillRow}>{(['Para ti','Siguiendo','Recientes'] as const).map((tab) =>
        <Pill key={tab} label={tab} selected={feedTab === tab} onPress={() => setFeedTab(tab)} />)}</View>
      {feedTab === 'Siguiendo' && visibleStories.length === 0 ? <Surface>
        <Text style={s.sectionTitle}>Aún no sigues a nadie</Text>
        <Text style={s.bodyText}>Encuentra personas cuyas historias quieras seguir.</Text>
        <Action label="Buscar Migajeros" onPress={() => setScreen('search')} />
      </Surface> : visibleStories.map(storyCard)}
    </>;

    if (screen === 'story' && selectedStory) return <>
      {header('Historia', storyOrigin)}
      <Text style={s.pageTitle}>{selectedStory.title}</Text>
      {selectedStory.anonymous ? <Text style={s.meta}>Anónimo · {selectedStory.category}</Text> :
        <Link label={`@${selectedStory.nickname} · ${selectedStory.category}`} onPress={() => openPublicProfile(selectedStory)} />}
      <Text style={s.meta}>{selectedStory.finished ? 'Historia finalizada' : 'En curso'}</Text>
      {selectedStory.parts.map((part, index) => <Surface key={part.id}>
        <Text style={s.partLabel}>MIGAJA {index + 1}</Text><Text style={s.bodyText}>{part.text}</Text>
      </Surface>)}
      {selectedStory.authorId === 'demo' && demoAccount && !selectedStory.finished && <View style={s.ownerActions}>
        <Action label="Añadir Migaja" compact onPress={() => openComposer(selectedStory)} />
        <Action label="Finalizar Historia" compact secondary onPress={() => setStories((previous) => previous.map((item) =>
          item.id === selectedStory.id ? { ...item, finished: true } : item))} />
      </View>}
      <Label>¿Cómo reaccionas?</Label>
      <View style={s.wrapRow}>{REACTIONS.map((reaction) => <Pill key={reaction} label={reaction}
        selected={myReactions[selectedStory.id] === reaction} onPress={() => reactTo(selectedStory, reaction)} />)}</View>
      <Action label={savedIds.includes(selectedStory.id) ? 'Quitar de Guardados' : 'Guardar Historia'} secondary
        onPress={() => toggleSaved(selectedStory)} />
      <Text style={s.sectionTitle}>Comentarios ({selectedStory.comments.length})</Text>
      {selectedStory.comments.length === 0 && <Text style={s.meta}>Sé la primera persona en comentar.</Text>}
      {selectedStory.comments.map((entry) => <Surface key={entry.id}>
        <Text style={s.meta}>@{entry.author}</Text><Text style={s.bodyText}>{entry.text}</Text>
      </Surface>)}
      {demoAccount ? <>
        <TextInput accessibilityLabel="Escribe un comentario" placeholder="Escribe un comentario…"
          placeholderTextColor={palette.muted} value={comment} onChangeText={setComment} multiline maxLength={1000}
          style={[s.input,s.commentInput]} />
        <Action label="Comentar" disabled={!comment.trim()} onPress={() => addComment(selectedStory)} />
      </> : <Action label="Entrar para comentar" onPress={() => requireAccount(() => setScreen('story'))} />}
    </>;

    if (screen === 'compose') return <>
      {header(continuationStory ? 'Nueva Migaja' : 'Suelta tu Migaja', continuationStory ? 'story' : 'feed')}
      {continuationStory ? <Surface><Text style={s.meta}>Continuación de «{continuationStory.title}»</Text>
        <Text style={s.bodyText}>Se conserva la autoría y categoría originales.</Text></Surface> : <>
        <Label>Título de la Historia</Label>
        <TextInput accessibilityLabel="Título de la Historia" placeholder="Un título que dé contexto…"
          placeholderTextColor={palette.muted} value={draft.title} maxLength={120}
          onChangeText={(title) => setDraft((previous) => ({ ...previous, title }))} style={s.input} />
      </>}
      <Label>{continuationStory ? 'Tu nueva parte' : 'Tu Migaja'}</Label>
      <TextInput accessibilityLabel="Texto de la Migaja" placeholder="¿Qué hiciste por amor que hoy puedes contar?"
        placeholderTextColor={palette.muted} value={draft.text} maxLength={3100} multiline textAlignVertical="top"
        onChangeText={(text) => setDraft((previous) => ({ ...previous, text }))} style={[s.input,s.storyInput]} />
      <Text style={s.counter}>{draft.text.length} / 3000</Text>
      {!continuationStory && <>
        <Label>Categoría</Label><View style={s.wrapRow}>{CATEGORIES.map((category) => <Pill key={category}
          label={category} selected={draft.category === category}
          onPress={() => setDraft((previous) => ({ ...previous, category }))} />)}</View>
        <Label>Publicar como</Label><View style={s.wrapRow}>
          <Pill label={`@${demoName}`} selected={!draft.anonymous}
            onPress={() => setDraft((previous) => ({ ...previous, anonymous: false }))} />
          <Pill label="Anónimo" selected={draft.anonymous}
            onPress={() => setDraft((previous) => ({ ...previous, anonymous: true }))} />
        </View>
      </>}
      <Text style={s.meta}>Evita nombres, teléfonos y datos personales de otras personas.</Text>
      {draftError ? <Text accessibilityRole="alert" style={s.error}>{draftError}</Text> : null}
      <Action label={continuationStory ? 'Publicar continuación' : 'Publicar'} onPress={publish} />
      <Text style={s.demoHint}>Modo demo: el contenido se pierde al cerrar la aplicación.</Text>
    </>;

    if (screen === 'search') {
      const matches = filterStories(stories, searchTerm, searchCategory);
      return <>{header('Buscar')}
        <TextInput accessibilityLabel="Buscar Historias" placeholder="Buscar Historias…"
          placeholderTextColor={palette.muted} value={searchTerm} onChangeText={setSearchTerm} style={s.input} />
        <Label>Explorar categorías</Label><View style={s.wrapRow}>{CATEGORIES.map((category) => <Pill key={category}
          label={category} selected={searchCategory === category}
          onPress={() => setSearchCategory((current) => current === category ? null : category)} />)}</View>
        <Text style={s.sectionTitle}>Historias</Text>
        {matches.length ? matches.map(storyCard) : <Text style={s.meta}>No encontramos Historias. Prueba con otro término.</Text>}
      </>;
    }
    if (screen === 'saved') {
      const savedStories = stories.filter((story) => savedIds.includes(story.id));
      return <>{header('Guardados')}<Text style={s.meta}>Sólo tú puedes ver esta colección.</Text>
        {savedStories.length ? savedStories.map(storyCard) : <Surface>
          <Text style={s.sectionTitle}>Todavía no guardas Historias</Text>
          <Text style={s.bodyText}>Aquí aparecerán las que guardes para leer después.</Text>
          <Action label="Ir a Inicio" onPress={() => setScreen('feed')} />
        </Surface>}
      </>;
    }
    if (screen === 'profile') {
      const ownStories = stories.filter((story) => story.authorId === 'demo');
      return <>{header('Mi perfil')}<Surface>
        <Text style={s.pageTitle}>@{demoName}</Text><Text style={s.meta}>Cuenta de demostración · {ownStories.length} Historias</Text>
        <Action label="Salir del modo demo" secondary onPress={() => { setDemoAccount(false); setScreen('feed'); }} />
      </Surface><Label>Mis Historias</Label>
        {ownStories.length ? ownStories.map(storyCard) : <Text style={s.meta}>Tu primera Migaja aparecerá aquí.</Text>}
      </>;
    }
    if (screen === 'publicProfile') {
      const publicStories = stories.filter((story) => story.authorId === profileAuthorId && !story.anonymous);
      return <>{header('Perfil', profileOrigin)}<Surface>
        <Text style={s.pageTitle}>@{profileAuthorId}</Text>
        <Text style={s.meta}>{publicStories.length} Historias públicas</Text>
        <Action label={following.includes(profileAuthorId) ? 'Dejar de seguir' : 'Seguir'}
          onPress={() => requireAccount(() => setFollowing((current) => current.includes(profileAuthorId)
            ? current.filter((id) => id !== profileAuthorId) : [...current, profileAuthorId]))} />
      </Surface><Label>Historias públicas</Label>{publicStories.map(storyCard)}</>;
    }
    return null;
  }

  return <SafeAreaProvider><SafeAreaView style={s.safeArea} edges={['top','bottom']}>
    <StatusBar style="dark" />
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scrollContent}>{content()}</ScrollView>
      {(['feed','search','saved','profile'] as Screen[]).includes(screen) && bottomNavigation()}
    </KeyboardAvoidingView>
    <Modal transparent visible={accountPrompt} animationType="fade" onRequestClose={closePrompt}>
      <View style={s.modalBackdrop}><View style={s.modalCard}>
        <Text style={s.sectionTitle}>Entra para participar</Text>
        <Text style={s.bodyText}>Puedes seguir leyendo sin cuenta. Para probar comentarios, reacciones y publicaciones, usa un nickname de demostración.</Text>
        <Label>Nickname de prueba</Label>
        <TextInput accessibilityLabel="Nickname de prueba" value={nameInput} onChangeText={setNameInput}
          placeholder="tunickname" placeholderTextColor={palette.muted} autoCapitalize="none" maxLength={20} style={s.input} />
        {nameError ? <Text accessibilityRole="alert" style={s.error}>{nameError}</Text> : null}
        <Action label="Entrar al modo demo" onPress={startDemo} />
        <Action label="Seguir leyendo" secondary onPress={closePrompt} />
        <Text style={s.demoHint}>No uses datos reales: esta prueba no crea una cuenta ni envía correos.</Text>
      </View></View>
    </Modal>
  </SafeAreaView></SafeAreaProvider>;
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background }, flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 35, flexGrow: 1 },
  welcome: { flex: 1, justifyContent: 'center', paddingVertical: 45 },
  pigeonPlaceholder: { width: 104, height: 104, borderRadius: 52, backgroundColor: palette.purple, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
  pigeonLetter: { color: '#fff', fontSize: 42, fontWeight: '900' },
  welcomeTitle: { fontSize: 35, fontWeight: '800', color: palette.purpleDark, textAlign: 'center' },
  welcomeText: { color: palette.text, fontSize: 19, textAlign: 'center', lineHeight: 27, marginTop: 18 },
  welcomeCaption: { color: palette.muted, fontSize: 14, textAlign: 'center', marginTop: 14, marginBottom: 44 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, marginBottom: 16 },
  checkbox: { width: 24, height: 24, borderWidth: 1.5, borderColor: palette.purple, borderRadius: 5, textAlign: 'center', color: palette.purple, fontWeight: '700', fontSize: 17, marginRight: 12 },
  checkboxLabel: { color: palette.text, fontSize: 14, flex: 1 },
  header: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: palette.border, marginBottom: 20 },
  brandGlyph: { color: palette.purple, fontSize: 27, fontWeight: '900', marginRight: 12 },
  headerTitle: { fontSize: 23, fontWeight: '800', color: palette.text, flex: 1 },
  demoBadge: { color: palette.purple, fontSize: 10, fontWeight: '800', marginLeft: 10 },
  pageTitle: { color: palette.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  sectionTitle: { color: palette.text, fontSize: 19, fontWeight: '800', marginTop: 10, marginBottom: 13 },
  storyTitle: { color: palette.text, fontSize: 19, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  partLabel: { color: palette.purple, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  bodyText: { color: palette.text, fontSize: 15, lineHeight: 23 },
  meta: { color: palette.muted, fontSize: 13, lineHeight: 19, marginBottom: 11 },
  linkHit: { minHeight: 42, justifyContent: 'center', paddingRight: 10 },
  link: { color: palette.purple, fontWeight: '700', fontSize: 13 },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 7 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 13 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  ownerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  label: { color: palette.text, fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderColor: palette.border, borderWidth: 1, borderRadius: 12, minHeight: 50, color: palette.text, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  storyInput: { minHeight: 205 }, commentInput: { minHeight: 80 },
  counter: { color: palette.muted, textAlign: 'right', fontSize: 12 },
  error: { color: palette.danger, fontSize: 13, marginVertical: 10, fontWeight: '700' },
  demoHint: { color: palette.muted, textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 18 },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: '#fff', paddingHorizontal: 3, minHeight: 69 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 60 },
  tabGlyph: { color: palette.muted, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  tabLabel: { color: palette.muted, fontSize: 10 }, tabActive: { color: palette.purple, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: '#0009', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 450, backgroundColor: '#fff', borderRadius: 22, padding: 22 },
});
