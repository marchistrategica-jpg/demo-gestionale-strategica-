// ============================================================
// DEMO-SEED.JS
// Dataset demo precompilato — viene caricato una volta sola al
// primo avvio (e ad ogni "Reset demo").
//
// Le date vengono calcolate rispetto a OGGI, così la dashboard
// mostra sempre KPI e grafici pertinenti indipendentemente da
// quando la demo viene mostrata al cliente.
//
// Struttura delle collezioni riflette quella di produzione
// (vedi commenti in testa ai vari moduli js/modules/*.js).
// ============================================================

// Helper: data relativa a oggi
const today = () => new Date()
const daysAgo  = n => { const d = today(); d.setDate(d.getDate() - n); return d }
const daysAhead = n => { const d = today(); d.setDate(d.getDate() + n); return d }
const monthsAgo  = n => { const d = today(); d.setMonth(d.getMonth() - n); return d }
const monthsAhead = n => { const d = today(); d.setMonth(d.getMonth() + n); return d }

// Helper: crea un "Timestamp-like" serializzato direttamente per il
// DB demo (il motore serialize/deserialize in firebase-config.js lo
// ricostruirà come DemoTimestamp al primo read).
const ts = date => ({ __ts__: true, seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })

// IDs fissi per poter fare riferimenti incrociati fra collezioni
const SOCIO_1_ID = 'demo_socio_marco'
const SOCIO_2_ID = 'demo_socio_laura'
const CONTO_PRINCIPALE_ID = 'demo_conto_principale'
const CONTO_REVOLUT_ID    = 'demo_conto_revolut'

const CONTRATTO_IDS = {
  ACME:     'demo_contr_acme',
  VERDI:    'demo_contr_verdi',
  BIANCHI:  'demo_contr_bianchi',
  NOVA:     'demo_contr_nova',
  LONGO:    'demo_contr_longo',
  DELTA:    'demo_contr_delta',
  OMEGA:    'demo_contr_omega',
  KAPPA:    'demo_contr_kappa',
}

