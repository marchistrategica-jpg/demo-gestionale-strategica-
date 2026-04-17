// ============================================================
// FIREBASE-CONFIG.JS — VERSIONE DEMO
//
// ⚠️  Questa NON è la versione di produzione del gestionale.
//
// Invece di collegarsi a Firebase Firestore, questo file espone
// la stessa identica API (collections, db, FieldValue, Timestamp,
// toTimestamp) ma leggendo/scrivendo i dati in localStorage del
// browser.
//
// In questo modo i 7 moduli in js/modules/*.js NON vanno toccati:
// continuano a chiamare collections.contratti().get() ecc. come
// se fossero collegati a Firebase.
//
// I dati demo iniziali sono definiti in js/demo-seed.js e vengono
// caricati automaticamente la prima volta (o al reset).
// ============================================================

import { SEED_DATA } from './demo-seed.js'

// ── Configurazione storage ──────────────────────────────────────
const STORAGE_KEY  = 'strategica_demo_db_v1'
const SEED_VERSION = 'v1'  // cambia per forzare reset al prossimo load

// ── Timestamp (compatibile con firebase.firestore.Timestamp) ────
class DemoTimestamp {
  constructor(seconds, nanoseconds = 0) {
    this.seconds = seconds
    this.nanoseconds = nanoseconds
  }
  toDate() {
    return new Date(this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6))
  }
  toMillis() {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6)
  }
  static fromDate(date) {
    const d = date instanceof Date ? date : new Date(date)
    return new DemoTimestamp(Math.floor(d.getTime() / 1000), 0)
  }
  static now() {
    return DemoTimestamp.fromDate(new Date())
  }
}

// ── FieldValue sentinels ────────────────────────────────────────
const SERVER_TS_SENTINEL = '__DEMO_SERVER_TS__'
const DELETE_SENTINEL    = '__DEMO_DELETE__'

const DemoFieldValue = {
  serverTimestamp() { return SERVER_TS_SENTINEL },
  delete()          { return DELETE_SENTINEL }
}

// ── Serializzazione per localStorage ────────────────────────────
// I Timestamp vanno salvati come { __ts__: true, seconds } così al
// rehydrate li ricostruiamo come istanze di DemoTimestamp (che
// espongono .toDate(), usato ovunque nei moduli).

function serialize(value) {
  if (value === null || value === undefined) return value
  if (value instanceof DemoTimestamp) {
    return { __ts__: true, seconds: value.seconds, nanoseconds: value.nanoseconds }
  }
  if (value instanceof Date) {
    return { __ts__: true, seconds: Math.floor(value.getTime() / 1000), nanoseconds: 0 }
  }
  if (Array.isArray(value)) return value.map(serialize)
  if (typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value)) out[k] = serialize(value[k])
    return out
  }
  return value
}

function deserialize(value) {
  if (value === null || value === undefined) return value
  if (typeof value === 'object' && value.__ts__ === true) {
    return new DemoTimestamp(value.seconds, value.nanoseconds || 0)
  }
  if (Array.isArray(value)) return value.map(deserialize)
  if (typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value)) out[k] = deserialize(value[k])
    return out
  }
  return value
}

// ── Motore storage ──────────────────────────────────────────────
function _loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed._version !== SEED_VERSION) return null
    return parsed
  } catch (err) {
    console.warn('Demo DB: errore lettura, reinizializzo.', err)
    return null
  }
}

function _saveDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (err) {
    console.error('Demo DB: impossibile salvare su localStorage.', err)
  }
}

function _initDB() {
  const seed = SEED_DATA()
  const db = { _version: SEED_VERSION }
  for (const [col, docs] of Object.entries(seed)) {
    db[col] = {}
    for (const doc of docs) {
      const { id, ...data } = doc
      const docId = id || _genId()
      db[col][docId] = serialize(data)
    }
  }
  _saveDB(db)
  return db
}

let _DB = _loadDB() || _initDB()

// ID generator (Firestore-like, ~20 caratteri)
function _genId() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 20; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)]
  return out
}

// Sostituisce i sentinel (FieldValue.serverTimestamp / delete) con
// valori concreti.
function _resolveSentinels(data) {
  const out = {}
  const nowTs = DemoTimestamp.now()
  for (const [k, v] of Object.entries(data)) {
    if (v === SERVER_TS_SENTINEL) out[k] = nowTs
    else if (v === DELETE_SENTINEL) out[k] = DELETE_SENTINEL
    else out[k] = v
  }
  return out
}

// ── Reset (usato dal bottone "Reset demo") ──────────────────────
export function resetDemoDB() {
  localStorage.removeItem(STORAGE_KEY)
  _DB = _initDB()
}

// ── DocumentSnapshot ────────────────────────────────────────────
class DocSnap {
  constructor(id, rawData) {
    this.id = id
    this._raw = rawData
    this.exists = rawData !== undefined && rawData !== null
  }
  data() {
    if (!this.exists) return undefined
    return deserialize(this._raw)
  }
}

// ── QuerySnapshot ───────────────────────────────────────────────
class QuerySnap {
  constructor(docs) {
    this.docs = docs
    this.empty = docs.length === 0
    this.size = docs.length
  }
  forEach(cb) { this.docs.forEach(cb) }
}

