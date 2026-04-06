const GUEST_ID_KEY = 'guestId';

export function getGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function clearGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

