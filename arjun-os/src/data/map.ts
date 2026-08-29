import type { Headline } from "./types";

export const CORE =
  "Default name in Indian mid-market manufacturing for 3D configurators and digital twins that actually ship.";

export const headlines: Headline[] = [
  {
    id: "philosophy",
    title: "Philosophy",
    kicker: "Interior · live",
    briefing:
      "The neglected organ. Psychology, people, and depth texts. Religion is parked this cycle — Gita still lives here as argument and duty, not as devotion. One question every grab must survive: what kind of mind does the Core Engineer need?",
    status: "live",
    parts: [
      {
        id: "psychology",
        title: "Psychology",
        briefing:
          "Two tracks, both live. Path 1 names the moves that hinder you and cuts them. Path 2 maps other minds so you stop guessing in rooms. Current read sits on both: Adler via The Courage to Be Disliked.",
        topics: [
          {
            id: "path-1",
            title: "Path 1 — biases that hinder me",
            briefing:
              "You already overplayed yourself as the case study. This track is not more diagnosis. It is names for moves you already make — rumination as reward, peak vows / trough collapse, sunk cost on a burned shrine, her-centric framing — then cutting the move. Kahneman is the working manual. Adler (Courage to Be Disliked) is the live blade: you are not determined by the past; you choose the goal of the feeling.",
            research: [
              "Adlerian teleology vs Freudian etiology — what goal is the symptom serving?",
              "Kahneman System 1/2 — which of your leaks is fast thinking dressed as fate?",
              "Sunk-cost fallacy applied to no-contact and deleted Instagram",
              "Peak-end rule — why midnight Kai and 7am you are not the same voter",
              "Rumination as intermittent reinforcement (the loop in the sovereignty protocol)",
            ],
            bookIds: [
              "courage-disliked",
              "courage-happy",
              "thinking-fast-slow",
              "noise",
              "make-it-stick",
              "thinking-in-bets",
            ],
            goals: [
              {
                id: "p1-names",
                title: "Name the move, not the mood",
                description:
                  "When the gap hits, write the bias in one line (sunk cost, availability, her-as-scoreboard). No essay. Then cut the move.",
                live: true,
              },
              {
                id: "p1-adler",
                title: "Finish The Courage to Be Disliked",
                description:
                  "Current read. After each dialogue: one sentence of what you will stop using the past as an excuse for. Bring it here if you want depth.",
                live: true,
              },
              {
                id: "p1-kahneman",
                title: "Mine Kahneman as a manual",
                description:
                  "Not literature. Extract names that match your actual nights. Card them in SRS only if you used them that week.",
                live: true,
              },
            ],
          },
          {
            id: "path-2",
            title: "Path 2 — map of other people",
            briefing:
              "The starved track. You bottled for years, then overflowed into whoever was near. This is not a trick bag. It is a map: status, face-saving, attach, freeze, hierarchy in an Indian office. Models of how humans actually work so job, family, sport, and rooms stop being guesswork.",
            research: [
              "Face-saving in hierarchical cultures — correct privately, decide publicly",
              "Status as a relative game — why extra warmth reads as equality",
              "Attachment styles as description, not identity",
              "What people do when they feel inferior (Adler) vs when they protect face",
              "How to read a room without using colleagues as a valve",
            ],
            bookIds: [
              "courage-disliked",
              "righteous-mind",
              "laws-human-nature",
              "games-people-play",
              "never-split",
              "difficult-conversations",
            ],
            goals: [
              {
                id: "p2-week",
                title: "One people-note per week",
                description:
                  "One room, one person, one move you saw (status, freeze, face). No tricks to run on them. Map only.",
                live: true,
              },
              {
                id: "p2-office",
                title: "Scarce speech as data",
                description:
                  "Count extra sentences said to be liked. That number is the leak showing up inside the pursuit — not a separate rehab.",
                live: true,
              },
            ],
          },
        ],
      },
      {
        id: "people",
        title: "People",
        briefing:
          "Applied Path 2. Small circle, mostly silent, then dump. This spoke is how humans work in the wild — family pressure, office hierarchy, sport, clients — without turning your mouth into a valve.",
        topics: [
          {
            id: "rooms",
            title: "Rooms and hierarchy",
            briefing:
              "Indian corporate: titles, indirect no, face. Chimera lives here as consequence plus competence, not cruelty theater. People take you lightly when sentences are cheap. Expensive word, different room.",
            research: [
              "Indirect refusal phrases and how to confirm in writing",
              "Power map: formal authority vs informal influencer vs silent blocker",
              "Why public confrontation costs you more than them",
            ],
            bookIds: [
              "arthashastra",
              "staff-engineer",
              "elegant-puzzle",
              "never-split",
              "48-laws",
            ],
            goals: [
              {
                id: "rooms-write",
                title: "Decisions in writing",
                description:
                  "Every non-trivial call you own: owner, date, decision. If it is not written, you did not decide.",
                live: true,
              },
            ],
          },
          {
            id: "family",
            title: "Family without their timeline",
            briefing:
              "You provide. You paid sister’s fees. Parents push marriage. Love them; do not hand them the wheel before independence. One direct conversation, topic closed until the date you already named.",
            research: [
              "Enmeshment vs duty — Adler’s separation of tasks",
              "How to hold provision without absorbing panic",
            ],
            bookIds: ["courage-disliked", "gita-easwaran", "mans-search"],
            goals: [
              {
                id: "fam-tasks",
                title: "Separation of tasks",
                description:
                  "Their fear is their task. Your build is yours. Re-read Adler’s separation of tasks when the crying starts.",
              },
            ],
          },
        ],
      },
      {
        id: "texts",
        title: "Depth texts",
        briefing:
          "Live objects: Gita + Nietzsche as the depth pair (duty after the fairy tale vs becoming with no comfort-lie). Kahneman is the bias manual, not a third soul-book. You will feel the fight between Gita and Nietzsche. That fight is the point.",
        topics: [
          {
            id: "gita",
            title: "Gita — duty after the fairy tale",
            briefing:
              "You already had Arjuna in the stack. This is not a new god. It is argument: action without the fruit as identity, the field as what is given, the bow as the work. Study it as a text. Religion as devotion is parked; this is philosophy.",
            research: [
              "Karma yoga vs using outcomes (her, titles, revenge) as the scoreboard",
              "Arjuna’s freeze on the field — compare to your idle gap",
              "What ‘not being attached to fruit’ is not (laziness, cruelty)",
              "Easwaran vs Gandhi vs a tight academic translation — pick one and stay",
            ],
            bookIds: ["gita-easwaran", "gita-gandhi", "gita-thompson", "meditations"],
            goals: [
              {
                id: "gita-spine",
                title: "Teach the spine",
                description:
                  "One chapter at a time until you can teach the argument without quotes. Bring the chapter here.",
                live: true,
              },
            ],
          },
          {
            id: "nietzsche",
            title: "Nietzsche — becoming, no comfort-lie",
            briefing:
              "Dangerous fit for Kai. Power, becoming, the death of the fairy tale. Do not use him as permission to lock the door on the heart. Use him to stop begging the world to be kind. Start Beyond Good and Evil or Genealogy — not a quote page.",
            research: [
              "Master/slave morality vs your ‘they took me lightly’ story",
              "Amor fati vs rumination",
              "Why Zarathustra is the wrong first book",
              "Nietzsche vs Gita on action — map the fight in writing",
            ],
            bookIds: [
              "bge",
              "genealogy",
              "zarathustra",
              "nietzsche-portable",
            ],
            goals: [
              {
                id: "nietz-one",
                title: "One book, spine first",
                description:
                  "Beyond Good and Evil or On the Genealogy of Morals. After each essay: one claim in your words, one danger if Kai misreads it.",
                live: true,
              },
            ],
          },
          {
            id: "kahneman",
            title: "Kahneman — names for judgment",
            briefing:
              "Working-depth, not soul. Fast and Slow is the mine. Extract biases that match your nights and office calls. Card only what you used. Do not finish it as literature before Gita/Nietzsche have a spine.",
            research: [
              "WYSIATI — what you see when idle is not all there is",
              "Planning fallacy on 90-day bibles",
              "Overconfidence in peak-Kai vows",
            ],
            bookIds: ["thinking-fast-slow", "noise", "thinking-in-bets"],
            goals: [
              {
                id: "kahn-mine",
                title: "Mine, don’t tour",
                description:
                  "Three named biases that are actually yours, written in your examples. That is a pass for the month.",
                live: true,
              },
            ],
          },
        ],
      },
      {
        id: "religion",
        title: "Religion",
        briefing:
          "Parked this cycle. Rational study, not ‘just believe.’ When this spoke opens: one lineage deep, not comparative tourism. Gita currently runs under Depth texts.",
        topics: [
          {
            id: "parked",
            title: "Parked — do not open a tour",
            briefing:
              "You chose skip. Upanishads, early Buddhist texts, and devotion stay in the library. Opening them now is another well without a rope. Revisit when Gita has a spine.",
            research: [
              "When to reopen: Gita spine can be taught, then one Upanishad or Rahula — not both",
            ],
            bookIds: ["upanishads", "what-buddha-taught", "zen-mind"],
            goals: [
              {
                id: "rel-hold",
                title: "Hold the park",
                description:
                  "Do not start a religion survey to fill the gap. If the hunger is meaning, go to Gita under Depth texts.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "hobby",
    title: "Hobby",
    kicker: "Make · live",
    briefing:
      "Writing and music. Not a third career. Writing leaves a trace of thought. Music is the mouth shut. Four live objects: guitar to performance, listening log, new poems, old poems as craft — not shrine archaeology. No second instrument until guitar has depth.",
    status: "live",
    parts: [
      {
        id: "writing",
        title: "Writing",
        briefing:
          "You already write a lot. Most of it has been the wound. Untouched writing is craft. New work in a repo, evaluated. Old work can be critiqued as language — not as a way back to her.",
        topics: [
          {
            id: "poetry-new",
            title: "New poems and rhymes",
            briefing:
              "Make. Put it in the well-repo. Evaluate here: line, sound, honesty, whether it is Kai-costume or actual speech. Depth over volume in the session; volume across the weeks is the pressure.",
            research: [
              "Meter vs free verse — what your ear already does",
              "Image vs explanation (you over-explain in talk; do not on the page)",
              "Rilke’s advice: go into yourself, not into the audience",
            ],
            bookIds: ["rilke", "bird-by-bird", "war-of-art", "on-writing"],
            goals: [
              {
                id: "new-piece",
                title: "New piece in the repo",
                description:
                  "A poem or rhyme that is not a letter to her and not a pep talk. Bring it for evaluation.",
                live: true,
              },
            ],
          },
          {
            id: "poetry-old",
            title: "Old work — craft only",
            briefing:
              "The shrine was burned. If you open old poems, you open them as craft: what the line is doing, where it fails, what to steal for new work. If it becomes her, close the file.",
            research: [
              "How to edit the former self without resurrecting the story",
              "What to keep: music of the line. What to drop: the goddess pedestal.",
            ],
            bookIds: ["rilke", "sense-of-style", "on-writing"],
            goals: [
              {
                id: "old-critique",
                title: "One old piece, craft notes",
                description:
                  "Bring one. We mark craft. We do not reopen the contact list.",
                live: true,
              },
            ],
          },
        ],
      },
      {
        id: "music",
        title: "Music",
        briefing:
          "Guitar: one song to performance standard. Listening log: what you hear and what you think — brought here. Music is not language. Do not let writing eat this spoke.",
        topics: [
          {
            id: "guitar",
            title: "Guitar — one song to performance",
            briefing:
              "Your own law: depth over breadth. Not a second instrument. One piece you can play clean, slow, then up to tempo, then with eyes off the fretboard. That is a pass.",
            research: [
              "Chunking a piece: sections, trouble bars, slow metronome",
              "Tension in the left hand — drop it between phrases",
              "What ‘performance standard’ means: someone could listen without wincing",
            ],
            bookIds: ["inner-game-music", "effortless-mastery", "this-is-your-brain"],
            goals: [
              {
                id: "song-name",
                title: "Name the song",
                description:
                  "One title. Practice log: date, bars, tempo. No new song until this one is performable.",
                live: true,
              },
            ],
          },
          {
            id: "listening",
            title: "Listening log",
            briefing:
              "Music you heard and what you think. Not a dump of Spotify screenshots. A note: what the piece is doing, why it landed, what you would steal for guitar or for a poem.",
            research: [
              "Active listening: form, motif, space, lyric if any",
              "How to write about sound without faking theory",
            ],
            bookIds: ["how-music-works", "this-is-your-brain"],
            goals: [
              {
                id: "listen-bring",
                title: "Bring a listen",
                description:
                  "One piece, a short note, then we go into it. That is the log.",
                live: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "metacognition",
    title: "Metacognition",
    kicker: "The well",
    briefing:
      "Not easily tracked, a lot to grab. Polymath is range with a rope: Core Engineer. Genius is quality of the grab, not a title. Tools (SRS, palace, chess) are pipes. They only run on live material. All tracks on — with a plan, not twelve empty starts.",
    status: "live",
    parts: [
      {
        id: "polymath",
        title: "Polymath",
        briefing:
          "Learn what makes sense, then match it to the work. Parallel pressure. Each object must be able to touch the job, the factory, the body, or the well’s own drill.",
        topics: [
          {
            id: "chess",
            title: "Chess",
            briefing:
              "You already play. This is the existing drill: pattern, sitting in a hard position, composure. Transfer to sport is narrow (attention, not footwork). Keep it as rated games plus weakness drills — not a new identity.",
            research: [
              "Your actual weakness file — openings vs endgames vs tactics",
              "How to review a lost game without a story about the self",
            ],
            bookIds: [
              "silman-amateurs",
              "logical-chess",
              "how-to-reassess",
              "woodpecker",
            ],
            goals: [
              {
                id: "chess-week",
                title: "Rated + review",
                description:
                  "Games with a clock. One weakness drilled. Log the pattern, not the mood.",
                live: true,
              },
            ],
          },
          {
            id: "srs",
            title: "Spaced repetition",
            briefing:
              "A pipe. Cards only from what you touched this week: Gita lines, Nietzsche claims, Kahneman names, graphics facts. If it did not come from a live object, it does not get a card.",
            research: [
              "Make It Stick — retrieval over re-reading",
              "Minimum information principle (one fact per card)",
            ],
            bookIds: ["make-it-stick", "a-mind-for-numbers", "ultralearning"],
            goals: [
              {
                id: "srs-rule",
                title: "Cards from live objects only",
                description:
                  "Empty deck days are allowed. Fake decks are not.",
                live: true,
              },
            ],
          },
          {
            id: "palace",
            title: "Memory palace",
            briefing:
              "Optional equipment, used on real material — not a course about palaces. Same rule as SRS: the content is Gita, systems, graphics, people-models.",
            research: [
              "Loci method on a room you actually walk",
              "Moonwalking with Einstein as history of the trick, not a lifestyle",
            ],
            bookIds: ["moonwalking", "make-it-stick"],
            goals: [
              {
                id: "palace-one",
                title: "One palace, live material",
                description:
                  "One familiar place. Encode this week’s actual notes. If you skip it, chess and SRS still count.",
                live: true,
              },
            ],
          },
          {
            id: "graphics",
            title: "Graphics / systems math",
            briefing:
              "Feeds Three.js and WebGL. Linear algebra, transforms, lighting, performance. This is polymath with the rope: the grab shows up in the configurator.",
            research: [
              "Column-major matrices in WebGL vs what you sketch on paper",
              "PBR at a level you can explain to a mid-market client",
              "When to drop to raw GL vs stay in Three.js",
            ],
            bookIds: [
              "3d-math-primer",
              "real-time-rendering",
              "webgl-guide",
              "nature-of-code",
            ],
            goals: [
              {
                id: "gfx-problem",
                title: "One hard problem you can teach",
                description:
                  "Weekly. Materials, perf, CAD pipeline, or state sync. Teach-back is the pass.",
                live: true,
              },
            ],
          },
          {
            id: "manufacturing",
            title: "Manufacturing / CAD / factory",
            briefing:
              "The domain of the north star. How a second factory would actually use a template. Toyota, constraints, the goal of flow — matched to configurators, not to a new MBA.",
            research: [
              "What a mid-market Indian plant will not change for your software",
              "BOM, variants, and why configurators die in edge cases",
              "The Goal — constraint as a thinking tool for product",
            ],
            bookIds: ["the-goal", "toyota-way", "thinking-in-systems", "this-is-lean"],
            goals: [
              {
                id: "mfg-note",
                title: "Match a factory fact to the product",
                description:
                  "One constraint from the real world written into how the template should behave.",
                live: true,
              },
            ],
          },
          {
            id: "attention",
            title: "Attention / the gap",
            briefing:
              "Light overlap with Kahneman. How the mind fails when idle. Not a second degree. Notes only — Deep Work as a reminder that the morning technical block is the pursuit, not a vibe.",
            research: [
              "Default mode network and rumination",
              "Why flow (code, badminton, cardio) starves the loop — you already proved this",
            ],
            bookIds: ["deep-work", "stolen-focus", "thinking-fast-slow"],
            goals: [
              {
                id: "att-block",
                title: "Morning technical block first",
                description:
                  "Before communication. That is the attention drill that counts.",
                live: true,
              },
            ],
          },
        ],
      },
      {
        id: "genius",
        title: "Genius",
        briefing:
          "Untrackable on purpose. Quality of the question, not IQ points. You do not log genius. You protect a window where the grab can be strange — then you ask whether it made the engineer more dangerous.",
        topics: [
          {
            id: "quality",
            title: "Quality of the grab",
            briefing:
              "Wander across years. Do not wander across twenty things in one night. Depth in the session. Range across the decade. If you cannot teach it or play it, it was browsing.",
            research: [
              "Feynman’s ‘what I cannot create I do not understand’ as a filter",
              "Polymath as side-effect of depth, not a parallel target",
            ],
            bookIds: ["ultralearning", "pragmatic-programmer", "philosophy-software"],
            goals: [
              {
                id: "genius-teach",
                title: "Teach or play",
                description:
                  "A grab that cannot be taught back or played is fog. No metric. The filter is enough.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "physical",
    title: "Physical",
    kicker: "Covered · later",
    briefing:
      "Support for the engine, not a second identity. Sport sits beside Fitness — not under it. Fitness splits into diet, recovery/sleep, gym. You said this is covered and we discuss later. The map is here so the OS is complete. Do not turn this page into a new bible tonight.",
    status: "covered",
    parts: [
      {
        id: "sport",
        title: "Sport",
        briefing:
          "Sibling of Fitness. Badminton like hunting. Composure, burst, repeat. This is not accessory cardio for Instagram. It is a field where the gap cannot speak.",
        topics: [
          {
            id: "badminton",
            title: "Badminton",
            briefing:
              "You already know: on court the loop is dead. Keep it as sport, not as punishment for gluttony. Footwork, smash, recovery between points — athletic, not aesthetic.",
            research: [
              "Interval structure of a match vs gym HIIT",
              "Sleep the night before a hard session",
            ],
            bookIds: ["endure", "sports-gene", "why-we-sleep"],
            goals: [
              {
                id: "sport-play",
                title: "Play, don’t negotiate",
                description:
                  "Sessions on the calendar you already run. We do not redesign this tonight.",
              },
            ],
          },
        ],
      },
      {
        id: "fitness",
        title: "Fitness",
        briefing:
          "Diet, recovery/sleep, gym. Greek God protocol already exists in the plans repo. Open that when you schedule the discussion. Here: pointers only.",
        topics: [
          {
            id: "diet",
            title: "Diet",
            briefing:
              "Vegetarian, high protein, deficit for recomp. Gluttony is the gap with a fork — not a separate moral failure. When we discuss Physical, we talk feast/famine from the ₹11 years.",
            research: [
              "Vegetarian protein at your current bodyweight",
              "Hunger vs the gap — name which one it is",
            ],
            bookIds: ["bigger-leaner", "why-we-sleep"],
            goals: [
              {
                id: "diet-hold",
                title: "Run the existing protocol",
                description:
                  "Do not invent a new diet in Arjun OS. Follow what you already wrote until the Physical session.",
              },
            ],
          },
          {
            id: "recovery",
            title: "Recovery / sleep",
            briefing:
              "You report ~6 hours. You have cut sleep to orbit someone. That era is closed. Recovery is the brick under deep-work hours.",
            research: [
              "Caffeine cutoff",
              "Phone after 9:30 — already in sovereignty protocol",
            ],
            bookIds: ["why-we-sleep", "endure"],
            goals: [
              {
                id: "sleep-floor",
                title: "Sleep as a floor",
                description:
                  "Not heroic all-nighters for Kai theatre. Hours that let tomorrow’s block exist.",
              },
            ],
          },
          {
            id: "gym",
            title: "Gym",
            briefing:
              "Progressive overload, the forge. Body as evidence, not as a scoreboard for her. Instagram at 12% was a rule you wrote — still not the reason you lift.",
            research: [
              "Your current split in the Greek God file",
              "PRs vs scale weight during recomp",
            ],
            bookIds: ["starting-strength", "hypertrophy"],
            goals: [
              {
                id: "gym-show",
                title: "Show up",
                description:
                  "The protocol is already written. Arjun OS does not replace it.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "career",
    title: "Career",
    kicker: "Pursuit · later",
    briefing:
      "Job, building, business — the pursuit in three modes. North star: default name for configurators and digital twins that ship. We do not dig a new career bible here. Structure is loaded so the OS is whole.",
    status: "covered",
    parts: [
      {
        id: "job",
        title: "Job",
        briefing:
          "Tech lead. Written decisions. Scarce speech. Chimera as weather change, not Monday villain. Protect upward. Cold politeness in an Indian hierarchy.",
        topics: [
          {
            id: "lead",
            title: "Lead without peer energy",
            briefing:
              "Withdraw cheap warmth. Directives as statements. Office hours. Document. This is the pursuit at work — people taking you lightly is how you show up while pursuing, not a side quest.",
            research: [
              "Banned phrases in Chimera — replace, do not announce the change",
              "Correct privately, decide publicly",
            ],
            bookIds: ["staff-engineer", "elegant-puzzle", "arthashastra", "48-laws"],
            goals: [
              {
                id: "job-write",
                title: "Written decisions weekly",
                description:
                  "Same as People → Rooms. Career and philosophy share this brick.",
              },
            ],
          },
        ],
      },
      {
        id: "building",
        title: "Building",
        briefing:
          "Three.js, WebGL, twins, portals. Time-Manager: ship v1 you use, or kill it. Open loops are not craft. Morning technical block. Three outputs. Deep work hours.",
        topics: [
          {
            id: "craft",
            title: "Craft and proof",
            briefing:
              "Shipped increment weekly. Hard problem you can teach. Public artifact monthly. Ugly allowed. Incomplete architecture is not shipped.",
            research: [
              "What ‘second factory could set up in 2–3 weeks’ actually requires",
              "DDIA chapters that match your BaaS / sync problems",
            ],
            bookIds: [
              "ddia",
              "philosophy-software",
              "pragmatic-programmer",
              "real-time-rendering",
            ],
            goals: [
              {
                id: "build-week",
                title: "Ship or teach",
                description:
                  "One merged/deployed/visible increment or one teachable problem. Plans do not count.",
              },
            ],
          },
        ],
      },
      {
        id: "business",
        title: "Business",
        briefing:
          "White-label template. Setup fee + SaaS retainer. Refuse unpaid rescue as the default. First retainer: a yes or a dated no — not ‘talking to people.’",
        topics: [
          {
            id: "leverage",
            title: "Productized, not hours",
            briefing:
              "Leverage is the difference between greatest-in-a-niche and busy full-stack. The Mom Test for conversations. Invoices, not hope.",
            research: [
              "Who already pays for configurators in Indian mid-market",
              "What setup vs retainer should include so you are not still selling hours",
            ],
            bookIds: ["mom-test", "inspired", "hard-thing", "zero-to-one"],
            goals: [
              {
                id: "biz-ask",
                title: "A dated yes or no",
                description:
                  "When Career gets its session: one conversation that ends in paper. Not this week’s homework unless you pull it forward.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function findHeadline(id: string) {
  return headlines.find((h) => h.id === id);
}

export function findPart(headlineId: string, partId: string) {
  const h = findHeadline(headlineId);
  return h?.parts.find((p) => p.id === partId);
}

export function findTopic(headlineId: string, partId: string, topicId: string) {
  const p = findPart(headlineId, partId);
  return p?.topics.find((t) => t.id === topicId);
}

export function allTopics() {
  return headlines.flatMap((h) =>
    h.parts.flatMap((p) =>
      p.topics.map((t) => ({ headline: h, part: p, topic: t })),
    ),
  );
}
