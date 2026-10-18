import type { FounderReadingInput } from "./generateReading";

/**
 * Handwritten readings, used when the model call fails or is unconfigured.
 *
 * Why this exists: the reading is the moment the free reveal earns the paid
 * upgrade. Before this file, a failed request showed "your reading is taking
 * longer than usual" - an apology in the exact place the product is supposed
 * to be most convincing. These lines are written once, by hand, and are good
 * enough that a visitor who gets one has no idea anything failed.
 *
 * Keep the voice dry and specific. Every entry names a real operating edge and
 * a real failure mode. Nothing here predicts an outcome, and nothing here is
 * advice about money - see the disclaimer under the reading in the UI.
 */

interface LifePathReading {
  /** How this founder actually operates, and where that wins. */
  edge: string;
  /** The characteristic failure mode of that same trait. */
  caution: string;
}

const LIFE_PATH_READINGS: Record<number, LifePathReading> = {
  1: {
    edge: "you decide fast and alone, which means you start things other people are still holding meetings about.",
    caution: "you will under-delegate, and the second good hire will be halfway out the door before you notice they had nothing to own.",
  },
  2: {
    edge: "you read a room before you speak in it, and you consistently get better terms than a louder founder with a better product.",
    caution: "you wait for a consensus that was never coming. Some calls only ever have one vote, and it is yours.",
  },
  3: {
    edge: "you can create attention more cheaply than almost anyone you compete with.",
    caution: "the pitch outruns the product. You sell the version you described, and then spend the quarter building it under deadline.",
  },
  4: {
    edge: "the things you build still work in year three, which is rarer than it sounds and is what turns a client into a contract.",
    caution: "you build process for a business that has not yet found its customer. Structure before product-market fit is an expensive kind of procrastination.",
  },
  5: {
    edge: "you move into a new market faster than the people already in it can respond.",
    caution: "you leave at month nine - right at the point where the boring version of the business starts to compound.",
  },
  6: {
    edge: "people stay. Your churn is low on the team and lower on the client list, and that is a real financial advantage you probably do not price.",
    caution: "you keep unprofitable clients because ending it feels like abandoning them. Look at your worst account and be honest about what it costs you.",
  },
  7: {
    edge: "you are hard to sell to and hard to fool, so you sit out the expensive fashions that take a year out of everyone else.",
    caution: "you research past the point where more information would change the decision. At some point the analysis is just a place to stand.",
  },
  8: {
    edge: "you are comfortable with large numbers and with the blunt conversations about money that most founders avoid until it is too late.",
    caution: "you take on fixed costs on the strength of a forecast. Hire and sign against revenue you have already collected, not revenue you expect.",
  },
  9: {
    edge: "you attract people who want to work on something that matters, and they will take less to do it.",
    caution: "the mission becomes the reason not to look at the margin. A business that runs out of money stops serving the mission entirely.",
  },
  11: {
    edge: "one conversation from you can change a room, and your best outcomes usually trace back to a single meeting.",
    caution: "you run the business on those meetings and neglect the eight weeks between them, which is where the work actually lives.",
  },
  22: {
    edge: "you finish large things. Most people with the same vision never get past the document describing it.",
    caution: "scope. Your first version is already someone else's version three, and it ships a year after the market needed it.",
  },
  33: {
    edge: "people hand you responsibility for their money and their reputation early, which is a form of leverage most founders never get.",
    caution: "you spend that credit on everyone except the business. Decide what share of your time is not available to other people, and defend it.",
  },
};

/**
 * What the business name reads as to a buyer. The number is numerology; the
 * observation about how a name lands is not, and is the part worth reading.
 */
const EXPRESSION_LINES: Record<number, string> = {
  1: "it lands as a single claim, which suits a category leader and works against you in a crowded market where the job is to say what makes you different",
  2: "it reads collaborative, which is an asset in services and an understatement in a product",
  3: "it is expressive and easy to remember, which carries a headline and costs you when a buyer wants to know exactly what you do",
  4: "it reads solid and literal, which buys trust on first contact and gives a copywriter nothing to work with",
  5: "it reads restless and current, which is useful at launch and harder to live with once the business narrows",
  6: "it reads dependable, which is worth real money wherever the buyer is handing over something they care about",
  7: "it reads specialist, which filters out the wrong buyers - usually worth more than reach",
  8: "it reads ambitious, which supports a premium price and undercuts you if the product has not caught up",
  9: "it reads broad, which leaves room to grow and nothing to anchor on",
  11: "it reads charged and slightly unusual, which means people either remember it or mispronounce it",
  22: "it reads like an institution, which is expensive to live up to and valuable once you do",
  33: "it reads generous and open, which needs specifics next to it or it floats",
};

export function fallbackReading(input: FounderReadingInput): string {
  const lp = LIFE_PATH_READINGS[input.lifePathNumber] ?? LIFE_PATH_READINGS[1];
  const expression =
    EXPRESSION_LINES[input.expressionNumber] ?? EXPRESSION_LINES[1];

  const sentences: string[] = [];

  sentences.push(
    `Life Path ${input.lifePathNumber}, ${input.archetypeName}: ${lp.edge}`
  );

  sentences.push(
    `"${input.businessName}" reduces to Expression ${input.expressionNumber}${
      input.isMasterNumber ? ", a master number" : ""
    } - ${expression}.`
  );

  if (input.wealthFlagLabels.length > 0) {
    sentences.push(
      `It also carries ${joinLabels(
        input.wealthFlagLabels
      )}, which in this system is read as favorable timing rather than a result.`
    );
  }

  sentences.push(`The thing to watch is the other side of your strength: ${lp.caution}`);

  return sentences.join(" ");
}

function joinLabels(labels: string[]): string {
  if (labels.length === 1) return `the ${labels[0]}`;
  const head = labels.slice(0, -1).map((l) => `the ${l}`).join(", ");
  return `${head} and the ${labels[labels.length - 1]}`;
}
