import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="px-6 lg:px-12 py-10 lg:py-20">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* LEFT CONTENT */}

        <div>

          <p className="text-[#F97316] font-semibold tracking-wide">
            PLAN YOUR NEXT ADVENTURE
          </p>

          <h1 className="text-5xl lg:text-7xl font-bold text-[#2D2D2D] leading-tight mt-6">

            Travel Smarter
            <br />

            With Traveloop

          </h1>

          <p className="text-[#666666] text-lg leading-relaxed mt-8 max-w-xl">

            Personalized itineraries, smart budgeting,
            activity discovery, and seamless travel planning
            in one beautifully crafted platform.

          </p>

          <div className="flex gap-5 mt-10 flex-wrap">

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="bg-[#F97316] text-white px-8 py-4 rounded-2xl font-medium hover:scale-105 transition"
            >

              Start Planning

            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-white border border-[#E5E5E5] px-8 py-4 rounded-2xl font-medium hover:shadow-md transition"
            >

              Login

            </button>

          </div>

          {/* STATS */}

          <div className="flex gap-12 mt-16 flex-wrap">

            <div>
              <h2 className="text-4xl font-bold text-[#2D2D2D]">
                10K+
              </h2>

              <p className="text-[#666666] mt-2">
                Trips Planned
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#2D2D2D]">
                150+
              </h2>

              <p className="text-[#666666] mt-2">
                Cities
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#2D2D2D]">
                25K+
              </h2>

              <p className="text-[#666666] mt-2">
                Activities
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="relative flex justify-center">

          {/* PHONE */}

          <div className="bg-black p-3 rounded-[3rem] shadow-2xl w-[320px]">

            <div className="bg-white rounded-[2.5rem] overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                alt=""
                className="h-64 w-full object-cover"
              />

              <div className="p-5">

                {/* TRIP CARD */}

                <div className="bg-white rounded-3xl shadow-lg p-5 -mt-16 relative z-10">

                  <h2 className="text-2xl font-bold text-[#2D2D2D]">

                    Paris → Rome

                  </h2>

                  <div className="flex justify-between mt-5">

                    <div>

                      <p className="text-sm text-[#666666]">
                        Duration
                      </p>

                      <h3 className="font-semibold mt-1">
                        12 Days
                      </h3>

                    </div>

                    <div>

                      <p className="text-sm text-[#666666]">
                        Budget
                      </p>

                      <h3 className="font-semibold mt-1 text-green-500">
                        €1580
                      </h3>

                    </div>

                  </div>

                </div>

                {/* DESTINATIONS */}

                <div className="space-y-4 mt-8">

                  {[
                    "Paris → Venice",
                    "Venice → Rome",
                    "Rome → Milan",
                  ].map((trip, index) => (

                    <div
                      key={index}
                      className="bg-[#F5F3F2] p-4 rounded-2xl flex justify-between items-center"
                    >

                      <div>

                        <h3 className="font-semibold text-[#2D2D2D]">
                          {trip}
                        </h3>

                        <p className="text-sm text-[#666666] mt-1">
                          08:00 - 14:00
                        </p>

                      </div>

                      <p className="font-semibold text-green-500">
                        €29
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

          {/* FLOATING CARD */}

          <div className="hidden lg:block absolute -left-10 bottom-10 bg-white p-6 rounded-3xl shadow-xl">

            <p className="text-[#666666]">
              Total Budget
            </p>

            <h2 className="text-4xl font-bold mt-2 text-[#2D2D2D]">

              €2,450

            </h2>

            <div className="w-44 h-3 bg-[#EEE] rounded-full mt-5 overflow-hidden">

              <div className="w-[70%] bg-[#F97316] h-full rounded-full"></div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
