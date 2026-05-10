export default function Navbar() {
  return (
    <nav className="w-full px-6 lg:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold text-[#2D2D2D]">
        Traveloop
      </h1>

      <div className="hidden md:flex items-center gap-10 text-[#555] font-medium">

        <a href="#">Features</a>
        <a href="#">Destinations</a>
        <a href="#">Community</a>
        <a href="#">Pricing</a>

      </div>

      <button className="bg-[#F97316] text-white px-6 py-3 rounded-2xl font-medium hover:scale-105 transition">

        Get Started

      </button>
    </nav>
  );
}