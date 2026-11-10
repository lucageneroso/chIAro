# Chiaro (chIAro) – scaffolding del prompting per over 60

Progetto di Human-Computer Interaction in tre fasi: **analisi** del problema, **design** di un'interfaccia e **impostazione dello studio di usabilità**. Tutto il materiale è in italiano.

**Autore:** Lucageneroso Cammarota
**Prototipo navigabile (Figma Make):** <https://www.figma.com/make/03MRhQWg9yCTM1Ie8Dj4FV/chIAro?t=ZgmoQmeEHKZ3e1TB-1>

> **Stato del progetto.** L'analisi (AS1) e il design (AS2) sono completi. Lo studio di usabilità (AS3) è **impostato** (protocollo, ipotesi, soglie, istruzioni, piano di analisi) ma **non è stato ancora eseguito con partecipanti**. Nessun risultato di test è riportato in questa repo.

---

## 1. In breve

Scrivere una richiesta efficace a un assistente basato su un modello linguistico (LLM) è difficile per chi non è esperto. La letteratura lo chiama *articulation barrier*: l'utente sa cosa vuole ma non sa come dirlo. Per le persone over 60 gli studi riportano richieste prolisse o incomplete, aspettative di conversazione naturale e un lavoro di riparazione degli errori che ricade spesso su familiari e caregiver.

**Chiaro** è un'applicazione web (pensata prima per tablet, poi per smartphone) in cui l'utente **non scrive un prompt da zero**: sceglie un'attività, risponde a poche domande una alla volta, controlla in italiano comune che cosa verrà chiesto all'assistente e solo dopo il suo consenso la richiesta parte. Testo e dettatura sono alternativi.

## 2. Problema e obiettivi

**Problema.** La pagina bianca di una chat libera chiede di produrre un testo, non di riconoscere opzioni. Questo penalizza chi ha poca competenza digitale e rende l'assistente poco accessibile proprio a chi potrebbe usarlo per pratiche quotidiane (lettere, avvisi, informazioni pratiche).

**Contesto d'uso immaginato.** Un corso di alfabetizzazione digitale in un centro sociale o in una biblioteca, dove un tutor affianca i partecipanti. Il contesto sostitutivo è la casa dell'utente con un familiare accanto.

**Obiettivi del progetto**

1. Capire, dalle evidenze pubblicate, che cosa fanno e che cosa incontrano gli over 60 con gli assistenti conversazionali (AS1).
2. Progettare un'interfaccia che trasformi la *produzione* di un prompt in *riconoscimento* di opzioni, con aiuto che l'utente può ridurre col tempo, controllo e trasparenza (AS2).
3. Definire come misurare se funziona rispetto a una chat libera senza scaffolding, con specifiche di usabilità fissate prima dei dati (AS2 e AS3).

**Obiettivi dello studio sommativo (AS3)**

- Validare Chiaro su tre task rispetto alle specifiche di usabilità.
- Rigettare le ipotesi nulle, con la completezza della prima richiesta (US01) come ipotesi primaria.
- Raggiungere una soddisfazione sufficiente: SUS ≥ 68, la media di riferimento.

## 3. Il design in sintesi

**Tre livelli di aiuto**, scelti dall'utente e modificabili in ogni momento:

| Livello | Che cosa fa |
|---|---|
| *Ti guido* | Domande una alla volta (default per i nuovi utenti) |
| *Ti suggerisco* | Campo libero con suggerimenti mentre si scrive |
| *Scrivo io* | Conversazione libera, aiuto solo su richiesta |

**Cinque principi:** ridurre la barriera di articolazione; aiuto che si ritira (fading); controllo e trasparenza; progettare per l'invecchiamento senza trattare «gli anziani» come un blocco; affiancare e non sostituire tutor e familiari.

**Percorso in quattro passi:** scegliere un'attività → rispondere alle domande → controllare «La tua richiesta» → leggere e verificare la risposta. Chiaro non invia nulla da solo: le lettere le spedisce l'utente.

**Metafore di design:** lo scrivano pubblico, il ricettario, la scheda che si compila, il taccuino, la sedia accanto, matita e gomma (ognuna con dichiarato dove «si rompe»).

**Attività nella Home:** Scrivere una lettera, Capire un avviso, Organizzare una gita, Cercare un'informazione.

### Personas e task

| Persona | Ruolo | Scenario | Task di test |
|---|---|---|---|
| **Rosa**, 71 anni | Primaria: competenza digitale limitata, richieste vaghe | La richiesta vaga | **T1** Scrivere una lettera di disdetta |
| **Giuseppe**, 78 anni | Secondaria: preferisce la voce | La voce che non capisce | **T2** Chiedere un'informazione a voce, chiudere, cancellare una voce da «Cosa ricordo» |
| **Marta**, 46 anni | Figlia e caregiver | Verificare una risposta | **T3** Capire un avviso, verificare le fonti, invitare Marta («Sedia accanto») |

