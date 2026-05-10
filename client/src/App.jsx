import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import CreateTrip from "./components/CreateTrip";

export default function App() {
  return (
    <div className="bg-[#F5F3F2] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <CreateTrip />
      <CTA />
      <Footer />
    </div>
  );
}