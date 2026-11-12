// PROTOTYPE: the home page with the projects and skills sections redone. Dev only; 404 in production.
// Same structure as src/app/page.tsx (story, then the cloud section) so the cloud overlap and Lenis behave the same.

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { places } from "@/components/story/places";
import StoryJourney from "@/components/story/StoryJourney";
import HomeSections from "./HomeSections";

export const metadata = { robots: { index: false, follow: false } };

export default function HomePrototype() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div>
      <StoryJourney places={places} />
      <Suspense>
        <HomeSections />
      </Suspense>
    </div>
  );
}