Esiste anche una persona negativa (Marco) usata per delimitare il progetto.

### Schermate del prototipo

F1 Home · F2 Modelli di lettera · F3 Domanda guidata · F4 La tua richiesta · F5 Bozza · F6 Dettatura · F7 Risposta strutturata · F8 Taccuino · F9 Sedia accanto (con vista simulata di Marta).

## 4. Metodo e onestà sui limiti

- **AS1 non si basa su interviste.** È un'analisi di dati secondari: dieci fonti pubblicate, un registro di fatti numerati (E1…E40) e personas composite. Tre fonti sono preprint e per alcune è stato letto solo l'abstract (dichiarato nel documento). Gli studi riguardano soprattutto contesti statunitensi e assistenti vocali, quindi i risultati sono trattati come **ipotesi** per gli over 60 italiani con un LLM.
- **I claim di AS2 sono previsioni motivate**, non risultati. Il segno + o − indica un'attesa da mettere alla prova in AS3.
- **Le valutazioni formative sono analitiche**: euristica e cognitive walkthrough sono svolti dal progettista, senza utenti, e le correzioni sono verificate nel codice, non su un dispositivo.
- **Il prototipo simula l'assistente.** I testi sono scritti a priori (variante a copione del Wizard of Oz), microfono e condivisione sono simulati. Si valuta l'usabilità percepita, non la qualità delle risposte di un modello reale.
- **Progettista, osservatore e analista coincidono** e il campione previsto è piccolo (8 persone più 3 per il pilota): rischio di conferma, ridotto con soglie fissate prima dei dati, protocollo scritto e secondo codificatore per US01.
- **Deviazioni dalla traccia, dichiarate:** AS1 sostituisce l'indagine contestuale su 5 partecipanti con l'analisi di dati secondari; AS3 valuta il prototipo dell'autore invece di quello di un altro gruppo.
- Le citazioni bibliografiche aggiunte in AS2 sono a livello di opera, senza pagine, e vanno ricontrollate sul testo integrale.

## 5. Struttura della repo


```
.
├── README.md
├── docs/
│   ├── chIAro_AS1_ANALYZE_v2_0.docx            Assignment 1 – Analisi del problema (Rev. 2)
│   ├── chIAro_AS2_design_v5_1.docx             Assignment 2 – Design (Rev. 5)
│   └── chIAro_AS3_UsabilityTesting_v7_0.docx   Assignment 3 – Usability testing (Rev. 7)
└── frames/                                     Screenshot F1–F8 del prototipo (già inseriti in AS2)
|--src/ codice sorgente
```

