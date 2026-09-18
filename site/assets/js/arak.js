/* ==========================================================================
   ÁRLISTA  —  a kalkulátor egyetlen adatforrása
   ==========================================================================

   EZ A FÁJL JELENLEG ÜRES, SZÁNDÉKOSAN.

   Amíg az `aktiv` értéke false, a kalkulátor szekció REJTVE marad az
   oldalon. Így kizárt, hogy kitalált szám jelenjen meg a látogatónak.

   A számokat a valódi árlistából kell kitölteni. Minden érték
   FORINTBAN, nettó, ÁFA nélkül értendő.

   Bekapcsolás: töltsd ki az értékeket, majd állítsd az `aktiv` mezőt
   true-ra. A kalkulátor ettől magától megjelenik, kódmódosítás nélkül.

   Ha az árlistád más szerkezetű (például sávos méretárazás, vagy
   típusonként eltérő egység), szólj — a számítómotort hozzáigazítom.
   ========================================================================== */

window.LUPATHERM_ARAK = {

  /* false = a kalkulátor nem jelenik meg. Csak kitöltés után true. */
  aktiv: false,

  penznem: 'Ft',
  afaSzazalek: 27,

  /* A becslés sávszélessége. 0.15 = a számított értéktől -15% ... +15%.
     Egyetlen szám hamis pontosságot sugallna. */
  savSzazalek: 0.15,

  /* --- Nyílászáró: NÉGYZETMÉTERÁR anyagonként --- */
  nyilaszaro: {
    muanyag: null,          // Ft / m²
    fa:      null,
    alu:     null,
    /* Kis nyílásoknál a m²-ár nem lineáris. Ennél kisebb felületnél
       a rendszer erre a minimumra kerekít. null = nincs minimum. */
    minM2:   null           // m²
  },

  /* --- Bejárati ajtó: DARABÁR kivitelenként --- */
  ajto: {
    alap:           null,   // Ft / db
    oldalvilagito:  null,
    felulvilagito:  null
  },

  /* --- Árnyékolás: DARABÁR nyílásonként --- */
  arnyekolas: {
    redony_kezi:    null,   // Ft / nyílás
    redony_motoros: null,
    zsaluzia:       null,
    reluxa:         null
  },

  /* --- Kiegészítők: DARABÁR --- */
  kiegeszito: {
    szunyoghalo: null,      // Ft / db
    parkany:     null       // Ft / db
  },

  /* --- Bontás és beépítés: nyílásonkénti DARABÁR --- */
  beepites: {
    nyilaszaro: null,       // Ft / nyílás
    ajto:       null        // Ft / db
  }
};
