const places = [
    {
        name: "Paris",
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    },
    {
        name: "Rome",
        image:
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    },
    {
        name: "Bali",
        image:
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    },
    {
        name: "Tokyo",
        image:
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    },
    {
        name: "Swiss Alps",
        image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
    {
        name: "Dubai",
        image:
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    },
];

export default function CreateTrip() {
    return (
        <section className="px-6 lg:px-12 py-10">

            <div className="max-w-7xl mx-auto">

                {/* TOP */}

                <div className="flex items-center justify-between">

                    <div>
                        <p className="text-[#F97316] font-semibold">
                            CREATE YOUR JOURNEY
                        </p>

                        <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">
                            Plan A New Trip
                        </h1>
                    </div>

                    <button className="bg-[#F97316] text-white px-6 py-3 rounded-2xl font-medium hover:scale-105 transition">
                        Save Trip
                    </button>

                </div>

                {/* MAIN GRID */}

                <div className="grid lg:grid-cols-[1fr_420px] gap-10 mt-12">

                    {/* LEFT SIDE */}

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm">

                        <div className="grid md:grid-cols-2 gap-6">

                            {/* TRIP NAME */}

                            <div className="md:col-span-2">

                                <label className="text-sm text-[#666666] font-medium">
                                    Trip Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Summer Europe Adventure"
                                    className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-[#F97316]"
                                />

                            </div>

                            {/* START DATE */}

                            <div>

                                <label className="text-sm text-[#666666] font-medium">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-[#F97316]"
                                />

                            </div>

                            {/* END DATE */}

                            <div>

                                <label className="text-sm text-[#666666] font-medium">
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-[#F97316]"
                                />

                            </div>

                            {/* DESTINATION */}

                            <div className="md:col-span-2">

                                <label className="text-sm text-[#666666] font-medium">
                                    Select Destination
                                </label>

                                <select
                                    className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-[#F97316]"
                                >
                                    <option>Paris</option>
                                    <option>Rome</option>
                                    <option>Tokyo</option>
                                    <option>Bali</option>
                                </select>

                            </div>

                            {/* DESCRIPTION */}

                            <div className="md:col-span-2">

                                <label className="text-sm text-[#666666] font-medium">
                                    Trip Description
                                </label>

                                <textarea
                                    rows="5"
                                    placeholder="Describe your travel plans..."
                                    className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none resize-none focus:border-[#F97316]"
                                ></textarea>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm">

                        <h2 className="text-2xl font-bold text-[#2D2D2D]">
                            Trip Preview
                        </h2>

                        <div className="mt-8">

                            <img
                                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                                alt=""
                                className="w-full h-56 object-cover rounded-3xl"
                            />

                            <div className="mt-6">

                                <h3 className="text-3xl font-bold text-[#2D2D2D]">
                                    Europe Escape
                                </h3>

                                <p className="text-[#666666] mt-3 leading-relaxed">
                                    Discover breathtaking cities, cultural experiences,
                                    and unforgettable memories across Europe.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* SUGGESTIONS */}

                <div className="mt-16">

                    <div className="flex items-center justify-between">

                        <h2 className="text-3xl font-bold text-[#2D2D2D]">
                            Suggested Destinations
                        </h2>

                        <button className="text-[#F97316] font-semibold">
                            View All
                        </button>

                    </div>

                    {/* CARDS */}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">

                        {places.map((place, index) => (

                            <div
                                key={index}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition duration-300 cursor-pointer"
                            >

                                <img
                                    src={place.image}
                                    alt=""
                                    className="h-56 w-full object-cover"
                                />

                                <div className="p-6">

                                    <h3 className="text-2xl font-bold text-[#2D2D2D]">
                                        {place.name}
                                    </h3>

                                    <p className="text-[#666666] mt-3">
                                        Perfect for your next adventure.
                                    </p>

                                    <button className="mt-6 bg-[#F97316] text-white px-5 py-3 rounded-2xl">
                                        Explore
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}