// ── DocumentReference ───────────────────────────────────────────
class DocRef {
  constructor(collection, id) {
    this.collection = collection
    this.id = id
  }
  async get() {
    const raw = _DB[this.collection]?.[this.id]
    return new DocSnap(this.id, raw)
  }
  async set(data) {
    if (!_DB[this.collection]) _DB[this.collection] = {}
    const resolved = _resolveSentinels(data)
    const clean = {}
    for (const [k, v] of Object.entries(resolved)) {
      if (v !== DELETE_SENTINEL) clean[k] = v
    }
    _DB[this.collection][this.id] = serialize(clean)
    _saveDB(_DB)
    return undefined
  }
  async update(data) {
    if (!_DB[this.collection]) _DB[this.collection] = {}
    const existing = _DB[this.collection][this.id]
    if (!existing) {
      throw new Error(`update() su documento inesistente: ${this.collection}/${this.id}`)
    }
    const resolved = _resolveSentinels(data)
    const merged = { ...existing }
    for (const [k, v] of Object.entries(resolved)) {
      if (v === DELETE_SENTINEL) delete merged[k]
      else merged[k] = serialize(v)
    }
    _DB[this.collection][this.id] = merged
    _saveDB(_DB)
    return undefined
  }
  async delete() {
    if (_DB[this.collection]) {
      delete _DB[this.collection][this.id]
      _saveDB(_DB)
    }
    return undefined
  }
}

// ── Query (where / orderBy / limit) ─────────────────────────────
class Query {
  constructor(collectionName, constraints = []) {
    this._col = collectionName
    this._constraints = constraints
  }
  where(field, op, value) {
    return new Query(this._col, [...this._constraints, { type: 'where', field, op, value }])
  }
  orderBy(field, direction = 'asc') {
    return new Query(this._col, [...this._constraints, { type: 'orderBy', field, direction }])
  }
  limit(n) {
    return new Query(this._col, [...this._constraints, { type: 'limit', n }])
  }

  async get() {
    const raw = _DB[this._col] || {}
    let docs = Object.entries(raw).map(([id, data]) => ({ id, data }))

    for (const c of this._constraints) {
      if (c.type === 'where') {
        docs = docs.filter(d => _matchWhere(d.data[c.field], c.op, c.value))
      }
    }
    const orderClauses = this._constraints.filter(c => c.type === 'orderBy')
    if (orderClauses.length) {
      docs.sort((a, b) => {
        for (const oc of orderClauses) {
          const va = a.data[oc.field]
          const vb = b.data[oc.field]
          const cmp = _compare(va, vb)
          if (cmp !== 0) return oc.direction === 'desc' ? -cmp : cmp
        }
        return 0
      })
    }
    const limitClauses = this._constraints.filter(c => c.type === 'limit')
    if (limitClauses.length) {
      docs = docs.slice(0, limitClauses[limitClauses.length - 1].n)
    }

    return new QuerySnap(docs.map(d => new DocSnap(d.id, d.data)))
  }
}

function _matchWhere(val, op, ref) {
  const toComparable = v => {
    if (v === null || v === undefined) return null
    if (typeof v === 'object' && v.__ts__) return v.seconds * 1000 + (v.nanoseconds || 0) / 1e6
    if (v instanceof DemoTimestamp) return v.toMillis()
    return v
  }
  const a = toComparable(val)
  const b = toComparable(ref)
  switch (op) {
    case '==':  return a === b
    case '!=':  return a !== b
    case '>':   return a > b
    case '>=':  return a >= b
    case '<':   return a < b
    case '<=':  return a <= b
    case 'in':  return Array.isArray(b) && b.some(x => toComparable(x) === a)
    default:
      console.warn(`Operatore where non supportato nel mock demo: ${op}`)
      return true
  }
}

function _compare(a, b) {
  const toComparable = v => {
    if (v === null || v === undefined) return null
    if (typeof v === 'object' && v.__ts__) return v.seconds * 1000
    if (v instanceof DemoTimestamp) return v.toMillis()
    return v
  }
  const x = toComparable(a)
  const y = toComparable(b)
  if (x === null && y === null) return 0
  if (x === null) return 1
  if (y === null) return -1
  if (typeof x === 'number' && typeof y === 'number') return x - y
  return String(x).localeCompare(String(y), 'it', { sensitivity: 'base' })
}

// ── CollectionReference ─────────────────────────────────────────
class ColRef extends Query {
  constructor(name) {
    super(name, [])
    this._name = name
  }
  doc(id) {
    return new DocRef(this._name, id || _genId())
  }
  async add(data) {
    const id = _genId()
    const ref = new DocRef(this._name, id)
    await ref.set(data)
    return ref
  }
}

// ── "db" façade ─────────────────────────────────────────────────
export const db = {
  collection(name) { return new ColRef(name) }
}

// ── Shortcut collezioni (API pubblica identica all'originale) ──
export const collections = {
  contratti:   () => new ColRef('contratti'),
  rate:        () => new ColRef('rate'),
  movimenti:   () => new ColRef('movimenti'),
  conti:       () => new ColRef('conti'),
  costi:       () => new ColRef('costi'),
  provvigioni: () => new ColRef('provvigioni'),
  soci:        () => new ColRef('soci'),
  compensi:    () => new ColRef('compensi')
}

// ── Utility (API originale) ─────────────────────────────────────
export const FieldValue = DemoFieldValue
export const Timestamp  = DemoTimestamp

export function toTimestamp(dateStr) {
  if (!dateStr) return null
  return DemoTimestamp.fromDate(new Date(dateStr))
}

// ── Shim globale `firebase.firestore.*` ─────────────────────────
// Alcuni moduli usano firebase.firestore.Timestamp.fromDate() e
// firebase.firestore.FieldValue.serverTimestamp() direttamente
// (senza passare dai named export). Forniamo l'oggetto globale.
window.firebase = {
  firestore: {
    Timestamp: DemoTimestamp,
    FieldValue: DemoFieldValue
  }
}

// Esposto in window per il bottone "Reset demo" nella topbar.
window.__resetDemoDB = resetDemoDB
