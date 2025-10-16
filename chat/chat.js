/*
  Minimal Chat-Client für Supabase
*/

let supabaseClient = null;
let currentUser = null;
let activeRoomId = null;

function byId(id) { return document.getElementById(id); }

function notify(message, type = 'info') {
  let bar = document.getElementById('notify-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'notify-bar';
    bar.style.position = 'fixed';
    bar.style.top = '16px';
    bar.style.left = '50%';
    bar.style.transform = 'translateX(-50%)';
    bar.style.padding = '10px 14px';
    bar.style.borderRadius = '10px';
    bar.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
    bar.style.zIndex = '9999';
    bar.style.transition = 'opacity 0.2s ease';
    document.body.appendChild(bar);
  }
  bar.style.background = type === 'error' ? '#fee2e2' : '#e0e7ff';
  bar.style.border = '1px solid rgba(0,0,0,0.08)';
  bar.textContent = message;
  bar.style.opacity = '1';
  setTimeout(() => { if (bar) bar.style.opacity = '0'; }, 2000);
}

function assertConfigured() {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    alert('Bitte config.js mit SUPABASE_URL und SUPABASE_ANON_KEY erstellen.');
    throw new Error('Supabase config missing');
  }
}

async function init() {
  assertConfigured();
  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    renderAuthState();
    if (currentUser) {
      loadProfile();
      loadRooms();
      subscribeMessages();
    }
  });

  byId('sign-in').addEventListener('click', signInWithEmail);
  byId('save-username').addEventListener('click', saveUsername);
  const openGeneral = document.getElementById('open-general');
  if (openGeneral) openGeneral.addEventListener('click', openGeneralRoom);
  byId('send').addEventListener('click', sendMessage);
  const startDmBtn = document.getElementById('start-dm');
  if (startDmBtn) startDmBtn.addEventListener('click', startDirectMessage);
  const magicBtn = document.getElementById('magic-link');
  if (magicBtn) magicBtn.addEventListener('click', sendMagicLink);
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) signOutBtn.addEventListener('click', signOut);

  const input = byId('message-input');
  // Auto-resize textarea as user types
  const autoResize = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
  };
  autoResize();
  input.addEventListener('input', autoResize);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function renderAuthState() {
  byId('auth-section').style.display = currentUser ? 'none' : '';
  byId('profile-section').style.display = currentUser ? '' : 'none';
  byId('chat-section').style.display = currentUser ? '' : 'none';
}

async function signInWithEmail() {
  const email = byId('email').value.trim();
  const password = byId('password').value;
  if (!email || !password) return alert('E-Mail und Passwort eingeben.');
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    // Try sign up
    const { data: signup, error: signUpError } = await supabaseClient.auth.signUp({ email, password });
    if (signUpError) return alert(signUpError.message);
    alert('Registrierung erfolgreich. Bitte erneut einloggen.');
  }
}

async function sendMagicLink() {
  const email = byId('email').value.trim();
  if (!email) return alert('E-Mail eingeben.');
  const { error } = await supabaseClient.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
  if (error) return alert(error.message);
  alert('Magic Link gesendet. Bitte Posteingang prüfen.');
}

async function signOut() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  renderAuthState();
}

async function loadProfile() {
  const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
  if (error) return;
  byId('username').value = data.username || '';
}

async function saveUsername() {
  const username = byId('username').value.trim();
  if (!username) return alert('Benutzername darf nicht leer sein.');
  const { error } = await supabaseClient.from('profiles').update({ username }).eq('id', currentUser.id);
  if (error) return alert(error.message);
  alert('Gespeichert.');
}

async function loadRooms() {
  const { data, error } = await supabaseClient
    .from('rooms')
    .select('id, name, is_private')
    .order('created_at', { ascending: false });
  if (error) { notify(error.message, 'error'); return; }
  const list = byId('room-list');
  list.innerHTML = '';
  (data || []).forEach((room) => {
    const li = document.createElement('li');
    li.textContent = room.name + (room.is_private ? ' (privat)' : '');
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => selectRoom(room));
    if (activeRoomId === room.id) li.classList.add('active');
    list.appendChild(li);
  });
  if (!data || data.length === 0) {
    await openGeneralRoom();
    return;
  }
  if (!activeRoomId && data[0]) selectRoom(data[0]);
}

function selectRoom(room) {
  activeRoomId = room.id;
  byId('active-room-name').textContent = room.name;
  loadMessages();
  // refresh active class
  const list = byId('room-list');
  Array.from(list.children).forEach(li => li.classList.remove('active'));
  const idx = Array.from(list.children).findIndex(li => li.textContent.startsWith(room.name));
  if (idx >= 0) list.children[idx].classList.add('active');
}

async function createRoom() {
  const name = prompt('Name des neuen Raums:');
  if (!name) return;
  const { data, error } = await supabaseClient.from('rooms').insert({ name, is_private: false, owner_id: currentUser.id }).select().single();
  if (error) { notify(error.message, 'error'); return; }
  await ensureMembership(data.id);
  activeRoomId = data.id;
  loadRooms();
}

async function openGeneralRoom() {
  // Versuche „Allgemein“ zu finden
  const { data: existing, error: findErr } = await supabaseClient
    .from('rooms')
    .select('id, name')
    .eq('name', 'Allgemein')
    .eq('is_private', false)
    .limit(1);
  if (findErr) { notify(findErr.message, 'error'); return; }
  if (existing && existing.length > 0) {
    activeRoomId = existing[0].id;
    await ensureMembership(activeRoomId);
    await loadRooms();
    return;
  }
  // Anlegen, falls nicht vorhanden
  const { data: created, error: createErr } = await supabaseClient
    .from('rooms')
    .insert({ name: 'Allgemein', is_private: false, owner_id: currentUser.id })
    .select()
    .single();
  if (createErr) { notify(createErr.message, 'error'); return; }
  await ensureMembership(created.id);
  activeRoomId = created.id;
  await loadRooms();
}

