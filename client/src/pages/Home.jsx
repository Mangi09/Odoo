import React from 'react'
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

const Home = () => {
  return (
    <>
        <Hero />
        <Features />
        <CreateTrip />
        <CTA />
    </>
  )
}

export default Home