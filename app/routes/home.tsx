import { data, Form, useActionData, useNavigation } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { db } from "~/db/index";
import { activities } from "~/db/schema/activities";
import { signups } from "~/db/schema/signups";
import { eq, asc } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Diego's 30th" },
    { name: "description", content: "Diego's 30th birthday challenges." },
  ];
}

const SMASH_ID = "d1111111-1111-1111-1111-111111111111";
const WINGS_ID = "d2222222-2222-2222-2222-222222222222";

export async function loader() {
  const [smash, wings, smashSignups, wingsSignups] = await Promise.all([
    db.query.activities.findFirst({ where: eq(activities.id, SMASH_ID) }),
    db.query.activities.findFirst({ where: eq(activities.id, WINGS_ID) }),
    db
      .select()
      .from(signups)
      .where(eq(signups.activityId, SMASH_ID))
      .orderBy(asc(signups.createdAt)),
    db
      .select()
      .from(signups)
      .where(eq(signups.activityId, WINGS_ID))
      .orderBy(asc(signups.createdAt)),
  ]);

  return { smash, wings, smashSignups, wingsSignups };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const activityId = formData.get("activityId");

  if (typeof name !== "string" || name.trim().length === 0) {
    return data(
      { error: "Please enter your name.", activityId },
      { status: 400 }
    );
  }
  if (activityId !== SMASH_ID && activityId !== WINGS_ID) {
    return data({ error: "Invalid activity.", activityId }, { status: 400 });
  }

  const trimmedName = name.trim();

  const existing = await db
    .select()
    .from(signups)
    .where(eq(signups.activityId, activityId as string))
    .then((rows) =>
      rows.find((r) => r.name.toLowerCase() === trimmedName.toLowerCase())
    );

  if (existing) {
    return data(
      { error: `"${trimmedName}" is already on the list.`, activityId },
      { status: 400 }
    );
  }

  await db
    .insert(signups)
    .values({ activityId: activityId as string, name: trimmedName });
  return data({ success: true, activityId });
}

type SignupRow = { id: string; name: string };
type ActionResult =
  | { error?: string; success?: boolean; activityId?: unknown }
  | undefined;

function SignupForm({
  id,
  contenders,
  actionData,
  isSubmitting,
  activeId,
}: {
  id: string;
  contenders: SignupRow[];
  actionData: ActionResult;
  isSubmitting: boolean;
  activeId: string | null;
}) {
  const isActive = activeId === id;

  return (
    <>
      {contenders.length === 0 ? (
        <p>
          <em>No one signed up yet.</em>
        </p>
      ) : (
        <ol>
          {contenders.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ol>
      )}

      <Form method="post">
        <input type="hidden" name="activityId" value={id} />
        <input
          type="text"
          name="name"
          placeholder="Your name"
          maxLength={100}
          required
        />{" "}
        <button type="submit" disabled={isSubmitting && isActive}>
          {isSubmitting && isActive ? "Adding…" : "Sign up"}
        </button>
      </Form>

      {isActive && actionData && "error" in actionData && actionData.error && (
        <p>
          <strong>Error:</strong> {actionData.error}
        </p>
      )}
      {isActive &&
        actionData &&
        "success" in actionData &&
        actionData.success && <p>You're on the list.</p>}
    </>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { smash, wings, smashSignups, wingsSignups } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const activeId =
    isSubmitting && navigation.formData
      ? (navigation.formData.get("activityId") as string)
      : actionData?.activityId
        ? (actionData.activityId as string)
        : null;

  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <main>
      <label>
        <input
          type="checkbox"
          checked={dark}
          onChange={(e) => setDark(e.target.checked)}
        />{" "}
        Dark mode
      </label>

      <h1>Diego's 30th Birthday</h1>
      <p>April 25th</p>
      <p>A final send off to my 20's as I hurdle to the grave 🚀</p>
      <p>
        It will be day full of activities. So come early, come late, or don't
        come at all (💔)
      </p>

      <nav>
        <ul>
          <li><a href="#smash">Smash Bros</a></li>
          <li><a href="#food">Food</a></li>
          <li><a href="#wings">Hot Wings</a></li>
          <li><a href="#more">More</a></li>
          <li><a href="#parking">Parking</a></li>
        </ul>
      </nav>

      <hr />

      {smash && (
        <section id="smash">
          <header>
            <h2>🎮 Smash Bros Tournament</h2>
            <time dateTime="2026-04-25T12:00:00Z">12:15 PM</time>
            <p>
              Kids welcome at{" "}
              <time dateTime="2026-04-25T13:00:00Z">01:15 PM</time> in case
              things get, <i>aggressive</i>
            </p>
          </header>
          <h3>Location</h3>
          <a
            href="https://maps.google.com/?q=13257+S+Teal+Rdg+Wy,+Riverton,+UT+84096"
            target="_blank"
          >
            13257 S Teal Rdg Wy, Riverton, UT 84096
          </a>
          <p>
            I've spent 30 years becoming incredibly mediocre at Smash, think you
            can defeat me?? (kinda rude you're actually willing to try)
          </p>
          <p>Prizes will go to top contenders!</p>
          <h3>Sign Up</h3>
          <SignupForm
            id={SMASH_ID}
            contenders={smashSignups}
            actionData={actionData}
            isSubmitting={isSubmitting}
            activeId={activeId}
          />
        </section>
      )}

      <hr />

      <section id="food">
        <header>
          <h2>Food</h2>
          <time dateTime="2026-04-25T14:00:00Z">2:00 PM</time>
        </header>

        <h3>Location</h3>

      <a
        href="https://maps.google.com/?q=4453+W+Biscayne+Park+Dr,+Riverton,+UT+84096"
        target="_blank"
      >
        4453 W Biscayne Park Dr, Riverton, UT 84096
      </a>

      <p>
        Legendary chef, my Mommy, will be catering the event with tamales and
        more
      </p>

      <p>Please feel free to bring beverages 🍻</p>
      </section>

      <hr />

      {wings && (
        <section id="wings">
          <header>
            <h2>Hot Ones Challenge 🍗</h2>
            <time dateTime="2026-04-25T15:00:00Z">3:00 PM</time>
          </header>
          <p>
            Join me in conquering the wings of death! We'll have the full 10
            sauce lineup!
          </p>
          <SignupForm
            id={WINGS_ID}
            contenders={wingsSignups}
            actionData={actionData}
            isSubmitting={isSubmitting}
            activeId={activeId}
          />
        </section>
      )}

      <section id="more">
        <h2>And more!</h2>
        <p>You think websites like this make themselves?!</p>
      </section>

      <section id="parking">
        <h2>Parking</h2>
        <p>
          If you're coming to the Smash Bros activity at the theater, it's
          probably easiest to park there an then cross the street to our house
        </p>
        <div className="overflow-x-auto p-8">
          <img
            src="/images/cinemark.jpg"
            className="aspect-3/4 h-64 md:h-96"
            alt="Cinemark Parking"
          ></img>
        </div>
        <p>
          If you're coming later, the green areas are public parking. At the gate, select visitor pass and use code <span>430888</span>.
        </p>
        <div className="overflow-x-auto p-8">
          <img
            src="/images/viviano.png"
            className="aspect-3/4 h-64 md:h-96"
            alt="Viviano Parking"
          ></img>
        </div>
      </section>
    </main>
  );
}
