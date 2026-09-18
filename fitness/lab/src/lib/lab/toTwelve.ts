import type { LabArticle } from "./types";

/** First Lab article. Operating doctrine for the cut — not a new 90-day bible. */
export const TO_TWELVE: LabArticle = {
  slug: "to-12",
  title: "To 12%",
  kicker: "fuel doctrine",
  blurb: "What actually gets you there. How much junk is allowed. What crossing looks like. The rest is costume.",
  stamp: "16 Sep 2026",
  sections: [
    {
      id: "where",
      title: "Where this is written from",
      blocks: [
        {
          type: "p",
          text: "This is not a new diet identity. The Greek God file stays the source for meal examples and the 2,455 kcal line. This article is the operating map: what 12% actually costs, where junk fits, and which traps wreck a cut that is already working.",
        },
        {
          type: "table",
          headers: ["Item", "Now"],
          rows: [
            ["Scale", "~90 kg after 96 → 90 in about a month"],
            ["Felt BF%", "20–25% (not DEXA — a band, not a lab result)"],
            ["Eat", "~2,500 kcal, tracked"],
            ["Protein floor", "~210 g (2.3 g/kg at 90 kg is ~207 g; lab default 214)"],
            ["Load", "Intense doubles, gym, ~10k steps, table tennis"],
            ["Creatine", "4–5 g daily, started ~week of 8 Sep 2026"],
            ["Watch", "Garmin often 3.5–4.5k total — includes BMR, runs hot on court"],
          ],
        },
        {
          type: "callout",
          kicker: "do not invent",
          text: "No keto week. No dirty bulk. No eating the watch. Change one variable at a time. Pressure is showing up to this line, not a fourth lift day on no sleep.",
        },
      ],
    },
    {
      id: "goal",
      title: "What 12% actually is",
      blocks: [
        {
          type: "p",
          text: "Body fat % = fat kilograms ÷ scale kilograms. 12% is a fat-mass number, not a mood, not a vow, not a six-pack in one photo. The file wanted 84 kg at 12% by gaining lean while cutting. In a real deficit you keep lean. You do not add 5 kg of muscle.",
        },
        {
          type: "p",
          text: "You cannot stay 89–90 kg and arrive at 12%. A flat 90 can still be a denser 90. That is recomp. It is not 12%.",
        },
        {
          type: "table",
          headers: ["If 90 kg at…", "Fat / lean", "12% at the same lean", "Fat still to lose"],
          rows: [
            ["25%", "22.5 / 67.5 kg", "~77 kg on the scale", "~13 kg fat"],
            ["22%", "19.8 / 70.2 kg", "~80 kg", "~10 kg fat"],
            ["20%", "18 / 72 kg", "~82 kg", "~8 kg fat"],
          ],
        },
        {
          type: "p",
          text: "So 12% from this band is roughly 77–82 kg if muscle holds, not a shredded 90. The file’s 84 kg @ 12% assumed extra lean you will not grow in a hole.",
        },
        {
          type: "h3",
          text: "Rate",
        },
        {
          type: "p",
          text: "0.5–0.75 kg of fat per week if protein and lifts hold. From 20–25% that is about 4–7 months, not 90 days. The last stretch (about 15% → 12%) is slower, hungrier, and less forgiving of junk. Month one (96 → 90) already dumped water, glycogen, and a chunk of fat. That drop does not repeat.",
        },
        {
          type: "callout",
          kicker: "honest 90-day window",
          text: "Possible: 84–86 kg and maybe ~17–20% if the hole holds. Stretch: clearer V-taper, abs in lighting. Not possible: 12% with a six-pack at rest, striated delts, Christmas tree. That last look is the file’s poetry. The file’s own measurement rule was −1% BF every 2–3 weeks.",
        },
      ],
    },
    {
      id: "moves",
      title: "What actually moves body fat",
      blocks: [
        {
          type: "ol",
          items: [
            "Weekly calories under maintenance — the average, not a clean Tuesday.",
            "Protein ~2.2–2.3 g/kg so the loss is fat (~200–210 g now).",
            "Lifts holding. That is the signal the 67–72 kg of lean is still there.",
            "Time. Same hole for months.",
            "Sleep. Same kcal, bad sleep → more muscle lost, more hunger, worse look at the same weight.",
          ],
        },
        {
          type: "p",
          text: "Samosas do not block 12% by being samosas. They block it by blowing the week or stealing the protein meal.",
        },
      ],
    },
    {
      id: "junk",
      title: "How much junk is allowed",
      blocks: [
        {
          type: "p",
          text: "Pay protein and training carbs first. Junk is whatever is left inside ~2,500 × 7 ≈ 17,500 kcal/week. Two medium samosas ≈ 520 kcal and ~8 g protein. That is the unit.",
        },
        {
          type: "table",
          headers: ["Zone", "Junk in a week", "What it looks like", "For 12%"],
          rows: [
            [
              "Inside",
              "0–2 events. ~210 g protein every day. Week avg ~2,500.",
              "One samosa evening. Next meal is dal / eggs / paneer / whey — not muesli.",
              "Fine from ~25% down toward ~18%.",
            ],
            [
              "Yellow",
              "3–4 events, or ~1,500–2,500 kcal junk. Protein still mostly hit.",
              "Samosa culture most days. Budget still closed.",
              "Fat can still drop. Getting under ~15% gets ugly.",
            ],
            [
              "Crossed",
              "5+ junk days, or protein skipped to stay in deficit, or week avg clearly over 2,500, or a weekend that eats 3–4 days of hole.",
              "Two samosas, then one bowl of muesli as punishment.",
              "You can lose weight. You will not land 12% looking athletic.",
            ],
          ],
        },
        {
          type: "callout",
          kicker: "the boundary",
          text: "Junk is too much when it replaces the protein meal or opens the weekly average. Junk is allowed when it is counted, the next plate is still protein, and the week still closes at ~2,500.",
        },
        {
          type: "p",
          text: "From ~18% down, leftover room shrinks. Protein + rice/roti for court already fill the day. Cap: 0–1 planned junk meal per week, not a random stall hit. From ~15% → 12%, treat junk as almost zero except a planned higher-carb meal (the file’s refeed), not fried dough as a habit.",
        },
        {
          type: "h3",
          text: "Tags in the log",
        },
        {
          type: "ul",
          items: [
            "protocol — planned meal: dal, whey, paneer, tofu, eggs, rice, roti as a real meal.",
            "snack — extra, not a full meal, not obvious junk: fruit, chaas, extra dahi, nuts.",
            "junk — namkeen, sweets, fried street, bakery, cold drink with sugar, chocolate binge, chips, pizza, ice cream, samosa, Maggi as a raid.",
          ],
        },
        {
          type: "p",
          text: "All three still count. Never refuse a junk item. Log it. Zero-kcal soda is not a binge. Sugar soda is.",
        },
      ],
    },
    {
      id: "crossing",
      title: "What crossing looks like",
      blocks: [
        {
          type: "table",
          headers: ["Still inside", "Crossed"],
          rows: [
            ["Week average ~2,500", "“Deficit though” while protein is 120–150 g"],
            ["Protein ~210 g on junk days too", "Lunch is cereal because breakfast was fried"],
            ["1–2 samosa-class hits, logged", "Four fried/sweet hits and logging stops"],
            ["Waist down over 2–3 weeks, or lifts stable while scale slowly drops", "Saturday/Sunday untracked, Monday is a cleanse"],
            ["Next meal is protocol", "Scale down, lifts down, looking flatter — tissue, not 12%"],
          ],
        },
        {
          type: "p",
          text: "The last row is the real fail. Lighter and softer is not the goal. If a day crosses: close it. Next meal is still protein. That is how you know you did not leave the map.",
        },
      ],
    },
    {
      id: "map",
      title: "Map from 20–25% at 90 kg",
      blocks: [
        {
          type: "table",
          headers: ["Stretch", "Junk", "What you get"],
          rows: [
            [
              "Next 2–3 months",
              "Inside (0–2/week, protein floor)",
              "Maybe ~17–20%. Scale drifting toward mid-80s if the hole holds.",
            ],
            [
              "Next 5–7 months",
              "Yellow or better, especially once abs start talking",
              "~12–14% is in range if lifts and sleep hold.",
            ],
            [
              "Same 2,500 but samosa-then-muesli as a personality",
              "Crossed most weeks",
              "Lower weight. Still look 18–22%.",
            ],
          ],
        },
        {
          type: "p",
          text: "12% is weeks of being inside the line, then months of the same line getting tighter. Not a vow.",
        },
      ],
    },
    {
      id: "lean-junk",
      title: "How lean people still eat junk",
      blocks: [
        {
          type: "p",
          text: "They are not running a magic metabolism. You are seeing the end of the process, a bigger calorie budget, or a camera. Often all three.",
        },
        {
          type: "ol",
          items: [
            "They already have the abs. Getting to 12–15% is a small leftover. Staying there is maintenance. On this sport load, maintenance can be 2,800–3,300+, not 2,500. At 3,100 kcal, two samosas are ~17% of the day. At 2,500 in a cut, they are a fifth of the hole. Same junk, different math.",
            "Protein is paid first. Not fried dough then a bowl of muesli. Two hundred grams, training carbs, then the treat inside the number.",
            "The junk is a slice. 1–2 hits a week or one meal. The reel is the pizza. It is not the other 16 meals.",
            "They move like this week already does. High TDEE is how some people “get away with it.” It still does not put abs on a 20–25% body if junk is lunch.",
            "Genetics and the photo. Some men show a four-pack at 15%. Some need 11%. Pump, light, tan, morning vs Maggi at 10 pm.",
            "They never started at ~28%. Different hunger, different leftover. Not a moral gap. A longer road.",
            "A few of the year-round shredded bakery physiques are not natural. Not the template.",
          ],
        },
        {
          type: "h3",
          text: "Their sequence (whether they say it or not)",
        },
        {
          type: "ol",
          items: [
            "Cut until the waist actually shows. Junk inside the tight table.",
            "Raise food to maintenance. Keep protein and lifts.",
            "Then put junk back in as leftover on a bigger day.",
          ],
        },
        {
          type: "callout",
          kicker: "you",
          text: "You can have that life. It is not “never samosa again.” It is not yet. At 20–25%, junk is a leak and a protein thief. At ~12–15% and ~2,900 kcal because doubles are still on, the same samosa is a Friday.",
        },
      ],
    },
    {
      id: "garmin",
      title: "Garmin, 2,500, and the hole",
      blocks: [
        {
          type: "p",
          text: "Wrist total calories include BMR. They are not exercise calories on top. Doubles and table tennis models run hot because they treat points like a continuous run. Treat 3.5–4.5k as an upper bound.",
        },
        {
          type: "p",
          text: "The scale is the judge. 96 → 90 means the hole was real. A fair read of that month: true average burn closer to ~3,200–3,600, not 4,500 every day. Eating 2,500 on that is a 700–1,100 kcal deficit. That matches an aggressive first month. 4,500 every day would be a ~2,000 kcal hole — flatter, weaker, hungrier than “I dropped 6 kg and I still train daily.”",
        },
        {
          type: "callout",
          kicker: "rule",
          text: "Do not eat up to Garmin. Keep ~2,500 until the weekly fasted average stalls 2+ weeks. Then change one thing (usually −30 g carbs), not the whole religion.",
        },
      ],
    },
    {
      id: "creatine",
      title: "Creatine, a flat 90, and recomp",
      blocks: [
        {
          type: "p",
          text: "4–5 g creatine daily is the protocol dose. No load required. In the first 7–14 days muscle holds extra water. The scale often jumps 0.5–2 kg. That water is inside the muscle, not fat. It can hide a week of fat loss. Do not cut 300 kcal because 90.0 went to 90.8.",
        },
        {
          type: "table",
          headers: ["What is happening", "Scale", "How you know"],
          rows: [
            ["Creatine water (early weeks)", "Flat or +0.5–2 kg", "Fullness, pumps, maybe better doubles"],
            ["Fat loss, muscle held", "Slow drop or flat", "Waist down, same or better lifts"],
            ["True recomp", "89–90 for weeks", "Waist down and bench/row/squat up. Photos denser, not just smaller"],
            ["Muscle loss in a hole", "Dropping fast again", "Weight down, lifts down, looking flatter"],
          ],
        },
        {
          type: "p",
          text: "Yes: you can lose fat, add a little muscle, and live around 89–90 kg. That is real. It is slow (fractions of a kilo of muscle per month, not 5 kg). It is not 12%. 12% still needs the scale to come down later. You do not have to force that this week.",
        },
      ],
    },
    {
      id: "drinks",
      title: "Zero soda and energy drinks",
      blocks: [
        {
          type: "p",
          text: "You do not need to cut zero-sugar soda for fat loss. They are ~0 kcal. They are not why 96 went to 90. Carbonation can round the waist for a few hours (gas, not fat). Skip fizz on photo morning if you care. Do not ban soda to feel cleaner.",
        },
        {
          type: "p",
          text: "Energy drinks are caffeine, not calories. Protocol: 200–300 mg, pre-workout, not after 4 PM. Count the can inside that dose. A Monster / Red Bull / Sting stack on top of coffee is how sleep dies, then the cut eats muscle.",
        },
        {
          type: "table",
          headers: ["Keep", "Cut or cap"],
          rows: [
            ["Zero-cal soda if it does not trigger a snack raid", "Energy drinks after ~4 PM"],
            ["One caffeinated can counted inside 200–300 mg", "Two or three cans “because they are zero”"],
            ["Water as the default (~4.5 L in the file)", "Using a zero can as permission for extra food"],
          ],
        },
      ],
    },
    {
      id: "traps",
      title: "Traps — do and don’t",
      blocks: [
        { type: "h3", text: "The scale" },
        {
          type: "pair",
          do: "Weigh fasted, same time, 2–3 mornings, use the average. Track waist + one lift + a same-light photo.",
          dont: "Chase 84 kg if lifts are dying. Treat a 1–2 kg swing as fat. Panic at creatine-week scale.",
        },
        { type: "h3", text: "Calories" },
        {
          type: "pair",
          do: "Keep ~2,500 and ~210 g protein. Log junk. Weigh oils, peanut butter, paneer, rice.",
          dont: "Eat the watch. Hide chai sugar and cooking fat as zero. Open keto or a dirty bulk because one week paused.",
        },
        { type: "h3", text: "After a slip" },
        {
          type: "pair",
          do: "Close the day. Next meal is protocol. Name hunger vs the gap.",
          dont: "Feast today, starve tomorrow (the ₹11 loop). “The vow broke, one more plate.” Extra HIIT as penance.",
        },
        { type: "h3", text: "Training" },
        {
          type: "pair",
          do: "Keep doubles, TT, 10k, gym as sport + stimulus. Carbs around training (meals 4 / 5).",
          dont: "Stack more volume because Garmin is high. Secret chest day on rest. Train on no sleep to stay in deficit.",
        },
        { type: "h3", text: "Head" },
        {
          type: "pair",
          do: "Judge 2–4 weeks. Expect 0.5–0.75 kg/week from here, or a flat 89–90 with a smaller waist.",
          dont: "Run the day-90 statue as a deadline. Use the body as a scoreboard vs someone else. Change five things at once.",
        },
      ],
    },
    {
      id: "strict",
      title: "If you want to be strict once",
      blocks: [
        {
          type: "p",
          text: "Eat for performance and recovery. Do not join a religion called Grind Mode. All-or-nothing is not discipline here — it is the gap in a clean shirt. Forever-strict breaks, then you feast.",
        },
        {
          type: "p",
          text: "If you still want the trial: 14 days, protocol food only, same 2,500, same ~210 g, same sport, junk = 0. Start at the next meal. If a samosa shows on day 6, protein still gets eaten. That day is dirty. Day 7 is Meal 1. Finishing the block without the famine lunch is the mental level. After day 14 you keep the floor, not the vow-theatre.",
        },
        {
          type: "callout",
          kicker: "strict that counts",
          text: "Protein floor every day, including junk days. Junk does not cancel lunch. 2,500 still stands. Close the day.",
        },
      ],
    },
    {
      id: "food",
      title: "Fuel that is on-protocol",
      blocks: [
        {
          type: "p",
          text: "Vegetarian. Eggs, dairy, whey, tofu, seitan, dahi, paneer, tempeh, legumes. No meat as the default. No alcohol. Example plates in the Greek God file are templates (quinoa, avocado). Dal, roti, mess, katori still count as protocol if they are a real meal hitting the slot.",
        },
        {
          type: "table",
          headers: ["Meal", "Time", "Job", "Macros P / C / F"],
          rows: [
            ["1 Awakening", "6:30", "Stop overnight catabolism", "45 / 40 / 12"],
            ["2 Sustainer", "10:00", "Hold nitrogen", "40 / 45 / 14"],
            ["3 Power lunch", "13:00", "Midday + prep for training", "50 / 55 / 15"],
            ["4 Pre-workout", "16:00", "Glycogen, 60–90 min pre", "35 / 70 / 8"],
            ["5 Post-workout", "19:30", "Repair, 30–45 min post", "50 / 40 / 16"],
          ],
        },
        {
          type: "p",
          text: "File totals: 220 g P / 250 g C / 65 g F / 2,455 kcal at the old 96 kg. Eat target stays 2,455 until weekly weigh-ins say otherwise. Protein target in the app is 214 until weight moves again.",
        },
      ],
    },
    {
      id: "floor",
      title: "The floor — one page",
      blocks: [
        {
          type: "table",
          headers: ["Do", "Don’t"],
          rows: [
            ["~2,500 kcal, ~210 g protein, log everything", "Eat Garmin"],
            ["Waist / lifts / photos with the scale", "Panic at creatine-week scale"],
            ["Next meal = protocol meal", "Starve tomorrow to pay for today"],
            ["Keep sport", "Punish with extra HIIT"],
            ["Sleep is recovery for the smash", "Cut food because one morning was 90.6"],
            ["Junk as leftover, 0–2 events/week while cutting", "Junk as lunch, then muesli as penance"],
          ],
        },
        {
          type: "callout",
          kicker: "sequence",
          text: "Cut until the waist shows → raise food to maintenance → then the Friday samosa fits. You are in the first step. Protein first. Leftover later.",
        },
      ],
    },
  ],
};