async function startDirectMessage() {
  const username = byId('dm-username').value.trim();
  if (!username) return alert('Bitte Benutzernamen eingeben.');
  if (!currentUser) return alert('Bitte zuerst einloggen.');

  // find target profile
  const { data: target, error: targetErr } = await supabaseClient
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single();
  if (targetErr) return alert('Benutzer nicht gefunden.');
  if (target.id === currentUser.id) return alert('Das bist du selbst.');

  // deterministischer Raumname für 1:1, aber privat
  const participantIds = [currentUser.id, target.id].sort();
  const dmName = `DM:${participantIds[0].slice(0,8)}-${participantIds[1].slice(0,8)}`;

  // Prüfe ob es bereits einen privaten Raum gibt, in dem beide Mitglieder sind und insgesamt nur 2 Mitglieder
  const { data: myPrivateRooms, error: roomsErr } = await supabaseClient
    .from('room_members')
    .select('room_id, rooms!inner(id, is_private)')
    .eq('user_id', currentUser.id);
  if (roomsErr) return alert(roomsErr.message);

  const candidateRoomIds = (myPrivateRooms || [])
    .filter(r => r.rooms?.is_private)
    .map(r => r.room_id);

  let existingDmRoomId = null;
  if (candidateRoomIds.length > 0) {
    // Lade Mitglieder dieser Räume
    const { data: members, error: membersErr } = await supabaseClient
      .from('room_members')
      .select('room_id, user_id')
      .in('room_id', candidateRoomIds);
    if (membersErr) return alert(membersErr.message);

    const roomIdToMembers = new Map();
    for (const m of members || []) {
      if (!roomIdToMembers.has(m.room_id)) roomIdToMembers.set(m.room_id, new Set());
      roomIdToMembers.get(m.room_id).add(m.user_id);
    }
    for (const [roomId, set] of roomIdToMembers.entries()) {
      if (set.size === 2 && set.has(currentUser.id) && set.has(target.id)) {
        existingDmRoomId = roomId;
        break;
      }
    }
  }

  let roomId = existingDmRoomId;
  if (!roomId) {
    const { data: room, error: roomErr } = await supabaseClient
      .from('rooms')
      .insert({ name: dmName, is_private: true, owner_id: currentUser.id })
      .select()
      .single();
    if (roomErr) return alert(roomErr.message);
    roomId = room.id;
    // füge beide Mitglieder hinzu
    await supabaseClient.from('room_members').insert(
      [
        { room_id: roomId, user_id: currentUser.id, role: 'owner' },
        { room_id: roomId, user_id: target.id, role: 'member' }
      ]
    ).catch(() => {});
  }

  // Aktivieren
  activeRoomId = roomId;
  loadRooms();
}

async function ensureMembership(roomId) {
  // Owner policy may auto-add; if not, try insert membership where allowed
  await supabaseClient.from('room_members').insert({ room_id: roomId, user_id: currentUser.id }).catch(() => {});
}

async function loadMessages() {
  if (!activeRoomId) return;
  const { data, error } = await supabaseClient
    .from('messages')
    .select('id, content, created_at, author_id, profiles:author_id(username)')
    .eq('room_id', activeRoomId)
    .order('created_at', { ascending: true });
  if (error) { notify(error.message, 'error'); return; }
  renderMessages(data || []);
}

function renderMessages(items) {
  const ul = byId('message-list');
  ul.innerHTML = '';
  items.forEach((m) => {
    const li = document.createElement('li');
    const mine = m.author_id === currentUser?.id;
    li.className = mine ? 'mine' : 'theirs';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const author = m.profiles?.username || m.author_id.slice(0, 8);
    const content = document.createElement('div');
    content.textContent = m.content;
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${author} • ${new Date(m.created_at).toLocaleTimeString()}`;
    bubble.appendChild(content);
    bubble.appendChild(meta);
    li.appendChild(bubble);
    ul.appendChild(li);
  });
  ul.scrollTop = ul.scrollHeight;
}

let messagesChannel = null;
function subscribeMessages() {
  if (messagesChannel) {
    supabaseClient.removeChannel(messagesChannel);
    messagesChannel = null;
  }
  messagesChannel = supabaseClient
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      if (!activeRoomId || payload.new.room_id !== activeRoomId) return;
      const ul = byId('message-list');
      const li = document.createElement('li');
      const mine = payload.new.author_id === currentUser?.id;
      li.className = mine ? 'mine' : 'theirs';
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const content = document.createElement('div');
      content.textContent = payload.new.content;
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = mine ? 'Du • jetzt' : `${(payload.new.author_id || '').slice(0,8)} • jetzt`;
      bubble.appendChild(content);
      bubble.appendChild(meta);
      li.appendChild(bubble);
      ul.appendChild(li);
      ul.scrollTop = ul.scrollHeight;
    })
    .subscribe();
}

async function sendMessage() {
  if (!activeRoomId) return;
  const input = byId('message-input');
  const content = input.value.trim();
  if (!content) return;
  input.value = '';
  const { error } = await supabaseClient.from('messages').insert({ room_id: activeRoomId, author_id: currentUser.id, content });
  if (error) { notify(error.message, 'error'); }
}

window.addEventListener('DOMContentLoaded', init);


