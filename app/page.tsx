import Collection from './_components/Collection';
import Effects from './_components/Effects';
import GlowFinder from './_components/GlowFinder';
import Header from './_components/Header';
import Hero from './_components/Hero';
import Ingredients from './_components/Ingredients';
import Join from './_components/Join';
import { Faq, Footer, Marquee, Promises } from './_components/Sections';
import StickyCta from './_components/StickyCta';
import StoryScroll from './_components/StoryScroll';

// Page flow is a conversion funnel: hook (hero) → trust (promise) → desire
// (collection, story, ingredients) → personalise (finder) → act (join) →
// reassure (FAQ). Every section offers a route to the founding-list signup.
export default function Home() {
  return (
    <>
      <Effects />
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <Promises />
        <Collection />
        <StoryScroll />
        <Ingredients />
        <GlowFinder />
        <Join />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
