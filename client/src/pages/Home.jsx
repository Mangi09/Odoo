import React from 'react'
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";
import CreateTrip from "../components/CreateTrip";

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