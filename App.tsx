import { useEffect, useRef, useState, type ReactNode } from "react";

type IconName =
  | "book"
  | "calendar"
  | "chat"
  | "eye"
  | "microphone"
  | "notebook"
  | "pencil"
  | "search"
  | "settings"
  | "spark"
  | "volume";

const activities: Array<{
  title: string;
  description: string;
  icon: IconName;
  color: string;
}> = [
  {
    title: "Scrivere una lettera",
    description: "Prepara un messaggio chiaro per una persona o un ufficio.",
    icon: "pencil",
    color: "var(--coral)",
  },
  {
    title: "Capire un avviso",
    description: "Leggi un avviso e individua le informazioni importanti.",
    icon: "eye",
    color: "var(--yellow)",
  },
  {
    title: "Organizzare una gita",
    description: "Raccogli orari, indirizzi e dettagli per la giornata.",
    icon: "calendar",
    color: "var(--blue)",
  },
  {
    title: "Cercare un’informazione",
    description: "Trova una risposta utile partendo da una domanda.",
    icon: "search",
    color: "var(--mint)",
  },
];

const noticeSources = [
  {
    name: "Avviso di pagamento del Comune",
    description: "Testo simulato trascritto da Rosa.",
    text: "Comune di Valle Serena\n\nAvviso di pagamento numero 2026-184.\nImporto: 86,40 euro.\nScadenza: 30 novembre 2026.\nIl pagamento può essere effettuato tramite avviso pagoPA.",
  },
  {
    name: "Guida ai pagamenti comunali",
    description: "Pagina informativa simulata del Comune.",
    text: "Guida ai pagamenti comunali\n\nControlla sempre il numero dell’avviso, l’importo e la data di scadenza. Per chiarimenti usa i recapiti ufficiali riportati sull’avviso originale.",
  },
];

const letterModels = [
  {
    title: "Disdire un servizio",
    result: "una lettera di disdetta, pronta da rileggere.",
    questions: ["quale servizio", "da quando vuoi disdire", "come pensi di spedirla"],
  },
  {
    title: "Chiedere informazioni a un ufficio",
    result: "una lettera con le tue domande, in modo chiaro e cortese.",
    questions: [
      "a quale ufficio scrivi",
      "che cosa vuoi sapere",
      "entro quando ti serve la risposta",
    ],
  },
  {
    title: "Chiedere un rimborso o un reclamo",
    result: "una lettera che spiega il problema e che cosa chiedi.",
    questions: ["che cosa è successo", "quando", "che cosa vuoi ottenere"],
  },
  {
    title: "Scrivere a un familiare o a un amico",
    result: "un messaggio personale, con il tono che preferisci.",
    questions: ["a chi scrivi", "per quale occasione", "che tono vuoi"],
  },
];

const guidedContent: Record<
  string,
  Array<{
    label: string;
    question: string;
    choices: string[];
    date?: boolean;
  }>
> = {
  "Disdire un servizio": [
    {
      label: "Servizio",
      question: "quale servizio",
      choices: [
        "Telefono o internet",
        "Luce o gas",
        "Un abbonamento (rivista, palestra, TV)",
        "Assicurazione o banca",
      ],
    },
    {
      label: "Da quando",
      question: "da quando vuoi disdire",
      choices: ["Da subito", "Dal prossimo mese", "Da una data precisa"],
      date: true,
    },
    {
      label: "Spedizione",
      question: "come pensi di spedirla",
      choices: ["Raccomandata", "PEC o email", "La consegno di persona"],
    },
  ],
  "Chiedere informazioni a un ufficio": [
    {
      label: "Ufficio",
      question: "a quale ufficio scrivi",
      choices: ["Comune", "ASL o ambulatorio", "INPS o patronato", "Agenzia delle entrate"],
    },
    {
      label: "Informazione",
      question: "che cosa vuoi sapere",
      choices: [
        "Orari e modalità di accesso",
        "Documenti necessari",
        "Come fissare un appuntamento",
        "A che punto è una pratica",
      ],
    },
    {
      label: "Risposta",
      question: "entro quando ti serve la risposta",
      choices: ["Appena possibile", "Entro una settimana", "Entro una data precisa"],
      date: true,
    },
  ],
  "Chiedere un rimborso o un reclamo": [
    {
      label: "Problema",
      question: "che cosa è successo",
      choices: [
        "Un acquisto non corrisponde a quanto promesso",
        "Un servizio si è interrotto",
        "Ho ricevuto un addebito sbagliato",
        "Una consegna è in ritardo o danneggiata",
      ],
    },
    {
      label: "Quando",
      question: "quando è successo",
      choices: ["Oggi", "Questa settimana", "Questo mese", "In una data precisa"],
      date: true,
    },
    {
      label: "Richiesta",
      question: "che cosa vuoi ottenere",
      choices: ["Un rimborso", "Una sostituzione", "Una riparazione", "Una risposta scritta"],
    },
  ],
  "Scrivere a un familiare o a un amico": [
    {
      label: "Destinatario",
      question: "a chi scrivi",
      choices: ["A un familiare", "A un amico", "A più persone"],
    },
    {
      label: "Occasione",
      question: "per quale occasione",
      choices: [
        "Per fare gli auguri",
        "Per ringraziare",
        "Per fare un invito",
        "Per dare mie notizie",
      ],
    },
    {
      label: "Tono",
      question: "che tono vuoi",
      choices: ["Affettuoso", "Semplice e diretto", "Formale e rispettoso"],
    },
  ],
};

type GuidedAnswer = {
  value: string;
  choice: string;
  status: "answered" | "unknown";
  dateInput?: string;
};

function lowerInitialUnlessAcronym(value: string) {
  const trimmed = value.trim();
  const firstWord = trimmed.split(/[\s,.;:()]+/)[0];
  if (/^[A-ZÀ-Ý]{2,}$/.test(firstWord)) return trimmed;
  return trimmed.charAt(0).toLocaleLowerCase("it") + trimmed.slice(1);
}

function isValidItalianDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const numeric = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (numeric) {
    const [, day, month, year] = numeric;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return (
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
    );
  }

  return /^\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}$/iu.test(
    trimmed,
  );
}

function requestPhrase(modelTitle: string) {
  const phrases: Record<string, string> = {
    "Disdire un servizio": "chiedo di disdire il servizio",
    "Chiedere informazioni a un ufficio": "chiedo di ricevere informazioni dall’ufficio",
    "Chiedere un rimborso o un reclamo": "chiedo di ottenere un rimborso o una risposta al reclamo",
    "Scrivere a un familiare o a un amico": "chiedo di inviare questo messaggio personale",
  };
  return phrases[modelTitle] ?? `chiedo di ${lowerInitialUnlessAcronym(modelTitle)}`;
}

