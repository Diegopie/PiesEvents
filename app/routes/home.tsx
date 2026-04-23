import { data, Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/home";
import { db } from "~/db/index";
import { activities } from "~/db/schema/activities";
import { signups } from "~/db/schema/signups";
import { eq, asc } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Diego's 30th" },
    { name: "description", content: "Sign up for Diego's 30th birthday challenges!" },
  ];
}

const SMASH_ID = "d1111111-1111-1111-1111-111111111111";
const WINGS_ID = "d2222222-2222-2222-2222-222222222222";

export async function loader() {
  const [smash, wings, smashSignups, wingsSignups] = await Promise.all([
    db.query.activities.findFirst({ where: eq(activities.id, SMASH_ID) }),
    db.query.activities.findFirst({ where: eq(activities.id, WINGS_ID) }),
    db.select().from(signups).where(eq(signups.activityId, SMASH_ID)).orderBy(asc(signups.createdAt)),
    db.select().from(signups).where(eq(signups.activityId, WINGS_ID)).orderBy(asc(signups.createdAt)),
  ]);

  return { smash, wings, smashSignups, wingsSignups };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const activityId = formData.get("activityId");

  if (typeof name !== "string" || name.trim().length === 0) {
    return data({ error: "Please enter your name.", activityId }, { status: 400 });
  }
  if (activityId !== SMASH_ID && activityId !== WINGS_ID) {
    return data({ error: "Invalid activity.", activityId }, { status: 400 });
  }

  const trimmedName = name.trim();

  const existing = await db
    .select()
    .from(signups)
    .where(eq(signups.activityId, activityId as string))
    .then((rows) => rows.find((r) => r.name.toLowerCase() === trimmedName.toLowerCase()));

  if (existing) {
    return data(
      { error: `"${trimmedName}" is already signed up!`, activityId },
      { status: 400 }
    );
  }

  await db.insert(signups).values({ activityId: activityId as string, name: trimmedName });
  return data({ success: true, activityId });
}

// ─── Sub-component ────────────────────────────────────────────────────────────

type SignupRow = { id: string; name: string };
type ActionResult = { error?: string; success?: boolean; activityId?: unknown } | undefined;

function ChallengeCard({
  id,
  emoji,
  title,
  description,
  contenders,
  actionData,
  isSubmitting,
  activeId,
}: {
  id: string;
  emoji: string;
  title: string;
  description: string;
  contenders: SignupRow[];
  actionData: ActionResult;
  isSubmitting: boolean;
  activeId: string | null;
}) {
  const isActive = activeId === id;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden flex flex-col">
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <div className="text-4xl mb-2">{emoji}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-purple-200 text-sm mt-1">{description}</p>
      </div>

      <div className="px-6 py-4 flex-1">
        <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">
          Contenders ({contenders.length})
        </p>
        {contenders.length === 0 ? (
          <p className="text-purple-400 text-sm italic">No one yet — be the first!</p>
        ) : (
          <ul className="space-y-1.5">
            {contenders.map((c, i) => (
              <li key={c.id} className="flex items-center gap-2.5 text-sm">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500/40 text-purple-200 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="font-medium">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 pb-6">
        <Form method="post" className="flex gap-2">
          <input type="hidden" name="activityId" value={id} />
          <input
            type="text"
            name="name"
            placeholder="Your name"
            maxLength={100}
            required
            className="flex-1 rounded-xl bg-white/10 border border-white/30 px-4 py-2.5 text-white placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting && isActive}
            className="rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 font-semibold transition-colors text-sm whitespace-nowrap"
          >
            {isSubmitting && isActive ? "Adding…" : "Sign up"}
          </button>
        </Form>
        {isActive && actionData && "error" in actionData && actionData.error && (
          <p className="mt-2 text-sm text-red-300">{actionData.error}</p>
        )}
        {isActive && actionData && "success" in actionData && actionData.success && (
          <p className="mt-2 text-sm text-green-300">You're in! See you there. 🎉</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home({ loaderData }: Route.ComponentProps) {
  const { smash, wings, smashSignups, wingsSignups } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const activeId = isSubmitting && navigation.formData
    ? (navigation.formData.get("activityId") as string)
    : actionData?.activityId
    ? (actionData.activityId as string)
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-900 text-white">
      <div className="flex flex-col items-center justify-center pt-20 pb-10 px-4 text-center">
        <div className="text-6xl mb-4">🎂</div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">Diego's 30th</h1>
        <p className="text-purple-300 text-lg">July 10–12 · Austin, TX</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        <p className="text-center text-xs uppercase tracking-widest text-purple-400 font-semibold mb-6">
          Challenges — sign up if you dare
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {smash && (
            <ChallengeCard
              id={SMASH_ID}
              emoji="🎮"
              title={smash.name}
              description={smash.description ?? ""}
              contenders={smashSignups}
              actionData={actionData}
              isSubmitting={isSubmitting}
              activeId={activeId}
            />
          )}
          {wings && (
            <ChallengeCard
              id={WINGS_ID}
              emoji="🔥"
              title={wings.name}
              description={wings.description ?? ""}
              contenders={wingsSignups}
              actionData={actionData}
              isSubmitting={isSubmitting}
              activeId={activeId}
            />
          )}
        </div>
      </div>
    </main>
  );
}