| Documento | Domanda a cui risponde | Contenuto principale |
|---|---|---|
| **AS1** Analisi | *Qual è il problema e che cosa sappiamo?* | Idea di progetto, metodo, corpus, registro delle evidenze E#, 11 domande D1–D11, personas, 3 problem scenario |
| **AS2** Design | *Che cosa progettiamo e perché?* | Concept e principi, metafore, 3 scenari di design, claim C1–C30, mockup e storyboard, euristica H-#, specifiche US01–US16, requisiti R#, valutazione dei frame, Allegato A (walkthrough W-#) |
| **AS3** Usability testing | *Come misuriamo se funziona?* | Euristica sul prototipo finale (P-#), soglie delle specifiche, disegno dello studio, partecipanti e questionari, ipotesi nulle, istruzioni, raccolta e analisi dati |

## 6. Come navigare tra i documenti

### La catena

```
AS1: dati e problema        AS2: scelte di design        AS3: misura e verifica
 E (evidenze)      ──►       C (claim)          ──►       US (soglie)
 D (domande)                 H, W (problemi)             T1–T3 (task)
 Rosa / Giuseppe / Marta     US (specifiche)             P (problemi del prototipo)
 3 problem scenario          R (requisiti)               B, H0 (questionari, ipotesi)
```

Ogni elemento «a valle» cita da dove nasce quello «a monte». Si può quindi **risalire** da una misura fino al dato di partenza, e **scendere** da un'evidenza fino a come verrà verificata.

### Glossario delle sigle

| Sigla | Significato | Dove |
|---|---|---|
| **E1–E40** | Fatti riportati dagli studi (evidenze) | AS1, sez. 4 |
| **D1–D11** | Le 11 domande di analisi | AS1, sez. 5 |
| **P1–P5** *(senza trattino)* | Principi di design | AS2, sez. 2 |
| **M1–M6** | Metafore | AS2, sez. 3 |
| **C1–C30** | Claim (pro e contro di una scelta). C1–C9 scenario 1, C10–C18 scenario 2, C19–C27 scenario 3, C28–C30 trasversali | AS2, sez. 4 |
| **F1–F9** | Frame (schermate) | AS2, sez. 5.2 |
| **T1–T3** | Task | AS2, AS3 |
| **H-01…H-16** | Problemi dell'euristica sul brief dei frame | AS2, sez. 6 |
| **H1–H10** *(senza trattino)* | Le dieci euristiche di Nielsen | in tutti |
| **W-1…W-13** | Problemi del cognitive walkthrough | AS2, Allegato A |
| **F4-x, A-x** | Problemi trovati sui frame reali | AS2, sez. 9 |
| **US01–US16** | Specifiche di usabilità (origine in AS2, soglie in AS3) | AS2 sez. 7; AS3 sez. 3 |
| **R01…** | Requisiti | AS2, sez. 7.1 |
| **P-1…P-28** *(con trattino)* | Problemi del prototipo finale | AS3, sez. 2 |
| **B1…** | Domande del questionario di background | AS3, sez. 5 |
| **H0-1…H0-7** | Ipotesi nulle | AS3, sez. 6 |

Attenzione: **P1** è un principio (AS2), **P-1** è un problema (AS3); **H1–H10** sono le euristiche, **H-01…H-16** sono i problemi trovati.
Quando un documento dice «Design» intende AS2; quando dice «Assignment 3, sezione 5» intende AS3.

### Consultare in modo veloce

1. **Risali da una specifica.** In AS2, sez. 7, la colonna «Origine» di ogni US elenca claim, problemi e evidenze. Esempio: **US09** (verifica) ha origine in C21, C23, C25 e H-16. Cerca poi C25 in AS2, sez. 4 per vedere il claim «Lettore integrato per le fonti», e le E# che lo sostengono in AS1, sez. 4.
2. **Usa le tabelle di raccordo, che sono già scorciatoie.** Ogni riga dell'Allegato A (AS2) lega W → H → US → P. La tabella di raccordo in AS3, sez. 2 lega H-xx, F4-x e A-x ai P-xx. La sez. 7.1 di AS2 lega ogni requisito ai claim e alle US.
3. **Cerca la sigla** con Ctrl+F (per gli intervalli come H-13…H-16, cerca ogni sigla).
4. **Usa il Riquadro di spostamento di Word** (Visualizza → Riquadro di spostamento) per saltare tra sezioni; il Sommario è cliccabile con Ctrl+clic.

### Percorso di esempio (T3)

> **T3** *Capire un avviso e condividerlo* (AS3, sez. 3)
> → misura **US09** *Verifica* e **US11** *Condivisione* (soglie «Minimo» e «Obiettivo» in AS3, sez. 3)
> → in AS2, sez. 7 le loro origini: **C21, C23, C25, C20, C26, H-14, H-15, H-16**
> → il walkthrough **W-9** (aprire una fonte con «Apri») è collegato a H-16, US09 e al problema aperto **P-27** (i due «Apri» non si distinguono)
> → le evidenze alla base dei claim sono in AS1, sez. 4.

### Per chi ha poco tempo

| Se vuoi… | Leggi |
|---|---|
| Capire il problema in 2 minuti | Questo README, sez. 1–2 |
| Vedere che cosa è stato progettato | AS2 sez. 2 e 5 (e il link al prototipo) |
| Capire come si valuterà | AS3 sez. 1, 3 e 4 |
| Verificare che ogni scelta abbia un fondamento | AS2 sez. 4 (colonna «Base») e sez. 7 (colonna «Origine») |
| Vedere i limiti | Questo README, sez. 4; AS3, sez. 1 e 9 |

## 7. Disegno dello studio di usabilità (AS3)

- **Tipo:** studio sommativo comparativo *within-group* su 8 partecipanti di almeno 60 anni, più 3 per il pilota. Ogni partecipante usa **Chiaro** e una **chat libera** senza scaffolding su T1 e T2, con ordine e varianti bilanciati su otto combinazioni.
- **T3** si svolge sempre per ultimo, solo su Chiaro, perché la chat libera non ha un equivalente della «Sedia accanto».
- **Sessione:** circa 75 minuti, con pensiero ad alta voce e solleciti neutri dell'osservatore.
- **Misure:** completezza della prima richiesta (US01, ipotesi primaria), tempi, errori, interventi dell'osservatore, SUS e NASA-TLX raw. Le soglie sono su tre livelli (worst, planned, best) e fissate prima dei dati.
- **Analisi:** test di Wilcoxon a coppie per le ipotesi nulle, kappa di Cohen per l'accordo tra codificatori, codifica qualitativa per euristica e gravità collegata ai problemi H, P e W.
- **Etica:** consenso scritto, codici anonimi, dati inventati nei task.

## 8. Storico delle revisioni

I tre documenti hanno ciascuno un registro delle revisioni in apertura. Stato attuale: AS1 Rev. 2, AS2 Rev. 5, AS3 Rev. 7 (10 novembre 2026). Il prototipo valutato in AS3 comprende T3 (F7 e F9).

## 9. Come citare

Cammarota, L. (2026). *Chiaro: scaffolding del prompting per over 60* (Assignment 1–3). Materiale didattico, repo GitHub.