function Icon({ name, size = 28 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, ReactNode> = {
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),
    chat: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    microphone: (
      <>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
      </>
    ),
    notebook: (
      <>
        <path d="M5 4a2 2 0 0 1 2-2h12v20H7a2 2 0 0 1-2-2Z" />
        <path d="M5 6H3M5 10H3M5 14H3M5 18H3M10 7h5M10 11h5" />
      </>
    ),
    pencil: (
      <>
        <path d="m4 20 4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10Z" />
        <path d="m14.5 7 3 3M4 20l1.5-4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.51-1H3v-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.51V3h4v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.51 1H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    spark: (
      <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" />
    ),
    volume: (
      <>
        <path d="M11 5 6 9H2v6h4l5 4Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [textScale, setTextScale] = useState(100);
  const [helpLevel, setHelpLevel] = useState("Ti guido");
  const [message, setMessage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [screen, setScreen] = useState<
    | "home"
    | "models"
    | "guided"
    | "summary"
    | "future"
    | "draft"
    | "custom"
    | "voice-info"
    | "forget"
    | "notebook"
    | "notice-describe"
    | "notice-response"
    | "notice-source"
    | "share-method"
    | "share-scope"
    | "share-confirm"
    | "marta-view"
  >("home");
  const [selectedModel, setSelectedModel] = useState<(typeof letterModels)[number] | null>(null);
  const [helpChooserOpen, setHelpChooserOpen] = useState(false);
  const [unavailableHelpNotice, setUnavailableHelpNotice] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<number, GuidedAnswer>>({});
  const [requestOpen, setRequestOpen] = useState(true);
  const [showCustomAnswer, setShowCustomAnswer] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "review">("idle");
  const [voiceText] = useState("Vorrei indicare una risposta diversa");
  const [customLetterText, setCustomLetterText] = useState("");
  const [customVoiceState, setCustomVoiceState] = useState<"idle" | "listening" | "review">("idle");
  const customVoiceText = "Vorrei scrivere una lettera per invitare la mia famiglia a pranzo";
  const [resultState, setResultState] = useState<"initial" | "feedback" | "revised">("initial");
  const [revisionAttempts, setRevisionAttempts] = useState(0);
  const [revisionReason, setRevisionReason] = useState("Troppo lunga");
  const [feedbackOtherOpen, setFeedbackOtherOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackReturnState, setFeedbackReturnState] = useState<"initial" | "revised">("initial");
  const [feedbackVoiceState, setFeedbackVoiceState] = useState<"idle" | "listening" | "review">(
    "idle",
  );
  const [draftSaved, setDraftSaved] = useState(false);
  const [editableDraftText, setEditableDraftText] = useState("");
  const [previousDraftText, setPreviousDraftText] = useState("");
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<
    Array<{
      id: number;
      title: string;
      date: string;
      text: string;
    }>
  >([]);
  const [infoVoiceState, setInfoVoiceState] = useState<
    "idle" | "listening" | "review" | "response" | "response-listening" | "closed"
  >("idle");
  const [infoPhrase, setInfoPhrase] = useState(
    "Quando apre al sabato l’ambulatorio del dottor Nero?",
  );
  const [doctorWord, setDoctorWord] = useState("Nero");
  const [conversationSaved, setConversationSaved] = useState(false);
  const [wordCorrectionOpen, setWordCorrectionOpen] = useState(false);
  const [wordCorrected, setWordCorrected] = useState(false);
  const [otherWordOpen, setOtherWordOpen] = useState(false);
  const [otherWord, setOtherWord] = useState("");
  const [infoReply, setInfoReply] = useState("");
  const [voiceNotice, setVoiceNotice] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [noticeVoiceState, setNoticeVoiceState] = useState<"idle" | "listening">("idle");
  const [openNoticeSource, setOpenNoticeSource] = useState<number | null>(null);
  const [shareMethod, setShareMethod] = useState<"message" | "qr" | "code" | null>(null);
  const [shareScope, setShareScope] = useState<"conversation" | "history" | null>(null);
  const [sharingActive, setSharingActive] = useState(false);
  const [stopSharingConfirm, setStopSharingConfirm] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [martaDraft, setMartaDraft] = useState("");
  const [martaSuggestion, setMartaSuggestion] = useState("");
  const [rosaNote, setRosaNote] = useState("");
  const [noticeSaved, setNoticeSaved] = useState(false);
  const [conversations, setConversations] = useState<
    Array<{
      id: number;
      title: string;
      date: string;
      text: string;
    }>
  >([]);
  const [memoryItems, setMemoryItems] = useState([
    { id: 1, text: "Il tuo medico è il dottor Neri" },
  ]);
  const [forgetCandidate, setForgetCandidate] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [forgotItem, setForgotItem] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const [observerOpen, setObserverOpen] = useState(false);
  const [observerEventCount, setObserverEventCount] = useState(0);
  const eventLogRef = useRef<Array<{ timestamp: string; label: string }>>([]);
  const feedbackVoiceText = "Vorrei una lettera più semplice e diretta";
  const infoReplyRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const previousScreenRef = useRef(screen);
  const memoryFocusRequestedRef = useRef(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLElement>(null);

  const helpDescriptions: Record<string, string> = {
    "Ti guido": "Domande una alla volta, per costruire insieme la richiesta.",
    "Ti suggerisco": "Scrivi liberamente e ricevi indicazioni mentre procedi.",
    "Scrivo io": "Conversazione libera, con aiuto solo quando lo chiedi.",
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    requestAnimationFrame(() => settingsButtonRef.current?.focus());
  };

  const goToScreen = (
    nextScreen:
      | "home"
      | "models"
      | "guided"
      | "summary"
      | "future"
      | "draft"
      | "custom"
      | "voice-info"
      | "forget"
      | "notebook"
      | "notice-describe"
      | "notice-response"
      | "notice-source"
      | "share-method"
      | "share-scope"
      | "share-confirm"
      | "marta-view",
  ) => {
    setScreen(nextScreen);
    setMessage("");
    setHelpChooserOpen(false);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!settingsOpen) return;

    settingsPanelRef.current?.focus();
    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        requestAnimationFrame(() => settingsButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || !settingsPanelRef.current) return;

      const focusable = Array.from(
        settingsPanelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === settingsPanelRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyboard);
    return () => document.removeEventListener("keydown", handleDialogKeyboard);
  }, [settingsOpen]);

  useEffect(() => {
    if (previousScreenRef.current !== screen) {
      if (screen === "notebook" && memoryFocusRequestedRef.current) {
        document.querySelector<HTMLElement>("#memory-section-title")?.focus();
        memoryFocusRequestedRef.current = false;
      } else {
        document.querySelector<HTMLElement>("#main h1")?.focus();
      }
      previousScreenRef.current = screen;
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "guided") {
      document.querySelector<HTMLElement>("#main h1")?.focus();
      setShowCustomAnswer(false);
      setVoiceState("idle");
    }
  }, [currentQuestion, screen]);

  useEffect(() => {
    const updateRequestCard = () => {
      setRequestOpen(
        textScale === 100 &&
          window.matchMedia("(min-width: 1024px) and (orientation: landscape)").matches,
      );
    };
    updateRequestCard();
    window.addEventListener("resize", updateRequestCard);
    return () => window.removeEventListener("resize", updateRequestCard);
  }, [textScale]);

  const addObserverEvent = (label: string) => {
    eventLogRef.current.push({
      timestamp: new Date().toISOString(),
      label,
    });
    setObserverEventCount(eventLogRef.current.length);
    localStorage.setItem("chiaro-event-log", JSON.stringify(eventLogRef.current));
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chiaro-event-log");
      if (stored) {
        eventLogRef.current = JSON.parse(stored);
        setObserverEventCount(eventLogRef.current.length);
      }
    } catch {
      eventLogRef.current = [];
    }
    if (new URLSearchParams(window.location.search).get("osservatore") === "1") {
      setObserverOpen(true);
    }
    const recordButton = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      if (!button || button.closest(".observer-panel")) return;
      const label = (
        button.getAttribute("aria-label") ||
        button.textContent ||
        "Pulsante senza etichetta"
      )
        .replace(/\s+/g, " ")
        .trim();
      addObserverEvent(label);
    };
    const showObserver = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        setObserverOpen((open) => !open);
      }
    };
    document.addEventListener("click", recordButton, true);
    document.addEventListener("keydown", showObserver);
    return () => {
      document.removeEventListener("click", recordButton, true);
      document.removeEventListener("keydown", showObserver);
    };
  }, []);

  const formattedToday = () =>
    new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

  const startInformationSearch = () => {
    setInfoVoiceState("idle");
    setInfoPhrase("Quando apre al sabato l’ambulatorio del dottor Nero?");
    setDoctorWord("Nero");
    setConversationSaved(false);
    setWordCorrectionOpen(false);
    setWordCorrected(false);
    setOtherWordOpen(false);
    setOtherWord("");
    setInfoReply("");
    setVoiceNotice("");
    goToScreen("voice-info");
  };

  const startNoticeUnderstanding = () => {
    setNoticeText("");
    setNoticeVoiceState("idle");
    setOpenNoticeSource(null);
    setShareMethod(null);
    setShareScope(null);
    setSharingActive(false);
    setStopSharingConfirm(false);
    setCodeCopied(false);
    setMartaDraft("");
    setMartaSuggestion("");
    setRosaNote("");
    setNoticeSaved(false);
    goToScreen("notice-describe");
  };

  const saveNoticeConversation = () => {
    if (!noticeSaved) {
      setConversations((items) => [
        {
          id: Date.now(),
          title: "Avviso di pagamento del Comune",
          date: formattedToday(),
          text: noticeText,
        },
        ...items,
      ]);
      setNoticeSaved(true);
    }
    goToScreen("notebook");
  };

  const correctDoctorName = (word: string) => {
    setDoctorWord(word);
    setInfoPhrase(`Quando apre al sabato l’ambulatorio del dottor ${word}?`);
    setWordCorrected(true);
    setWordCorrectionOpen(false);
    setOtherWordOpen(false);
  };

  const closeInformationConversation = () => {
    const date = formattedToday();
    setInfoVoiceState("closed");
    setVoiceNotice("");
    if (!conversationSaved) {
      setConversations((items) => [
        {
          id: Date.now(),
          title: `Orari dell’ambulatorio del dottor ${doctorWord}`,
          date,
          text: infoPhrase,
        },
        ...items,
      ]);
      setConversationSaved(true);
    }
  };

  const submitInformationReply = (value: string) => {
    const hasQuestion = value.includes("?");
    const normalized = value
      .trim()
      .toLocaleLowerCase("it")
      .replace(/[.,!?;:]+/g, " ")
      .replace(/\s+/g, " ");
    const isCompleteClosing =
      /^(grazie|grazie (?:basta così|mille|ho finito)|basta (?:così|grazie)|ho finito|è tutto|a posto così|va bene (?:così|grazie)|ok grazie|niente altro grazie|non mi serve altro|può chiudere|puoi chiudere|chiudi(?: pure| la conversazione)?)$/u.test(
        normalized,
      );
    if (isCompleteClosing && !hasQuestion) {
      closeInformationConversation();
    } else {
      setVoiceNotice("La conversazione resta aperta. Puoi continuare a fare domande.");
    }
  };

  const listenToPhrase = () => {
    setVoiceNotice(`Ascolto: ${infoPhrase}`);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(infoPhrase));
    }
  };

  const confirmForget = () => {
    if (!forgetCandidate) return;
    setMemoryItems((items) => items.filter((item) => item.id !== forgetCandidate.id));
    setForgotItem(forgetCandidate);
    setForgetCandidate(null);
  };

  const undoForget = () => {
    if (!forgotItem) return;
    setMemoryItems((items) => [forgotItem, ...items]);
    setForgotItem(null);
  };

  const exportEventLog = () => {
    const text = eventLogRef.current
      .map((event) => `${event.timestamp}\t${event.label}`)
      .join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `chiaro-registro-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetObservationSession = () => {
    eventLogRef.current = [];
    setObserverEventCount(0);
    localStorage.removeItem("chiaro-event-log");
    addObserverEvent("Cambia partecipante");
    setTheme("light");
    setTextScale(100);
    setSavedDrafts([]);
    setConversations([]);
    setMemoryItems([{ id: 1, text: "Il tuo medico è il dottor Neri" }]);
    setForgotItem(null);
    setForgetCandidate(null);
    setSelectedModel(null);
    setGuidedAnswers({});
    setCustomLetterText("");
    setInfoVoiceState("idle");
    setInfoReply("");
    setMessage("");
    setHelpLevel("Ti guido");
    setObserverOpen(false);
    goToScreen("home");
  };

  const activeQuestions = selectedModel ? (guidedContent[selectedModel.title] ?? []) : [];
  const completedAnswers = Object.values(guidedAnswers).filter(
    (answer) => answer.value || answer.status === "unknown",
  ).length;
  const currentAnswer = guidedAnswers[currentQuestion];
  const openFieldIndexes = activeQuestions
    .map((_, index) => index)
    .filter((index) => !guidedAnswers[index]?.value || guidedAnswers[index]?.status === "unknown");
  const openFieldLabels = openFieldIndexes.map((index) => activeQuestions[index]?.label);

  const startModel = (model: (typeof letterModels)[number]) => {
    setSelectedModel(model);
    setCurrentQuestion(0);
    setGuidedAnswers({});
    setShowCustomAnswer(false);
    setVoiceState("idle");
    goToScreen("guided");
  };

  const setAnswer = (answer: GuidedAnswer) => {
    setGuidedAnswers((answers) => ({
      ...answers,
      [currentQuestion]: answer,
    }));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
    if (screen !== "guided") {
      goToScreen("guided");
    }
  };

  const goForward = () => {
    if (!currentAnswer?.value && currentAnswer?.status !== "unknown") return;
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion((question) => question + 1);
    } else {
      goToScreen("summary");
    }
  };

  const chooseUnknown = () => {
    setAnswer({
      value: "Da decidere",
      choice: "Non so",
      status: "unknown",
    });
  };

  const answerFragment = (
    index: number,
    format: (value: string) => string = lowerInitialUnlessAcronym,
  ) => {
    const answer = guidedAnswers[index];
    if (!answer || answer.status === "unknown") return null;
    return (
      <strong>
        <u>{format(answer.value)}</u>
      </strong>
    );
  };

  const openFieldFragment = (index: number) => (
    <span className="open-field-wrap">
      <span className="open-field-fragment">
        <span className="open-field-icon" aria-hidden="true" />
        [Da decidere]
      </span>
      <button className="inline-answer-button" onClick={() => goToQuestion(index)}>
        Rispondi ora
      </button>
    </span>
  );

  const openResult = () => {
    setResultState("initial");
    setRevisionAttempts(0);
    setRevisionReason("Troppo lunga");
    setFeedbackOtherOpen(false);
    setFeedbackText("");
    setFeedbackVoiceState("idle");
    setDraftSaved(false);
    setCurrentDraftId(null);
    setEditableDraftText(draftText);
    setPreviousDraftText(draftText);
    goToScreen("draft");
  };

  const requestRevision = (reason: string) => {
    setPreviousDraftText(editableDraftText);
    setRevisionAttempts((attempts) => attempts + 1);
    setRevisionReason(reason);
    setEditableDraftText(buildRevisedDraft(reason));
    setDraftSaved(false);
    setResultState("revised");
    setFeedbackOtherOpen(false);
    setFeedbackVoiceState("idle");
  };

  const openFeedback = () => {
    setFeedbackReturnState(resultState === "revised" ? "revised" : "initial");
    setFeedbackOtherOpen(false);
    setFeedbackText("");
    setFeedbackVoiceState("idle");
    setResultState("feedback");
  };

  const serviceValue = guidedAnswers[0]?.value;
  const dateValue = guidedAnswers[1]?.value;
  const shippingValue = guidedAnswers[2]?.value;
  const dateDetail = dateValue
    ? `La disdetta deve avere effetto ${lowerInitialUnlessAcronym(dateValue)}.`
    : "";
  const shippingDetail =
    shippingValue === "La consegno di persona"
      ? "Consegnerò la lettera di persona."
      : shippingValue
        ? `Spedirò la lettera così: ${lowerInitialUnlessAcronym(shippingValue)}.`
        : "";
  const disdettaDetails = [
    serviceValue ? `Il servizio è: ${serviceValue}.` : "",
    dateDetail,
    shippingDetail,
  ]
    .filter(Boolean)
    .join(" ");
  const genericDetails = activeQuestions
    .map((question, index) => {
      const answer = guidedAnswers[index];
      if (!answer?.value || answer.status === "unknown") return "";
      return `${question.label}: ${answer.value}.`;
    })
    .filter(Boolean)
    .join(" ");
  const selectedDetails =
    selectedModel?.title === "Disdire un servizio" ? disdettaDetails : genericDetails;

  const incompleteFieldsText = openFieldIndexes
    .map((index) => `[DA COMPLETARE: ${lowerInitialUnlessAcronym(activeQuestions[index].label)}]`)
    .join("\n");
  const appendIncompleteFields = (text: string) =>
    incompleteFieldsText ? `${text}\n\n${incompleteFieldsText}` : text;

  const baseDraftText = !selectedModel
    ? `Gentile destinatario,\n\n${customLetterText}\n\nCordiali saluti`
    : selectedModel.title === "Disdire un servizio"
      ? `Oggetto: richiesta di disdetta\n\nGentili responsabili,\n\ncon la presente chiedo di disdire il servizio. ${disdettaDetails}\n\nVi chiedo di confermare la chiusura del servizio.\n\nCordiali saluti`
      : `Gentile destinatario,\n\n${requestPhrase(selectedModel.title)}. ${selectedDetails}\n\nResto in attesa di una risposta.\n\nCordiali saluti`;
  const draftText = appendIncompleteFields(baseDraftText);

  const buildRevisedDraft = (reason: string) =>
    appendIncompleteFields(
      reason === "Troppo lunga"
        ? !selectedModel
          ? `Gentile destinatario,\n\n${customLetterText}\n\nCordiali saluti`
          : `Gentile destinatario,\n\n${requestPhrase(selectedModel.title)}. ${selectedDetails}\n\nCordiali saluti`
        : reason === "Manca qualcosa"
          ? `${baseDraftText}\n\nResto a disposizione per fornire altri dati e chiedo una conferma scritta della ricezione.`
          : reason === "Tono sbagliato"
            ? `Spettabile destinatario,\n\nLe scrivo cortesemente e ${
                selectedModel ? requestPhrase(selectedModel.title) : customLetterText
              }. ${selectedDetails}\n\nLa ringrazio per l’attenzione e resto in attesa di un gentile riscontro.\n\nCordiali saluti`
            : `${baseDraftText}\n\nHo aggiornato la lettera seguendo questa indicazione: ${reason}.`,
    );

  const revisionTitle =
    revisionReason === "Troppo lunga"
      ? "Ecco una versione più corta"
      : revisionReason === "Manca qualcosa"
        ? "Ecco una versione più completa"
        : revisionReason === "Tono sbagliato"
          ? "Ecco una versione con un tono diverso"
          : "Ecco la versione aggiornata";

  const revisionSummary =
    revisionReason === "Troppo lunga"
      ? "Ho tolto il secondo paragrafo e mantenuto solo le informazioni essenziali."
      : revisionReason === "Manca qualcosa"
        ? "Ho aggiunto un paragrafo con la richiesta di conferma e la disponibilità a fornire altri dati."
        : revisionReason === "Tono sbagliato"
          ? "Ho reso il saluto e la richiesta più cordiali e formali."
          : `Ho seguito la tua indicazione: ${revisionReason}.`;

  const saveCurrentDraft = () => {
    const text = draftRef.current?.value.trim() || editableDraftText;
    const id = currentDraftId ?? Date.now();
    const savedDraft = {
      id,
      title: selectedModel?.title ?? "Un altro tipo di lettera",
      date: new Intl.DateTimeFormat("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
      text,
    };
    setSavedDrafts((drafts) => {
      const existingIndex = drafts.findIndex((draft) => draft.id === id);
      if (existingIndex === -1) return [savedDraft, ...drafts];
      return drafts.map((draft) => (draft.id === id ? savedDraft : draft));
    });
    setCurrentDraftId(id);
    setDraftSaved(true);
  };

  return (
    <div
      className="app-shell"
      data-theme={theme}
      data-text-scale={textScale}
      style={{ "--text-scale": textScale / 100 } as React.CSSProperties}
    >
      <header className="topbar">
        <a
          className="brand"
          href="/"
          aria-label="Chiaro, torna alla Home"
          onClick={(event) => {
            event.preventDefault();
            goToScreen("home");
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>Chiaro</span>
        </a>

        <div className="header-actions">
          <button
            className="outline-button notebook-button"
            onClick={() => {
              goToScreen("notebook");
            }}
          >
            <Icon name="notebook" />
            <span>Il mio Taccuino</span>
          </button>
          <button
            ref={settingsButtonRef}
            className="outline-button settings-button"
            aria-expanded={settingsOpen}
            aria-controls="settings-panel"
            onClick={() => setSettingsOpen(true)}
          >
            <Icon name="settings" />
            <span>Impostazioni</span>
          </button>
        </div>
      </header>

      <div
        className={`page-layout home-layout ${
          screen === "guided" ? "guided-page" : ""
        } ${screen === "draft" ? "result-page" : ""}`}
      >
        {screen === "home" && (
          <main id="main" className="main-content home-content">
            <div className="intro">
              <p className="eyebrow">Ciao</p>
              <h1 tabIndex={-1}>Cosa vuoi fare oggi?</h1>
              <p>Scegli un’attività. Puoi fermarti quando vuoi.</p>

              <div className="always-help" role="radiogroup" aria-label="Livello di aiuto">
                <p className="help-label">Come vuoi usare Chiaro?</p>
                <div className="help-level-row">
                  {["Ti guido", "Ti suggerisco", "Scrivo io"].map((level) => (
                    <button
                      type="button"
                      role="radio"
                      key={level}
                      className={helpLevel === level ? "selected" : ""}
                      aria-checked={helpLevel === level}
                      tabIndex={helpLevel === level ? 0 : -1}
                      onClick={() => {
                        if (level === "Ti guido") {
                          setHelpLevel(level);
                          setUnavailableHelpNotice("");
                        } else {
                          setUnavailableHelpNotice("Non disponibile in questa versione");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                          return;
                        }
                        event.preventDefault();
                        const levels = ["Ti guido", "Ti suggerisco", "Scrivo io"];
                        const direction = event.key === "ArrowRight" ? 1 : -1;
                        const nextIndex =
                          (levels.indexOf(level) + direction + levels.length) % levels.length;
                        if (levels[nextIndex] === "Ti guido") {
                          setHelpLevel("Ti guido");
                          setUnavailableHelpNotice("");
                        } else {
                          setUnavailableHelpNotice("Non disponibile in questa versione");
                        }
                        const buttons =
                          event.currentTarget.parentElement?.querySelectorAll("button");
                        requestAnimationFrame(() => buttons?.[nextIndex]?.focus());
                      }}
                    >
                      <span>{level}</span>
                      {helpLevel === level && (
                        <span className="radio-check" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="selected-help-description">{helpDescriptions[helpLevel]}</p>
                {unavailableHelpNotice && (
                  <p className="unavailable-help" role="status">
                    {unavailableHelpNotice}
                  </p>
                )}
              </div>
            </div>

            <section aria-labelledby="activities-title">
              <div className="section-heading">
                <h2 id="activities-title">Le tue attività</h2>
              </div>

              <div className="activity-grid">
                {activities.map((activity) => (
                  <button
                    className="activity-card"
                    key={activity.title}
                    onClick={() => {
                      if (activity.title === "Scrivere una lettera") {
                        goToScreen("models");
                      } else if (activity.title === "Capire un avviso") {
                        startNoticeUnderstanding();
                      } else if (activity.title === "Cercare un’informazione") {
                        startInformationSearch();
                      } else {
                        setUnavailableHelpNotice("Non disponibile in questa versione");
                      }
                    }}
                  >
                    <span
                      className="activity-icon"
                      style={{ backgroundColor: activity.color }}
                      aria-hidden="true"
                    >
                      <Icon name={activity.icon} size={32} />
                    </span>
                    <span className="card-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </main>
        )}

        {screen === "models" && (
          <main id="main" className="main-content models-content">
            <div className="subpage-navigation">
              <button className="outline-button" onClick={() => goToScreen("home")}>
                <span aria-hidden="true">←</span>
                <span>Torna alla Home</span>
              </button>
              <nav aria-label="Percorso">
                <span>Scrivere una lettera</span>
                <span aria-hidden="true">›</span>
                <strong>Modelli</strong>
              </nav>
            </div>

            <div className="compact-help">
              <span>
                Livello di aiuto: <strong>{helpLevel}</strong>
              </span>
              <button
                className="text-button"
                aria-expanded={helpChooserOpen}
                aria-controls="compact-help-options"
                onClick={() => setHelpChooserOpen((open) => !open)}
              >
                Cambia
              </button>
            </div>

            {helpChooserOpen && (
              <div
                id="compact-help-options"
                className="compact-help-options"
                role="group"
                aria-label="Cambia il livello di aiuto"
              >
                {["Ti guido", "Ti suggerisco", "Scrivo io"].map((level) => (
                  <button
                    key={level}
                    aria-pressed={helpLevel === level}
                    className={helpLevel === level ? "selected" : ""}
                    onClick={() => {
                      if (level === "Ti guido") {
                        setHelpLevel(level);
                        setUnavailableHelpNotice("");
                      } else {
                        setUnavailableHelpNotice("Non disponibile in questa versione");
                      }
                      setHelpChooserOpen(false);
                    }}
                  >
                    {level}
                    {helpLevel === level && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            )}
            {unavailableHelpNotice && (
              <p className="unavailable-help compact" role="status">
                {unavailableHelpNotice}
              </p>
            )}

            <div className="models-intro">
              <div className="recipe-label">
                <Icon name="book" />
                <span>Ricettario</span>
              </div>
              <h1 className="screen-title" tabIndex={-1}>
                Modelli di lettera
              </h1>
              <p>
                Scegli il modello più vicino a ciò che ti serve. Potrai cambiare ogni dettaglio.
              </p>
            </div>

            <section className="models-grid" aria-label="Modelli di lettera">
              {letterModels.map((model, index) => (
                <article className="model-card" key={model.title}>
                  <button
                    className="model-card-action"
                    aria-labelledby={`model-title-${index}`}
                    onClick={() => startModel(model)}
                  />
                  <h2 className="model-title" id={`model-title-${index}`}>
                    {model.title}
                  </h2>
                  <span className="model-detail">
                    <strong>Cosa ottieni</strong>
                    <span>{model.result}</span>
                  </span>
                  <span className="model-detail">
                    <strong>Cosa ti chiederò</strong>
                    <span className="question-list">
                      {model.questions.map((question) => (
                        <span key={question}>{question}</span>
                      ))}
                    </span>
                  </span>
                </article>
              ))}
            </section>

            <div className="custom-choice">
              <button
                className="outline-button custom-letter-button"
                onClick={() => {
                  setSelectedModel(null);
                  setCustomLetterText("");
                  setCustomVoiceState("idle");
                  goToScreen("custom");
                }}
              >
                <Icon name="pencil" />
                <span>Un altro tipo di lettera</span>
              </button>
              <p>Nessun modello? Descrivi tu che lettera ti serve.</p>
            </div>

            <div className="flow-disclaimer" role="note">
              <p>
                Ti aiuto a preparare la richiesta; poi sarà l’assistente a scrivere la bozza della
                lettera.
              </p>
              <p>Chiaro non invia nulla: le lettere le spedisci tu.</p>
            </div>
          </main>
        )}

        {screen === "guided" && selectedModel && activeQuestions.length > 0 && (
          <main id="main" className="main-content guided-screen">
            <div className="guided-topline">
              <button className="outline-button" onClick={() => goToScreen("models")}>
                <span aria-hidden="true">←</span>
                <span>Torna ai modelli</span>
              </button>
              <strong>
                Domanda {currentQuestion + 1} di {activeQuestions.length}
              </strong>
            </div>

            <div className="guided-layout">
              <aside className="request-card" aria-label="La tua richiesta">
                <h2 className="request-card-title">La tua richiesta</h2>
                <button
                  className="request-toggle"
                  aria-expanded={requestOpen}
                  aria-controls="request-card-content"
                  onClick={() => setRequestOpen((open) => !open)}
                >
                  <span>
                    {requestOpen
                      ? "Nascondi La tua richiesta"
                      : `Mostra La tua richiesta (${completedAnswers} di 3)`}
                  </span>
                  <span aria-hidden="true">{requestOpen ? "−" : "+"}</span>
                </button>
                {requestOpen && (
                  <div id="request-card-content" className="request-card-content">
                    {activeQuestions.map((question, index) => {
                      const answer = guidedAnswers[index];
                      return (
                        <button
                          className={`request-field ${index === currentQuestion ? "current" : ""}`}
                          key={question.label}
                          onClick={() => goToQuestion(index)}
                        >
                          <span>{question.label}</span>
                          <strong>
                            {(!answer || (answer.status === "answered" && !answer.value)) && (
                              <>
                                <span className="field-status empty" aria-hidden="true" />
                                Ancora da dire
                              </>
                            )}
                            {answer?.status === "unknown" && (
                              <>
                                <span className="field-status" aria-hidden="true">
                                  !
                                </span>
                                Da decidere
                              </>
                            )}
                            {answer?.status === "answered" && answer.value && answer.value}
                          </strong>
                          {index === currentQuestion && (
                            <span className="current-field-note">Stai rispondendo qui</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </aside>

              <section className="question-panel">
                <h1 className="screen-title question-title" tabIndex={-1}>
                  {activeQuestions[currentQuestion].question.charAt(0).toUpperCase() +
                    activeQuestions[currentQuestion].question.slice(1)}
                  ?
                </h1>
                <p className="model-context">{selectedModel.title}</p>

                <div className="answer-list" role="group" aria-label="Scegli una risposta">
                  {activeQuestions[currentQuestion].choices.map((choice) => (
                    <button
                      key={choice}
                      className={currentAnswer?.choice === choice ? "selected" : ""}
                      aria-pressed={currentAnswer?.choice === choice}
                      onClick={() => {
                        setShowCustomAnswer(false);
                        setVoiceState("idle");
                        setAnswer({
                          value:
                            choice.includes("data precisa") || choice.includes("una data precisa")
                              ? ""
                              : choice,
                          choice,
                          status: "answered",
                          dateInput:
                            choice.includes("data precisa") || choice.includes("una data precisa")
                              ? ""
                              : undefined,
                        });
                      }}
                    >
                      <span>{choice}</span>
                      <span
                        className={`answer-check ${
                          currentAnswer?.choice === choice ? "checked" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {currentAnswer?.choice === choice ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                  <button
                    className={currentAnswer?.choice === "Altro" ? "selected" : ""}
                    aria-pressed={currentAnswer?.choice === "Altro"}
                    onClick={() => {
                      setShowCustomAnswer(true);
                      setVoiceState("idle");
                      setAnswer({
                        value: "",
                        choice: "Altro",
                        status: "answered",
                      });
                    }}
                  >
                    <span>Altro</span>
                    <span
                      className={`answer-check ${
                        currentAnswer?.choice === "Altro" ? "checked" : ""
                      }`}
                      aria-hidden="true"
                    >
                      {currentAnswer?.choice === "Altro" ? "✓" : ""}
                    </span>
                  </button>
                  <button
                    className={currentAnswer?.choice === "Non so" ? "selected" : ""}
                    aria-pressed={currentAnswer?.choice === "Non so"}
                    onClick={chooseUnknown}
                  >
                    <span>Non so</span>
                    <span
                      className={`answer-check ${
                        currentAnswer?.choice === "Non so" ? "checked" : ""
                      }`}
                      aria-hidden="true"
                    >
                      {currentAnswer?.choice === "Non so" ? "✓" : ""}
                    </span>
                  </button>
                </div>

                {currentAnswer?.choice.toLocaleLowerCase("it").includes("data precisa") && (
                  <label className="inline-answer-field">
                    <span>Indica la data</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="5 dicembre 2026"
                      value={currentAnswer.dateInput ?? ""}
                      aria-invalid={
                        Boolean(currentAnswer.dateInput) &&
                        !isValidItalianDate(currentAnswer.dateInput ?? "")
                      }
                      aria-describedby={
                        currentAnswer.dateInput && !isValidItalianDate(currentAnswer.dateInput)
                          ? "date-guidance date-error"
                          : "date-guidance"
                      }
                      onChange={(event) =>
                        setAnswer({
                          value: isValidItalianDate(event.target.value)
                            ? `${
                                activeQuestions[currentQuestion].question.includes("da quando")
                                  ? "Dal"
                                  : "il"
                              } ${event.target.value}`
                            : "",
                          choice: currentAnswer.choice,
                          status: "answered",
                          dateInput: event.target.value,
                        })
                      }
                    />
                    <small id="date-guidance">
                      Usa il formato 5 dicembre 2026 oppure 05/12/2026.
                    </small>
                    {currentAnswer.dateInput && !isValidItalianDate(currentAnswer.dateInput) && (
                      <strong id="date-error" className="field-error">
                        Controlla la data prima di andare avanti.
                      </strong>
                    )}
                  </label>
                )}

                {showCustomAnswer && (
                  <div className="custom-answer-panel">
                    <label className="inline-answer-field">
                      <span>Scrivi la tua risposta</span>
                      <input
                        type="text"
                        value={currentAnswer?.value ?? ""}
                        onChange={(event) =>
                          setAnswer({
                            value: event.target.value,
                            choice: "Altro",
                            status: "answered",
                          })
                        }
                      />
                    </label>
                    <div className="custom-answer-actions">
                      <button className="outline-button" onClick={() => setVoiceState("listening")}>
                        <Icon name="microphone" />
                        <span>Parla</span>
                      </button>
                    </div>

                    {voiceState === "listening" && (
                      <div className="voice-state" role="status">
                        <strong>Ti ascolto…</strong>
                        <div className="sound-level" aria-label="Livello sonoro medio">
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                        <button className="outline-button" onClick={() => setVoiceState("review")}>
                          Fine
                        </button>
                      </div>
                    )}

                    {voiceState === "review" && (
                      <div className="voice-state" role="status">
                        <p>
                          <strong>Ho capito:</strong> {voiceText}
                        </p>
                        <div className="custom-answer-actions">
                          <button
                            className="outline-button"
                            onClick={() => {
                              setAnswer({
                                value: voiceText,
                                choice: "Altro",
                                status: "answered",
                              });
                              setVoiceState("idle");
                            }}
                          >
                            Va bene
                          </button>
                          <button
                            className="outline-button"
                            onClick={() => setVoiceState("listening")}
                          >
                            Dillo di nuovo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="question-actions">
                  <button
                    className="outline-button"
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion((question) => question - 1)}
                  >
                    ← Domanda precedente
                  </button>
                  <button
                    className="primary-button guided-next"
                    disabled={!currentAnswer?.value && currentAnswer?.status !== "unknown"}
                    onClick={goForward}
                  >
                    {!currentAnswer?.value && currentAnswer?.status !== "unknown"
                      ? "Scegli una risposta"
                      : "Avanti"}
                  </button>
                </div>
              </section>
            </div>
          </main>
        )}

        {screen === "future" && (
          <main id="main" className="main-content placeholder-screen">
            <h1 className="screen-title" tabIndex={-1}>
              Questo livello arriverà in una versione successiva
            </h1>
            <button
              className="outline-button placeholder-back"
              onClick={() => goToScreen("models")}
            >
              <span aria-hidden="true">←</span>
              <span>Torna ai modelli</span>
            </button>
          </main>
        )}

        {screen === "summary" && (selectedModel || customLetterText) && (
          <main id="main" className="main-content summary-screen">
            <h1 className="screen-title" tabIndex={-1}>
              Ecco cosa chiederò
            </h1>
            <p className="summary-intro">
              Questo è ciò che chiederò all’assistente. Manca solo il tuo ok.
            </p>

            <div className="request-sentence">
              {!selectedModel ? (
                <p>
                  <strong>
                    <u>{customLetterText}</u>
                  </strong>
                </p>
              ) : selectedModel.title === "Disdire un servizio" ? (
                <p>
                  Scrivi una lettera di disdetta
                  {openFieldIndexes.includes(0) ? (
                    <>; il servizio è {openFieldFragment(0)}</>
                  ) : (
                    <> per questo servizio: {answerFragment(0)}</>
                  )}
                  {openFieldIndexes.includes(1) ? (
                    <>; la data da cui disdire è {openFieldFragment(1)}</>
                  ) : (
                    <>, con effetto {answerFragment(1)}</>
                  )}
                  {openFieldIndexes.includes(2) ? (
                    <>; il modo di spedirla è ancora da decidere: {openFieldFragment(2)}</>
                  ) : (
                    <>
                      ,{" "}
                      {answerFragment(2, (value) =>
                        value === "La consegno di persona"
                          ? "che consegnerò di persona"
                          : `da spedire così: ${lowerInitialUnlessAcronym(value)}`,
                      )}
                    </>
                  )}
                  .
                </p>
              ) : (
                <p className="generic-request">
                  Prepara una lettera per{" "}
                  <strong>
                    <u>{lowerInitialUnlessAcronym(selectedModel.title)}</u>
                  </strong>
                  .{" "}
                  {activeQuestions.map((question, index) => (
                    <span key={question.label}>
                      {question.label}:{" "}
                      {openFieldIndexes.includes(index)
                        ? openFieldFragment(index)
                        : answerFragment(index)}
                      .
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div className="limits-note" role="note">
              <strong>Da controllare</strong>
              <span>
                {selectedModel &&
                (selectedModel.title === "Disdire un servizio" ||
                  selectedModel.title === "Chiedere un rimborso o un reclamo")
                  ? "Posso scrivere una bozza, ma non conosco il tuo contratto: controlla i dati."
                  : "Rileggi la bozza prima di usarla."}
              </span>
            </div>

            {openFieldLabels.length > 0 && (
              <p className="missing-fields" role="status">
                <strong>Manca:</strong> {openFieldLabels.join(", ")}. Nella bozza resterà un punto
                da completare.
              </p>
            )}

            <div className="summary-actions">
              <button className="primary-button" onClick={openResult}>
                Scrivi la bozza della lettera
              </button>
              {selectedModel ? (
                <>
                  <button
                    className="outline-button"
                    onClick={() =>
                      goToQuestion(Math.min(currentQuestion, activeQuestions.length - 1))
                    }
                  >
                    ← Rivedi le risposte
                  </button>
                </>
              ) : (
                <button className="outline-button" onClick={() => goToScreen("custom")}>
                  Cambia la richiesta
                </button>
              )}
            </div>

            <p className="summary-disclaimer">Chiaro non invia nulla: le lettere le spedisci tu.</p>
          </main>
        )}

        {screen === "draft" && (
          <main id="main" className="main-content result-screen">
            <p className="step-label">{selectedModel?.title ?? "Altro modello"}</p>
            <h1 className="screen-title" tabIndex={-1}>
              {resultState === "revised" ||
              (resultState === "feedback" && feedbackReturnState === "revised")
                ? revisionTitle
                : "Ecco la bozza della lettera"}
            </h1>

            <div className="editable-draft">
              <div className="editable-label">
                <Icon name="pencil" />
                <span>Bozza modificabile</span>
              </div>
              <textarea
                ref={draftRef}
                className="draft-text"
                aria-label="Testo della bozza modificabile"
                rows={12}
                value={editableDraftText}
                onChange={(event) => {
                  setEditableDraftText(event.target.value);
                  setDraftSaved(false);
                }}
              />
            </div>

            <p className="result-disclaimer" role="note">
              Chiaro non invia nulla: la lettera la spedisci tu.
            </p>

            {resultState === "feedback" && (
              <section className="feedback-panel" aria-labelledby="feedback-title">
                <h2 id="feedback-title">Che cosa non va?</h2>
                <div className="feedback-options">
                  {["Troppo lunga", "Manca qualcosa", "Tono sbagliato"].map((reason) => (
                    <button key={reason} onClick={() => requestRevision(reason)}>
                      {reason}
                    </button>
                  ))}
                  <button onClick={() => setFeedbackOtherOpen(true)}>Altro</button>
                </div>

                {feedbackOtherOpen && (
                  <div className="feedback-other">
                    <label className="inline-answer-field">
                      <span>Spiega che cosa vuoi cambiare</span>
                      <input
                        type="text"
                        value={feedbackText}
                        onChange={(event) => setFeedbackText(event.target.value)}
                      />
                    </label>
                    <button
                      className="outline-button"
                      onClick={() => setFeedbackVoiceState("listening")}
                    >
                      <Icon name="microphone" />
                      <span>Parla</span>
                    </button>

                    {feedbackVoiceState === "listening" && (
                      <div className="voice-state" role="status">
                        <strong>Ti ascolto…</strong>
                        <div className="sound-level" aria-label="Livello sonoro medio">
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                        <button
                          className="outline-button"
                          onClick={() => setFeedbackVoiceState("review")}
                        >
                          Fine
                        </button>
                      </div>
                    )}

                    {feedbackVoiceState === "review" && (
                      <div className="voice-state" role="status">
                        <p>
                          <strong>Ho capito:</strong> {feedbackVoiceText}
                        </p>
                        <div className="custom-answer-actions">
                          <button
                            className="outline-button"
                            onClick={() => {
                              setFeedbackText(feedbackVoiceText);
                              setFeedbackVoiceState("idle");
                            }}
                          >
                            Va bene
                          </button>
                          <button
                            className="outline-button"
                            onClick={() => setFeedbackVoiceState("listening")}
                          >
                            Dillo di nuovo
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      className="outline-button use-feedback"
                      disabled={!feedbackText.trim()}
                      onClick={() => requestRevision(feedbackText)}
                    >
                      Usa questa indicazione
                    </button>
                  </div>
                )}

                <button
                  className="outline-button feedback-cancel"
                  onClick={() => setResultState(feedbackReturnState)}
                >
                  Annulla
                </button>
              </section>
            )}

            {resultState === "revised" && (
              <div className="change-summary">
                <h2>Cosa ho cambiato</h2>
                <p>{revisionSummary}</p>
              </div>
            )}

            {resultState !== "feedback" && (
              <>
                <div className="result-actions">
                  <div className="save-draft-group">
                    <button className="primary-button" onClick={saveCurrentDraft}>
                      Salva la bozza
                    </button>
                    <p>La trovi nel Taccuino.</p>
                    {draftSaved && (
                      <p className="save-status" role="status">
                        Bozza salvata.
                      </p>
                    )}
                  </div>

                  {resultState === "revised" && (
                    <button
                      className="outline-button"
                      onClick={() => {
                        setEditableDraftText(previousDraftText);
                        setResultState("initial");
                        setDraftSaved(false);
                      }}
                    >
                      Torna alla versione precedente
                    </button>
                  )}

                  <button className="outline-button" onClick={openFeedback}>
                    Non è quello che volevo
                  </button>

                  {resultState === "initial" && (
                    <button className="outline-button" onClick={() => goToScreen("summary")}>
                      ← Cambia la richiesta
                    </button>
                  )}
                </div>

                {revisionAttempts >= 2 && (
                  <div className="change-request-callout">
                    <p>Se continua a non andare, cambiamo la richiesta.</p>
                    <button className="outline-button" onClick={() => goToScreen("summary")}>
                      Cambia la richiesta
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        )}

        {screen === "custom" && (
          <main id="main" className="main-content placeholder-screen">
            <button className="outline-button" onClick={() => goToScreen("models")}>
              <span aria-hidden="true">←</span>
              <span>Torna ai modelli</span>
            </button>
            <p className="step-label">Altro modello</p>
            <h1 className="screen-title" tabIndex={-1}>
              Descrivi la lettera
            </h1>
            <label className="custom-text-field">
              <span>Descrivi con le tue parole</span>
              <textarea
                rows={5}
                placeholder="Scrivi o detta la tua risposta"
                value={customLetterText}
                onChange={(event) => setCustomLetterText(event.target.value)}
              />
            </label>
            <p className="custom-explanation">
              Per esempio: «Vorrei scrivere al mio Comune per chiedere informazioni». Poi potrai
              rileggere la richiesta.
            </p>
            <button
              className="outline-button speak-button"
              onClick={() => setCustomVoiceState("listening")}
            >
              <Icon name="microphone" />
              <span>Parla</span>
            </button>

            {customVoiceState === "listening" && (
              <div className="voice-state custom-voice-state" role="status">
                <strong>Ti ascolto…</strong>
                <div className="sound-level" aria-label="Livello sonoro medio">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <button className="outline-button" onClick={() => setCustomVoiceState("review")}>
                  Fine
                </button>
              </div>
            )}

            {customVoiceState === "review" && (
              <div className="voice-state custom-voice-state" role="status">
                <p>
                  <strong>Ho capito:</strong> {customVoiceText}
                </p>
                <div className="custom-answer-actions">
                  <button
                    className="outline-button"
                    onClick={() => {
                      setCustomLetterText(customVoiceText);
                      setCustomVoiceState("idle");
                    }}
                  >
                    Va bene
                  </button>
                  <button
                    className="outline-button"
                    onClick={() => setCustomVoiceState("listening")}
                  >
                    Dillo di nuovo
                  </button>
                </div>
              </div>
            )}

            <button
              className="primary-button custom-next"
              disabled={!customLetterText.trim()}
              onClick={() => goToScreen("summary")}
            >
              {customLetterText.trim() ? "Avanti" : "Scrivi o detta la richiesta"}
            </button>
          </main>
        )}

        {screen === "notice-describe" && (
          <main id="main" className="main-content notice-screen">
            <button className="outline-button" onClick={() => goToScreen("home")}>
              <span aria-hidden="true">←</span>
              <span>Torna alla Home</span>
            </button>
            <p className="step-label">Capire un avviso</p>
            <h1 className="screen-title" tabIndex={-1}>
              Descrivi l’avviso
            </h1>
            <p className="notice-intro">
              Trascrivi le parti importanti dell’avviso. Usa solo dati inventati in questo
              prototipo.
            </p>
            <label className="custom-text-field">
              <span>Testo dell’avviso</span>
              <textarea
                rows={7}
                value={noticeText}
                onChange={(event) => setNoticeText(event.target.value)}
                placeholder="Per esempio: Comune, avviso di pagamento, importo e scadenza"
              />
            </label>
            <div className="notice-compose-actions">
              <button className="outline-button" onClick={() => setNoticeVoiceState("listening")}>
                <Icon name="microphone" />
                <span>Parla</span>
              </button>
              <button
                className="primary-button"
                disabled={!noticeText.trim()}
                onClick={() => goToScreen("notice-response")}
              >
                Avanti
              </button>
            </div>
            {noticeVoiceState === "listening" && (
              <div className="voice-state" role="status">
                <strong>Ti ascolto…</strong>
                <div className="sound-level" aria-label="Livello sonoro medio">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <button
                  className="outline-button"
                  onClick={() => {
                    setNoticeText(
                      "Ho ricevuto un avviso di pagamento dal Comune di Valle Serena: devo pagare 86,40 euro entro il 30 novembre 2026.",
                    );
                    setNoticeVoiceState("idle");
                  }}
                >
                  Fine
                </button>
              </div>
            )}
          </main>
        )}

        {screen === "notice-response" && (
          <main id="main" className="main-content notice-screen">
            <button className="outline-button" onClick={() => goToScreen("notice-describe")}>
              <span aria-hidden="true">←</span>
              <span>Torna alla descrizione</span>
            </button>
            <p className="step-label">Capire un avviso</p>
            <h1 className="screen-title" tabIndex={-1}>
              Risposta
            </h1>

            <article className="structured-answer" aria-label="Risposta strutturata">
              <section className="answer-section">
                <div className="answer-section-title">
                  <Icon name="eye" />
                  <h2>In breve</h2>
                </div>
                <p>
                  È un avviso di pagamento simulato del Comune di Valle Serena. L’importo è di
                  <strong> 86,40 euro</strong> e la scadenza indicata è il
                  <strong> 30 novembre 2026</strong>.
                </p>
              </section>

              <section className="answer-section answer-section-compact">
                <div className="answer-section-title">
                  <Icon name="search" />
                  <h2>Cosa non so</h2>
                </div>
                <p>Non vedo il documento originale, solo ciò che hai trascritto.</p>
              </section>

              <section className="answer-section">
                <div className="answer-section-title">
                  <Icon name="pencil" />
                  <h2>Cosa devi fare</h2>
                </div>
                <ol>
                  <li>Confronta importo, scadenza e numero dell’avviso con il documento.</li>
                  <li>Controlla che il destinatario sia davvero il Comune.</li>
                  <li>Se i dati coincidono, usa il metodo di pagamento indicato nell’avviso.</li>
                </ol>
              </section>

              <section className="answer-section">
                <div className="answer-section-title">
                  <Icon name="book" />
                  <h2>Da dove lo so</h2>
                </div>
                <div className="source-list">
                  {noticeSources.map((source, index) => (
                    <article className="source-card" key={source.name}>
                      <h3>{source.name}</h3>
                      <p>{source.description}</p>
                      <button
                        className="outline-button"
                        onClick={() => {
                          setOpenNoticeSource(index);
                          goToScreen("notice-source");
                        }}
                      >
                        <Icon name="book" />
                        <span>Apri</span>
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            </article>

            <section className="evidence-panel" aria-labelledby="evidence-title">
              <h2 id="evidence-title">Che cosa ho usato</h2>
              <p>
                Mostra cosa ho preso dalla tua richiesta e dalle fonti; non spiega come ragiona il
                modello.
              </p>
              <div className="evidence-item">
                <strong>La tua richiesta</strong>
                <span>{noticeText}</span>
              </div>
              <div className="evidence-item">
                <strong>Le fonti usate</strong>
                <span>{noticeSources.map((source) => source.name).join("; ")}.</span>
              </div>
            </section>

            <div className="notice-result-actions">
              <button className="primary-button" onClick={() => goToScreen("share-method")}>
                <Icon name="chat" />
                <span>Invita qualcuno</span>
              </button>
              <button className="outline-button" onClick={saveNoticeConversation}>
                <Icon name="notebook" />
                <span>Concludi e salva nel Taccuino</span>
              </button>
            </div>
          </main>
        )}

        {screen === "notice-source" && openNoticeSource !== null && (
          <main id="main" className="main-content source-reader">
            <p className="step-label">Lettore integrato</p>
            <h1 className="screen-title" tabIndex={-1}>
              {noticeSources[openNoticeSource].name}
            </h1>
            <article className="source-document">
              {noticeSources[openNoticeSource].text.split("\n").map((line, index) => (
                <p key={`${line}-${index}`}>{line || "\u00a0"}</p>
              ))}
            </article>
            <button className="primary-button" onClick={() => goToScreen("notice-response")}>
              <span aria-hidden="true">←</span>
              <span>Torna alla risposta</span>
            </button>
          </main>
        )}

        {screen === "share-method" && (
          <main id="main" className="main-content share-screen">
            <p className="step-label">Sedia accanto · Passo 1 di 3</p>
            <h1 className="screen-title" tabIndex={-1}>
              Invita qualcuno
            </h1>
            <p className="notice-intro">Scegli come far arrivare l’invito a Marta.</p>
            <div className="share-options" role="group" aria-label="Metodo di invito">
              <button
                className={shareMethod === "message" ? "selected" : ""}
                aria-pressed={shareMethod === "message"}
                onClick={() => setShareMethod("message")}
              >
                <Icon name="chat" />
                <span>
                  <strong>Link inviato per messaggio</strong>
                  <small>Simula l’invio di un collegamento a Marta.</small>
                </span>
              </button>
              <button
                className={shareMethod === "qr" ? "selected" : ""}
                aria-pressed={shareMethod === "qr"}
                onClick={() => setShareMethod("qr")}
              >
                <Icon name="eye" />
                <span>
                  <strong>QR</strong>
                  <small>Marta può inquadrare il codice con il suo dispositivo.</small>
                </span>
              </button>
              <button
                className={shareMethod === "code" ? "selected" : ""}
                aria-pressed={shareMethod === "code"}
                onClick={() => setShareMethod("code")}
              >
                <Icon name="pencil" />
                <span>
                  <strong>Codice</strong>
                  <small>Usalo solo come ripiego.</small>
                </span>
              </button>
            </div>

            {shareMethod === "qr" && (
              <div className="qr-preview" role="img" aria-label="Codice QR simulato">
                <span aria-hidden="true">QR</span>
                <strong>QR simulato per Marta</strong>
              </div>
            )}

            {shareMethod === "code" && (
              <div className="fallback-code">
                <span>Codice di ripiego</span>
                <strong>MARTA-4826</strong>
                <button
                  className="outline-button"
                  onClick={() => {
                    void navigator.clipboard?.writeText("MARTA-4826");
                    setCodeCopied(true);
                  }}
                >
                  <Icon name="pencil" />
                  <span>Copia</span>
                </button>
                {codeCopied && <p role="status">Codice copiato.</p>}
              </div>
            )}

            <div className="share-navigation">
              <button className="outline-button" onClick={() => goToScreen("notice-response")}>
                ← Torna alla risposta
              </button>
              <button
                className="primary-button"
                disabled={!shareMethod}
                onClick={() => goToScreen("share-scope")}
              >
                Avanti
              </button>
            </div>
          </main>
        )}

        {screen === "share-scope" && (
          <main id="main" className="main-content share-screen">
            <p className="step-label">Sedia accanto · Passo 2 di 3</p>
            <h1 className="screen-title" tabIndex={-1}>
              Che cosa vuoi condividere?
            </h1>
            <div className="share-options" role="group" aria-label="Ambito della condivisione">
              <button
                className={shareScope === "conversation" ? "selected" : ""}
                aria-pressed={shareScope === "conversation"}
                onClick={() => setShareScope("conversation")}
              >
                <Icon name="chat" />
                <span>
                  <strong>Solo questa conversazione</strong>
                  <small>Marta vede la richiesta sull’avviso e questa risposta.</small>
                </span>
              </button>
              <button
                className={shareScope === "history" ? "selected" : ""}
                aria-pressed={shareScope === "history"}
                onClick={() => setShareScope("history")}
              >
                <Icon name="notebook" />
                <span>
                  <strong>Tutta la cronologia</strong>
                  <small>Marta vede anche le attività precedenti presenti nel Taccuino.</small>
                </span>
              </button>
            </div>
            <div className="share-navigation">
              <button className="outline-button" onClick={() => goToScreen("share-method")}>
                ← Indietro
              </button>
              <button
                className="primary-button"
                disabled={!shareScope}
                onClick={() => {
                  setSharingActive(true);
                  setStopSharingConfirm(false);
                  goToScreen("share-confirm");
                }}
              >
                Condividi
              </button>
            </div>
          </main>
        )}

        {screen === "share-confirm" && (
          <main id="main" className="main-content share-screen">
            <p className="step-label">Sedia accanto · Passo 3 di 3</p>
            <h1 className="screen-title" tabIndex={-1}>
              {sharingActive ? "Condivisione attiva" : "Condivisione interrotta"}
            </h1>

            <section className="shared-with-panel" aria-labelledby="shared-with-title">
              <div className="answer-section-title">
                <Icon name="eye" />
                <h2 id="shared-with-title">Cosa vede Marta</h2>
              </div>
              <ul>
                <li>La richiesta di Rosa sull’avviso del Comune.</li>
                <li>La risposta strutturata e le due fonti simulate.</li>
                {shareScope === "history" && <li>Le attività precedenti del Taccuino.</li>}
                <li>Le nuove note aggiunte in questa conversazione.</li>
              </ul>
            </section>

            <section className="conversation-history" aria-labelledby="history-title">
              <h2 id="history-title">Cronologia</h2>
              <article className="history-message">
                <span className="history-avatar">
                  <Icon name="pencil" />
                </span>
                <div>
                  <strong>Rosa</strong>
                  <p>{noticeText}</p>
                </div>
              </article>
              <article className="history-message">
                <span className="history-avatar">
                  <Icon name="spark" />
                </span>
                <div>
                  <strong>Assistente</strong>
                  <p>Importo 86,40 euro; scadenza 30 novembre 2026.</p>
                </div>
              </article>
              {martaSuggestion && (
                <article className="history-message">
                  <span className="history-avatar">
                    <Icon name="eye" />
                  </span>
                  <div>
                    <strong>Marta</strong>
                    <p>{martaSuggestion}</p>
                  </div>
                </article>
              )}
              {shareScope === "history" &&
                conversations.map((conversation) => (
                  <article className="history-message" key={conversation.id}>
                    <span className="history-avatar">
                      <Icon name="pencil" />
                    </span>
                    <div>
                      <strong>Rosa</strong>
                      <p>
                        {conversation.title}: {conversation.text}
                      </p>
                    </div>
                  </article>
                ))}
            </section>

            {martaSuggestion && (
              <section className="suggestion-card" aria-labelledby="suggestion-title">
                <h2 id="suggestion-title">Marta suggerisce:</h2>
                <p>{martaSuggestion}</p>
                <div>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setRosaNote(martaSuggestion);
                      setMartaSuggestion("");
                    }}
                  >
                    Usa
                  </button>
                  <button className="outline-button" onClick={() => setMartaSuggestion("")}>
                    Non ora
                  </button>
                </div>
              </section>
            )}

            <label className="custom-text-field rosa-note">
              <span>Nota di Rosa</span>
              <textarea
                rows={3}
                value={rosaNote}
                onChange={(event) => setRosaNote(event.target.value)}
                placeholder="Scrivi una nota per questa conversazione"
              />
            </label>

            <div className="share-confirm-actions">
              <button
                className="outline-button"
                disabled={!sharingActive}
                onClick={() => goToScreen("marta-view")}
              >
                <Icon name="eye" />
                <span>Passa alla vista di Marta (simulata)</span>
              </button>
              <button
                className="outline-button stop-sharing-button"
                disabled={!sharingActive}
                onClick={() => setStopSharingConfirm(true)}
              >
                Smetti di condividere
              </button>
              <button className="primary-button" onClick={saveNoticeConversation}>
                <Icon name="notebook" />
                <span>Concludi e salva nel Taccuino</span>
              </button>
            </div>

            {stopSharingConfirm && sharingActive && (
              <section className="stop-sharing-confirm" aria-labelledby="stop-sharing-title">
                <h2 id="stop-sharing-title">Vuoi smettere di condividere?</h2>
                <p>Marta non potrà più aprire questa conversazione.</p>
                <div>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setSharingActive(false);
                      setStopSharingConfirm(false);
                    }}
                  >
                    Conferma
                  </button>
                  <button className="outline-button" onClick={() => setStopSharingConfirm(false)}>
                    Annulla
                  </button>
                </div>
              </section>
            )}
          </main>
        )}

        {screen === "marta-view" && (
          <main id="main" className="main-content share-screen marta-view">
            <p className="step-label">Vista simulata · sola lettura</p>
            <h1 className="screen-title" tabIndex={-1}>
              Vista di Marta
            </h1>
            <p className="notice-intro">
              Marta può leggere la cronologia e inviare un suggerimento. Non può controllare il
              tablet di Rosa.
            </p>
            <section className="conversation-history" aria-labelledby="marta-history-title">
              <h2 id="marta-history-title">Cronologia condivisa</h2>
              <article className="history-message">
                <span className="history-avatar">
                  <Icon name="pencil" />
                </span>
                <div>
                  <strong>Rosa</strong>
                  <p>{noticeText}</p>
                </div>
              </article>
              <article className="history-message">
                <span className="history-avatar">
                  <Icon name="spark" />
                </span>
                <div>
                  <strong>Assistente</strong>
                  <p>Importo 86,40 euro; scadenza 30 novembre 2026.</p>
                </div>
              </article>
              {shareScope === "history" &&
                conversations.map((conversation) => (
                  <article className="history-message" key={conversation.id}>
                    <span className="history-avatar">
                      <Icon name="pencil" />
                    </span>
                    <div>
                      <strong>Rosa</strong>
                      <p>
                        {conversation.title}: {conversation.text}
                      </p>
                    </div>
                  </article>
                ))}
            </section>
            <label className="custom-text-field">
              <span>Suggerimento di Marta</span>
              <textarea
                rows={4}
                value={martaDraft}
                onChange={(event) => setMartaDraft(event.target.value)}
                placeholder="Scrivi un suggerimento per Rosa"
              />
            </label>
            <div className="share-navigation">
              <button className="outline-button" onClick={() => goToScreen("share-confirm")}>
                ← Torna alla vista di Rosa
              </button>
              <button
                className="primary-button"
                disabled={!martaDraft.trim()}
                onClick={() => {
                  setMartaSuggestion(martaDraft.trim());
                  setMartaDraft("");
                  goToScreen("share-confirm");
                }}
              >
                Invia suggerimento
              </button>
            </div>
          </main>
        )}

        {screen === "voice-info" && (
          <main id="main" className="main-content voice-info-screen">
            <div className="voice-info-navigation">
              <button className="outline-button" onClick={() => goToScreen("home")}>
                <span aria-hidden="true">←</span>
                <span>Torna alla Home</span>
              </button>
              <button
                className="outline-button"
                onClick={() => {
                  memoryFocusRequestedRef.current = true;
                  goToScreen("notebook");
                }}
              >
                <Icon name="notebook" />
                <span>Cosa ricordo</span>
              </button>
            </div>

            <p className="step-label">Cercare un’informazione</p>
            <h1 className="screen-title" tabIndex={-1}>
              Cosa vuoi sapere?
            </h1>

            {infoVoiceState === "idle" && (
              <button
                className="primary-button voice-main-action"
                onClick={() => setInfoVoiceState("listening")}
              >
                <Icon name="microphone" />
                <span>Parla</span>
              </button>
            )}

            {infoVoiceState === "listening" && (
              <div className="voice-capture" role="status">
                <h2>Ti ascolto…</h2>
                <div className="sound-level" aria-label="Livello sonoro medio">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <button className="outline-button" onClick={() => setInfoVoiceState("review")}>
                  Fine
                </button>
              </div>
            )}

            {infoVoiceState === "review" && (
              <div className="voice-review">
                <h2>Ho capito:</h2>
                <p className="heard-phrase">
                  Quando apre al sabato l’ambulatorio del dottor{" "}
                  {wordCorrected ? (
                    <strong className="corrected-word">{doctorWord}</strong>
                  ) : (
                    <button
                      className="uncertain-word"
                      aria-label="Parola incerta: tocca per correggere"
                      onClick={() => setWordCorrectionOpen(true)}
                    >
                      <span aria-hidden="true">?</span>
                      Nero
                    </button>
                  )}
                  ?
                </p>

                {wordCorrectionOpen && (
                  <section className="word-correction" aria-labelledby="correction-title">
                    <h2 id="correction-title">Scegli la parola corretta</h2>
                    <div className="correction-options">
                      {["Neri", "Nero"].map((word) => (
                        <button
                          className="outline-button"
                          key={word}
                          onClick={() => correctDoctorName(word)}
                        >
                          {word}
                        </button>
                      ))}
                      <button className="outline-button" onClick={() => setOtherWordOpen(true)}>
                        Altra parola
                      </button>
                    </div>
                    {otherWordOpen && (
                      <label className="inline-answer-field">
                        <span>Scrivi la parola</span>
                        <input
                          type="text"
                          value={otherWord}
                          onChange={(event) => setOtherWord(event.target.value)}
                        />
                        <button
                          className="outline-button"
                          disabled={!otherWord.trim()}
                          onClick={() => correctDoctorName(otherWord.trim())}
                        >
                          Usa questa parola
                        </button>
                      </label>
                    )}
                  </section>
                )}

                <div className="voice-review-actions">
                  <button className="primary-button" onClick={() => setInfoVoiceState("response")}>
                    Va bene
                  </button>
                  <button className="outline-button" onClick={() => setInfoVoiceState("listening")}>
                    Dillo di nuovo
                  </button>
                  <button className="outline-button" onClick={() => setWordCorrectionOpen(true)}>
                    Correggi
                  </button>
                  <button className="outline-button" onClick={listenToPhrase}>
                    <Icon name="volume" />
                    <span>Ascolta</span>
                  </button>
                </div>
                {voiceNotice && (
                  <p className="voice-notice" role="status">
                    {voiceNotice}
                  </p>
                )}
              </div>
            )}

            {(infoVoiceState === "response" || infoVoiceState === "response-listening") && (
              <div className="information-response">
                <h2>Risposta</h2>
                <p>
                  Di solito apre il sabato mattina. Queste informazioni sono spesso sbagliate:
                  controlla con l’ambulatorio.
                </p>
                <label className="inline-answer-field">
                  <span>La tua risposta</span>
                  <input
                    ref={infoReplyRef}
                    type="text"
                    value={infoReply}
                    onChange={(event) => setInfoReply(event.target.value)}
                    placeholder="Scrivi o detta la tua risposta"
                  />
                </label>
                {infoVoiceState === "response" ? (
                  <div className="response-actions">
                    <button
                      className="outline-button"
                      disabled={!infoReply.trim()}
                      onClick={() => submitInformationReply(infoReply)}
                    >
                      Invia
                    </button>
                    <button
                      className="outline-button"
                      onClick={() => {
                        setVoiceNotice("");
                        setInfoVoiceState("response-listening");
                      }}
                    >
                      <Icon name="microphone" />
                      <span>Parla</span>
                    </button>
                  </div>
                ) : (
                  <div className="voice-state" role="status">
                    <strong>Ti ascolto…</strong>
                    <div className="sound-level" aria-label="Livello sonoro medio">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <button
                      className="outline-button"
                      onClick={() => {
                        setInfoVoiceState("response");
                        setVoiceNotice("Il microfono è simulato: scrivi la risposta nel campo");
                        infoReplyRef.current?.focus();
                      }}
                    >
                      Fine
                    </button>
                  </div>
                )}
                {voiceNotice && (
                  <p className="voice-notice" role="status">
                    {voiceNotice}
                  </p>
                )}
              </div>
            )}

            {infoVoiceState === "closed" && (
              <div className="conversation-closed" role="status">
                <h2>Prego, chiudo qui</h2>
                <p>Conversazione chiusa. La trovi nel Taccuino, {formattedToday()}.</p>
                <button
                  className="outline-button"
                  onClick={() => {
                    setInfoReply("");
                    setVoiceNotice("Conversazione riaperta.");
                    setInfoVoiceState("response");
                  }}
                >
                  Riapri la conversazione
                </button>
              </div>
            )}
          </main>
        )}

        {screen === "forget" && (
          <main id="main" className="main-content forget-screen">
            {forgetCandidate ? (
              <>
                <h1 className="screen-title" tabIndex={-1}>
                  Vuoi che dimentichi questa informazione?
                </h1>
                <p className="forget-item">{forgetCandidate.text}</p>
                <div className="forget-actions">
                  <button className="primary-button" onClick={confirmForget}>
                    Dimentica
                  </button>
                  <button className="outline-button" onClick={() => goToScreen("notebook")}>
                    No, la tengo
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="screen-title" tabIndex={-1}>
                  Informazione dimenticata
                </h1>
                <p>La voce non compare più in “Cosa ricordo”.</p>
                <div className="forget-actions">
                  {forgotItem && (
                    <button className="outline-button" onClick={undoForget}>
                      Ripristina la voce
                    </button>
                  )}
                  <button className="outline-button" onClick={() => goToScreen("notebook")}>
                    Torna al Taccuino
                  </button>
                </div>
              </>
            )}
          </main>
        )}

        {screen === "notebook" && (
          <main id="main" className="main-content notebook-placeholder">
            <nav className="notebook-navigation" aria-label="Navigazione Taccuino">
              <button className="outline-button" onClick={() => goToScreen("home")}>
                <span aria-hidden="true">←</span>
                <span>Torna alla Home</span>
              </button>
            </nav>
            <span className="notebook-hero-icon" aria-hidden="true">
              <Icon name="notebook" size={40} />
            </span>
            <p className="eyebrow">Taccuino</p>
            <h1 tabIndex={-1}>Il mio Taccuino</h1>
            <p>
              Qui trovi bozze, conversazioni concluse e informazioni ricordate, divise in sezioni.
              Nulla viene inviato automaticamente.
            </p>
            <section className="memory-section" aria-labelledby="memory-section-title">
              <h2 id="memory-section-title" tabIndex={-1}>
                Cosa ricordo
              </h2>
              <h3>Quello che so</h3>
              {memoryItems.length > 0 ? (
                <div className="memory-list">
                  {memoryItems.map((item) => (
                    <div className="memory-item" key={item.id}>
                      <span>{item.text}</span>
                      <button
                        className="outline-button"
                        onClick={() => {
                          setForgotItem(null);
                          setForgetCandidate(item);
                          goToScreen("forget");
                        }}
                      >
                        Dimentica
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Non ci sono informazioni memorizzate.</p>
              )}
            </section>

            {conversations.length > 0 && (
              <section className="notebook-conversations" aria-labelledby="conversation-title">
                <h2 id="conversation-title">Conversazioni</h2>
                {conversations.map((conversation) => (
                  <article className="notebook-draft-card" key={conversation.id}>
                    <h3>{conversation.title}</h3>
                    <p className="notebook-draft-date">{conversation.date}</p>
                    <p className="notebook-item-status">Conversazione conclusa</p>
                    <p>{conversation.text}</p>
                  </article>
                ))}
              </section>
            )}

            {savedDrafts.length > 0 && (
              <section className="notebook-drafts" aria-label="Bozze salvate">
                <h2>Bozze salvate</h2>
                {savedDrafts.map((draft) => (
                  <article className="notebook-draft-card" key={draft.id}>
                    <h3>{draft.title}</h3>
                    <p className="notebook-draft-date">{draft.date}</p>
                    <p className="notebook-item-status">Bozza salvata</p>
                    <p>{draft.text}</p>
                  </article>
                ))}
              </section>
            )}
            {conversations.length === 0 && savedDrafts.length === 0 && (
              <p className="notebook-empty">
                Non ci sono ancora attività salvate. Torna alla Home per iniziarne una.
              </p>
            )}
          </main>
        )}
      </div>

      {observerOpen && (
        <aside className="observer-panel" aria-label="Strumenti osservatore">
          <strong>Strumenti osservatore</strong>
          <span>{observerEventCount} eventi registrati</span>
          <button className="outline-button" onClick={() => addObserverEvent("Inizio task")}>
            Inizio task
          </button>
          <button className="outline-button" onClick={() => addObserverEvent("Fine task")}>
            Fine task
          </button>
          <button className="outline-button" onClick={exportEventLog}>
            Esporta registro
          </button>
          <button className="outline-button" onClick={resetObservationSession}>
            Cambia partecipante
          </button>
          <button className="outline-button" onClick={() => setObserverOpen(false)}>
            Chiudi pannello
          </button>
        </aside>
      )}

      {settingsOpen && (
        <div className="settings-layer">
          <button
            className="settings-backdrop"
            aria-label="Chiudi le impostazioni"
            onClick={closeSettings}
          />
          <aside
            ref={settingsPanelRef}
            id="settings-panel"
            className="support-panel"
            aria-label="Aiuto e accessibilità"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="panel-heading">
              <span className="panel-icon">
                <Icon name="settings" />
              </span>
              <div>
                <p>Le tue preferenze</p>
                <h2>Testo e contrasto</h2>
              </div>
              <button className="close-settings" onClick={closeSettings}>
                Chiudi
              </button>
            </div>

            <div className="setting-group">
              <div className="setting-title">
                <span id="text-size-title">Dimensione del testo</span>
                <strong>{textScale}%</strong>
              </div>
              <div className="segmented-control" role="group" aria-labelledby="text-size-title">
                {[100, 150, 200].map((size) => (
                  <button
                    key={size}
                    aria-pressed={textScale === size}
                    className={textScale === size ? "selected" : ""}
                    onClick={() => setTextScale(size)}
                  >
                    <span aria-hidden="true" style={{ fontSize: `${0.8 + size / 500}em` }}>
                      A
                    </span>
                    <span className="sr-only">Testo al </span>
                    {size}%
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <span id="contrast-title" className="setting-label">
                Contrasto
              </span>
              <div className="theme-buttons" role="group" aria-labelledby="contrast-title">
                <button
                  className={theme === "light" ? "selected" : ""}
                  aria-pressed={theme === "light"}
                  onClick={() => setTheme("light")}
                >
                  <span className="theme-swatch light-swatch" aria-hidden="true" />
                  Chiaro
                </button>
                <button
                  className={theme === "dark" ? "selected" : ""}
                  aria-pressed={theme === "dark"}
                  onClick={() => setTheme("dark")}
                >
                  <span className="theme-swatch dark-swatch" aria-hidden="true" />
                  Scuro
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="toast" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}

export default App;