// ============================================================
// SEED — chiamata al primo caricamento o al reset
// ============================================================
export function SEED_DATA() {

  // ── SOCI ──────────────────────────────────────────────────────
  const soci = [
    { id: SOCIO_1_ID, nome: 'Marco Ferretti',  email: 'marco.ferretti@esempio.it',  quota_percentuale: 50 },
    { id: SOCIO_2_ID, nome: 'Laura Villani',   email: 'laura.villani@esempio.it',   quota_percentuale: 50 },
  ]

  // ── CONTI CORRENTI ────────────────────────────────────────────
  const conti = [
    {
      id: CONTO_PRINCIPALE_ID,
      nome: 'Conto Principale',
      banca: 'BCC Esempio',
      iban: 'IT60X0542811101000000123456',
      saldo_iniziale: 8500,
    },
    {
      id: CONTO_REVOLUT_ID,
      nome: 'Revolut Business',
      banca: 'Revolut',
      iban: 'GB33REVO00996901123456',
      saldo_iniziale: 1200,
    },
  ]

  // ── COSTI FISSI ───────────────────────────────────────────────
  const costi = [
    { descrizione: 'Affitto ufficio',       importo: 850,  tipo: 'fisso', periodicita: 'mensile',  categoria: 'Struttura',      attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Utenze (luce/gas)',     importo: 180,  tipo: 'fisso', periodicita: 'mensile',  categoria: 'Struttura',      attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Connessione internet',  importo: 49,   tipo: 'fisso', periodicita: 'mensile',  categoria: 'Struttura',      attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Telefonia mobile',      importo: 35,   tipo: 'fisso', periodicita: 'mensile',  categoria: 'Struttura',      attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Commercialista',        importo: 2400, tipo: 'fisso', periodicita: 'annuale',  categoria: 'Professionisti', attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'RC Professionale',      importo: 950,  tipo: 'fisso', periodicita: 'annuale',  categoria: 'Struttura',      attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Microsoft 365 Business',importo: 12.90,tipo: 'fisso', periodicita: 'mensile',  categoria: 'IT',             attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Google Workspace',      importo: 22,   tipo: 'fisso', periodicita: 'mensile',  categoria: 'IT',             attivo: true, createdAt: ts(monthsAgo(12)) },
    { descrizione: 'Hosting + Dominio',     importo: 180,  tipo: 'fisso', periodicita: 'annuale',  categoria: 'IT',             attivo: true, createdAt: ts(monthsAgo(14)) },
    { descrizione: 'Google Ads',            importo: 350,  tipo: 'fisso', periodicita: 'mensile',  categoria: 'Marketing',      attivo: true, createdAt: ts(monthsAgo(8)) },
    { descrizione: 'LinkedIn Sales Navigator', importo: 79, tipo: 'fisso', periodicita: 'mensile', categoria: 'Marketing',      attivo: true, createdAt: ts(monthsAgo(6)) },
  ]

  // ── CONTRATTI ─────────────────────────────────────────────────
  // Scenari: clienti attivi con rate in parte pagate, sospesi, conclusi
  const contratti = [
    {
      id: CONTRATTO_IDS.ACME,
      cliente: 'ACME Industries S.r.l.',
      data_inizio: ts(monthsAgo(8)),
      stato: 'corrente',
      importo_imponibile: 18000,
      iva_rate: 22,
      importo_iva: 3960,
      importo_totale: 21960,
      modalita_pagamento: 'Bonifico bancario — 3 rate trimestrali',
      note: 'Consulenza strategica annuale',
      conto_accredito: CONTO_PRINCIPALE_ID,
      conto_accredito_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(8)),
    },
    {
      id: CONTRATTO_IDS.VERDI,
      cliente: 'Studio Verdi & Associati',
      data_inizio: ts(monthsAgo(5)),
      stato: 'corrente',
      importo_imponibile: 7500,
      iva_rate: 22,
      importo_iva: 1650,
      importo_totale: 9150,
      modalita_pagamento: 'Bonifico — 50% anticipo + 50% saldo',
      note: 'Revisione processi amministrativi',
      conto_accredito: CONTO_PRINCIPALE_ID,
      conto_accredito_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(5)),
    },
    {
      id: CONTRATTO_IDS.BIANCHI,
      cliente: 'Bianchi Automotive SpA',
      data_inizio: ts(monthsAgo(3)),
      stato: 'corrente',
      importo_imponibile: 12000,
      iva_rate: 22,
      importo_iva: 2640,
      importo_totale: 14640,
      modalita_pagamento: 'Bonifico — 4 rate mensili',
      note: 'Progetto di digitalizzazione',
      conto_accredito: CONTO_PRINCIPALE_ID,
      conto_accredito_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(3)),
    },
    {
      id: CONTRATTO_IDS.NOVA,
      cliente: 'Nova Costruzioni S.r.l.',
      data_inizio: ts(monthsAgo(2)),
      stato: 'corrente',
      importo_imponibile: 5500,
      iva_rate: 22,
      importo_iva: 1210,
      importo_totale: 6710,
      modalita_pagamento: 'Bonifico — unica soluzione a 60gg',
      note: 'Due diligence fornitori',
      conto_accredito: CONTO_REVOLUT_ID,
      conto_accredito_nome: 'Revolut Business',
      createdAt: ts(monthsAgo(2)),
    },
    {
      id: CONTRATTO_IDS.LONGO,
      cliente: 'Farmacie Longo',
      data_inizio: ts(monthsAgo(1)),
      stato: 'corrente',
      importo_imponibile: 3200,
      iva_rate: 22,
      importo_iva: 704,
      importo_totale: 3904,
      modalita_pagamento: 'Bonifico — 2 rate',
      note: 'Audit contabile',
      conto_accredito: CONTO_PRINCIPALE_ID,
      conto_accredito_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(1)),
    },
    {
      id: CONTRATTO_IDS.DELTA,
      cliente: 'Delta Logistics S.p.A.',
      data_inizio: ts(monthsAgo(4)),
      stato: 'sospeso',
      importo_imponibile: 9500,
      iva_rate: 22,
      importo_iva: 2090,
      importo_totale: 11590,
      modalita_pagamento: 'Bonifico — 3 rate',
      note: 'Sospeso su richiesta cliente per riorganizzazione interna',
      conto_accredito: CONTO_PRINCIPALE_ID,
      conto_accredito_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(4)),
    },
    {
      id: CONTRATTO_IDS.OMEGA,
      cliente: 'Omega Consulting',
      data_inizio: ts(monthsAgo(11)),
      stato: 'concluso',
      importo_imponibile: 6800,
      iva_rate: 22,
      importo_iva: 1496,
      importo_totale: 8296,
      modalita_pagamento: 'Bonifico — 2 rate semestrali',
      note: 'Contratto completato regolarmente',
      conto_accredito: CONTO_PRINCIPALE_ID,
      conto_accredito_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(11)),
    },
    {
      id: CONTRATTO_IDS.KAPPA,
      cliente: 'Kappa Retail S.r.l.',
      data_inizio: ts(monthsAgo(9)),
      stato: 'concluso',
      importo_imponibile: 4200,
      iva_rate: 22,
      importo_iva: 924,
      importo_totale: 5124,
      modalita_pagamento: 'Bonifico — unica soluzione',
      note: '',
      conto_accredito: CONTO_REVOLUT_ID,
      conto_accredito_nome: 'Revolut Business',
      createdAt: ts(monthsAgo(9)),
    },
  ]

  // ── RATE (piano pagamenti) ────────────────────────────────────
  // Genero rate per ogni contratto, distribuendo importi e date
  // in modo coerente.
  const rate = []
  const ratePagate = [] // per creare poi i movimenti corrispondenti

  function addRate(contratto_id, cliente, piano) {
    piano.forEach(r => {
      const iva = r.imp * r.iva_rate / 100
      const rataData = {
        id: r.id,
        contratto_ref: contratto_id,
        cliente,
        descrizione: r.desc,
        importo_imponibile: r.imp,
        iva_rate: r.iva_rate,
        importo_iva: iva,
        importo_totale: r.imp + iva,
        data_prevista: ts(r.data_prev),
        data_pagamento: r.data_pag ? ts(r.data_pag) : null,
        stato: r.stato,
        createdAt: ts(r.data_prev),
      }
      rate.push(rataData)
      if (r.stato === 'pagata') {
        ratePagate.push({
          rata_id: r.id,
          contratto_ref: contratto_id,
          cliente,
          descrizione: r.desc,
          importo_imponibile: r.imp,
          iva_rate: r.iva_rate,
          importo_iva: iva,
          importo_totale: r.imp + iva,
          data_pagamento: r.data_pag,
          conto: CONTO_PRINCIPALE_ID,
        })
      }
    })
  }

  // ACME — 3 rate trimestrali, 2 pagate 1 in attesa
  addRate(CONTRATTO_IDS.ACME, 'ACME Industries S.r.l.', [
    { id: 'demo_rata_acme_1', desc: 'Rata 1 di 3',   imp: 6000, iva_rate: 22, data_prev: monthsAgo(8),  data_pag: monthsAgo(8),  stato: 'pagata' },
    { id: 'demo_rata_acme_2', desc: 'Rata 2 di 3',   imp: 6000, iva_rate: 22, data_prev: monthsAgo(5),  data_pag: monthsAgo(5),  stato: 'pagata' },
    { id: 'demo_rata_acme_3', desc: 'Rata 3 di 3',   imp: 6000, iva_rate: 22, data_prev: monthsAhead(1), data_pag: null,         stato: 'attesa' },
  ])

  // VERDI — 2 rate, prima pagata, seconda scaduta (in attesa ma data passata)
  addRate(CONTRATTO_IDS.VERDI, 'Studio Verdi & Associati', [
    { id: 'demo_rata_verdi_1', desc: 'Anticipo 50%', imp: 3750, iva_rate: 22, data_prev: monthsAgo(5),  data_pag: monthsAgo(5),  stato: 'pagata' },
    { id: 'demo_rata_verdi_2', desc: 'Saldo 50%',    imp: 3750, iva_rate: 22, data_prev: daysAgo(15),   data_pag: null,          stato: 'attesa' },
  ])

  // BIANCHI — 4 rate mensili, 2 pagate, 2 in attesa
  addRate(CONTRATTO_IDS.BIANCHI, 'Bianchi Automotive SpA', [
    { id: 'demo_rata_bianchi_1', desc: 'Rata 1 di 4', imp: 3000, iva_rate: 22, data_prev: monthsAgo(3),  data_pag: monthsAgo(3),  stato: 'pagata' },
    { id: 'demo_rata_bianchi_2', desc: 'Rata 2 di 4', imp: 3000, iva_rate: 22, data_prev: monthsAgo(2),  data_pag: monthsAgo(2),  stato: 'pagata' },
    { id: 'demo_rata_bianchi_3', desc: 'Rata 3 di 4', imp: 3000, iva_rate: 22, data_prev: daysAhead(10), data_pag: null,          stato: 'attesa' },
    { id: 'demo_rata_bianchi_4', desc: 'Rata 4 di 4', imp: 3000, iva_rate: 22, data_prev: monthsAhead(1), data_pag: null,         stato: 'attesa' },
  ])

  // NOVA — rata unica, in attesa (fresca)
  addRate(CONTRATTO_IDS.NOVA, 'Nova Costruzioni S.r.l.', [
    { id: 'demo_rata_nova_1', desc: 'Unica soluzione', imp: 5500, iva_rate: 22, data_prev: monthsAhead(1), data_pag: null, stato: 'attesa' },
  ])

  // LONGO — 2 rate, una pagata una in arrivo
  addRate(CONTRATTO_IDS.LONGO, 'Farmacie Longo', [
    { id: 'demo_rata_longo_1', desc: 'Acconto',  imp: 1600, iva_rate: 22, data_prev: monthsAgo(1), data_pag: monthsAgo(1), stato: 'pagata' },
    { id: 'demo_rata_longo_2', desc: 'Saldo',    imp: 1600, iva_rate: 22, data_prev: daysAhead(20), data_pag: null,         stato: 'attesa' },
  ])

  // DELTA — contratto sospeso, prima rata pagata, le altre sospese
  addRate(CONTRATTO_IDS.DELTA, 'Delta Logistics S.p.A.', [
    { id: 'demo_rata_delta_1', desc: 'Rata 1 di 3', imp: 3166.67, iva_rate: 22, data_prev: monthsAgo(4),  data_pag: monthsAgo(4), stato: 'pagata' },
    { id: 'demo_rata_delta_2', desc: 'Rata 2 di 3', imp: 3166.67, iva_rate: 22, data_prev: monthsAgo(1),  data_pag: null,         stato: 'attesa' },
    { id: 'demo_rata_delta_3', desc: 'Rata 3 di 3', imp: 3166.66, iva_rate: 22, data_prev: monthsAhead(2), data_pag: null,        stato: 'attesa' },
  ])

  // OMEGA — concluso, tutte pagate
  addRate(CONTRATTO_IDS.OMEGA, 'Omega Consulting', [
    { id: 'demo_rata_omega_1', desc: 'Rata 1 di 2', imp: 3400, iva_rate: 22, data_prev: monthsAgo(11), data_pag: monthsAgo(11), stato: 'pagata' },
    { id: 'demo_rata_omega_2', desc: 'Rata 2 di 2', imp: 3400, iva_rate: 22, data_prev: monthsAgo(5),  data_pag: monthsAgo(5),  stato: 'pagata' },
  ])

  // KAPPA — concluso, unica rata pagata
  addRate(CONTRATTO_IDS.KAPPA, 'Kappa Retail S.r.l.', [
    { id: 'demo_rata_kappa_1', desc: 'Unica soluzione', imp: 4200, iva_rate: 22, data_prev: monthsAgo(9), data_pag: monthsAgo(9), stato: 'pagata' },
  ])

  // ── MOVIMENTI ─────────────────────────────────────────────────
  // Incassi automatici dalle rate pagate + pagamenti per i costi
  // fissi degli ultimi mesi.
  const movimenti = []

  // Incassi dalle rate pagate
  ratePagate.forEach(r => {
    movimenti.push({
      tipo: 'incasso',
      importo: r.importo_totale,
      imponibile: r.importo_imponibile,
      data: ts(r.data_pagamento),
      descrizione: `${r.cliente} — ${r.descrizione}`,
      categoria: 'Fatture clienti',
      conto: r.conto,
      conto_nome: r.conto === CONTO_PRINCIPALE_ID ? 'Conto Principale' : 'Revolut Business',
      iva_rate: r.iva_rate,
      iva_importo: r.importo_iva,
      contratto_ref: r.contratto_ref,
      rata_ref: r.rata_id,
      note: null,
      createdAt: ts(r.data_pagamento),
    })
  })

  // Pagamenti costi fissi mensili — ultimi 6 mesi
  for (let m = 6; m >= 1; m--) {
    const dataMese = (() => { const d = monthsAgo(m); d.setDate(5); return d })()

    movimenti.push({
      tipo: 'pagamento',
      importo: 850,
      imponibile: 850,
      data: ts(dataMese),
      descrizione: 'Affitto ufficio',
      categoria: 'Struttura',
      conto: CONTO_PRINCIPALE_ID,
      conto_nome: 'Conto Principale',
      iva_rate: 0,
      iva_importo: 0,
      note: null,
      createdAt: ts(dataMese),
    })
    movimenti.push({
      tipo: 'pagamento',
      importo: 180,
      imponibile: 180,
      data: ts((() => { const d = monthsAgo(m); d.setDate(10); return d })()),
      descrizione: 'Utenze bimestrali',
      categoria: 'Struttura',
      conto: CONTO_PRINCIPALE_ID,
      conto_nome: 'Conto Principale',
      iva_rate: 0,
      iva_importo: 0,
      note: null,
      createdAt: ts(dataMese),
    })
    movimenti.push({
      tipo: 'pagamento',
      importo: 350,
      imponibile: 350,
      data: ts((() => { const d = monthsAgo(m); d.setDate(15); return d })()),
      descrizione: 'Google Ads',
      categoria: 'Marketing',
      conto: CONTO_REVOLUT_ID,
      conto_nome: 'Revolut Business',
      iva_rate: 22,
      iva_importo: 77,
      note: null,
      createdAt: ts(dataMese),
    })
  }

  // ── PROVVIGIONI ───────────────────────────────────────────────
  // Due agenti esterni, provvigioni calcolate sul 5-8% del contratto
  const provvigioni = [
    {
      agente: 'Roberto Sala',
      cliente: 'ACME Industries S.r.l.',
      contratto_ref: CONTRATTO_IDS.ACME,
      data: ts(monthsAgo(8)),
      percentuale: 8,
      importo: 1440,
      stato: 'pagata',
      data_pagamento: ts(monthsAgo(7)),
      note: 'Provvigione al chiuso contratto',
      conto_pagamento: CONTO_PRINCIPALE_ID,
      conto_pagamento_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(8)),
    },
    {
      agente: 'Roberto Sala',
      cliente: 'Bianchi Automotive SpA',
      contratto_ref: CONTRATTO_IDS.BIANCHI,
      data: ts(monthsAgo(3)),
      percentuale: 7,
      importo: 840,
      stato: 'pagata',
      data_pagamento: ts(monthsAgo(2)),
      note: '',
      conto_pagamento: CONTO_PRINCIPALE_ID,
      conto_pagamento_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(3)),
    },
    {
      agente: 'Elena Marchetti',
      cliente: 'Studio Verdi & Associati',
      contratto_ref: CONTRATTO_IDS.VERDI,
      data: ts(monthsAgo(5)),
      percentuale: 6,
      importo: 450,
      stato: 'pagata',
      data_pagamento: ts(monthsAgo(4)),
      note: '',
      conto_pagamento: CONTO_PRINCIPALE_ID,
      conto_pagamento_nome: 'Conto Principale',
      createdAt: ts(monthsAgo(5)),
    },
    {
      agente: 'Elena Marchetti',
      cliente: 'Nova Costruzioni S.r.l.',
      contratto_ref: CONTRATTO_IDS.NOVA,
      data: ts(monthsAgo(2)),
      percentuale: 6,
      importo: 330,
      stato: 'maturata',
      data_pagamento: null,
      note: 'Da liquidare ad incasso',
      conto_pagamento: null,
      conto_pagamento_nome: null,
      createdAt: ts(monthsAgo(2)),
    },
    {
      agente: 'Roberto Sala',
      cliente: 'Farmacie Longo',
      contratto_ref: CONTRATTO_IDS.LONGO,
      data: ts(monthsAgo(1)),
      percentuale: 5,
      importo: 160,
      stato: 'maturata',
      data_pagamento: null,
      note: '',
      conto_pagamento: null,
      conto_pagamento_nome: null,
      createdAt: ts(monthsAgo(1)),
    },
  ]

  // ── COMPENSI SOCI ─────────────────────────────────────────────
  // Ultimi 4 mesi di compensi, ultimo mese in attesa
  const compensi = []
  for (let m = 4; m >= 1; m--) {
    const mese = monthsAgo(m)
    const periodo = `${String(mese.getMonth() + 1).padStart(2, '0')}/${mese.getFullYear()}`
    const pagato = m > 1 // i due mesi più recenti in attesa
    const dataPag = pagato ? (() => { const d = new Date(mese); d.setMonth(d.getMonth() + 1); d.setDate(10); return d })() : null

    compensi.push({
      socio_ref: SOCIO_1_ID,
      socio_nome: 'Marco Ferretti',
      importo: 2500,
      periodo,
      data_pagamento: dataPag ? ts(dataPag) : null,
      stato: pagato ? 'pagata' : 'attesa',
      note: '',
      conto_pagamento: pagato ? CONTO_PRINCIPALE_ID : null,
      conto_pagamento_nome: pagato ? 'Conto Principale' : null,
      createdAt: ts(mese),
    })
    compensi.push({
      socio_ref: SOCIO_2_ID,
      socio_nome: 'Laura Villani',
      importo: 2500,
      periodo,
      data_pagamento: dataPag ? ts(dataPag) : null,
      stato: pagato ? 'pagata' : 'attesa',
      note: '',
      conto_pagamento: pagato ? CONTO_PRINCIPALE_ID : null,
      conto_pagamento_nome: pagato ? 'Conto Principale' : null,
      createdAt: ts(mese),
    })
  }

  return {
    soci,
    conti,
    costi,
    contratti,
    rate,
    movimenti,
    provvigioni,
    compensi,
  }
}
