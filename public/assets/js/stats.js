import { getFirestore, doc, setDoc, getDoc,  increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const LOCAL_STORAGE_KEY = "stats_state";

export async function trackSiteVisit() {
  const user = getAuth().currentUser;
  if (!user) return;

  const db = getFirestore();
  const today = getToday();

  const ref = doc(db, "userDailyVisits", user.uid);
  const snapshot = await getDoc(ref);
  const dates = snapshot.exists() && snapshot.data().date
    ? snapshot.data().date.split(",")
    : [];

  if (!dates.includes(today)) dates.push(today);

  await setDoc(ref, { userId: user.uid, date: dates.join(","), lastSeenAt: serverTimestamp() }, { merge: true });
}

export async function trackPageView(pageUrl) {
  if (!pageUrl) return;

  const user = getAuth().currentUser;
  if (!user) return;

  const today = getToday();
  const visitState = getVisitState(today);
  if (visitState.pagesVisited.includes(pageUrl)) return;

  visitState.pagesVisited.push(pageUrl);
  saveVisitState(visitState);

  const db = getFirestore();
  const [year, month] = today.split("-").slice(0, 2);
  const ref = doc(db, "pageMonthlyStats", year, month, encodeId(pageUrl));

  await setDoc(ref, { pageUrl, year, month, viewCount: increment(1), updatedAt: serverTimestamp() }, { merge: true });
}

// ===== Helpers =====

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getVisitState(today) {
  try {
    const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (!state || state.date !== today || !Array.isArray(state.pagesVisited)) return { date: today, pagesVisited: [] };
    return state;
  } catch {
    return { date: today, pagesVisited: [] };
  }
}

function saveVisitState(state) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function encodeId(str) {
  return String(str).replace(/[\/#?[\]]/g, "_");
}
