// ActivitySearch.jsx

import { useState } from "react";

import {
  Search,
  Star,
  MapPin,
  Clock3,
} from "lucide-react";

const activities = {
  Paragliding: [
    {
      title: "Bir Billing Paragliding",
      location: "Himachal Pradesh, India",
      price: "₹3,500",
      rating: "4.9",
      duration: "2 Hours",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },

    {
      title: "Kamshet Flying Adventure",
      location: "Maharashtra, India",
      price: "₹2,800",
      rating: "4.7",
      duration: "1.5 Hours",
      image:
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
    },

    {
      title: "Manali Sky Ride",
      location: "Manali, India",
      price: "₹4,000",
      rating: "4.8",
      duration: "2 Hours",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
  ],

  Surfing: [
    {
      title: "Goa Surf Camp",
      location: "Goa, India",
      price: "₹2,200",
      rating: "4.8",
      duration: "3 Hours",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },

    {
      title: "Bali Wave Surfing",
      location: "Bali, Indonesia",
      price: "₹5,400",
      rating: "4.9",
      duration: "Full Day",
      image:
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
    },

    {
      title: "Malibu Surf Lessons",
      location: "California, USA",
      price: "₹7,200",
      rating: "4.7",
      duration: "4 Hours",
      image:
        "https://images.unsplash.com/photo-1473116763249-2faaef81ccda",
    },
  ],

  "Scuba Diving": [
    {
      title: "Andaman Reef Diving",
      location: "Andaman Islands, India",
      price: "₹6,500",
      rating: "5.0",
      duration: "5 Hours",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
    },

    {
      title: "Maldives Ocean Dive",
      location: "Maldives",
      price: "₹12,000",
      rating: "4.9",
      duration: "Full Day",
      image:
        "https://images.unsplash.com/photo-1519046904884-53103b34b206",
    },

    {
      title: "Thailand Coral Dive",
      location: "Phuket, Thailand",
      price: "₹8,500",
      rating: "4.8",
      duration: "6 Hours",
      image:
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7",
    },
  ],

  Mountains: [
    {
      title: "Swiss Alps Trek",
      location: "Switzerland",
      price: "₹15,000",
      rating: "5.0",
      duration: "2 Days",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    },

    {
      title: "Rocky Mountain Escape",
      location: "Canada",
      price: "₹11,500",
      rating: "4.8",
      duration: "3 Days",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    },

    {
      title: "Himalayan Adventure",
      location: "Leh Ladakh, India",
      price: "₹9,000",
      rating: "4.9",
      duration: "4 Days",
      image:
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
    },
  ],

  "Hill Stations": [
    {
      title: "Shimla Getaway",
      location: "Himachal Pradesh",
      price: "₹5,000",
      rating: "4.7",
      duration: "2 Days",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    },

    {
      title: "Ooty Nature Retreat",
      location: "Tamil Nadu",
      price: "₹4,200",
      rating: "4.8",
      duration: "3 Days",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },

    {
      title: "Darjeeling Tea Hills",
      location: "West Bengal",
      price: "₹5,500",
      rating: "4.9",
      duration: "3 Days",
      image:
        "https://images.unsplash.com/photo-1472396961693-142e6e269027",
    },
  ],

  "Adventure Park": [
    {
      title: "Imagica Adventure Park",
      location: "Mumbai, India",
      price: "₹2,500",
      rating: "4.6",
      duration: "Full Day",
      image:
        "https://images.unsplash.com/photo-1519677100203-a0e668c92439",
    },

    {
      title: "Universal Studios",
      location: "Singapore",
      price: "₹8,000",
      rating: "4.9",
      duration: "Full Day",
      image:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
    },

    {
      title: "Disneyland Adventure",
      location: "Paris, France",
      price: "₹14,000",
      rating: "5.0",
      duration: "2 Days",
      image:
        "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9",
    },
  ],
};

export default function ActivitySearch() {

  const [search, setSearch] = useState("Paragliding");

  const filteredResults =
    activities[search] || [];

  return (

    <section className="px-6 lg:px-12 py-10">

      <div className="max-w-7xl mx-auto">

        {/* TOP */}

        <div>

          <p className="text-[#F97316] font-semibold">
            SEARCH ACTIVITIES
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">
            Find Your Next Adventure
          </h1>

          <p className="text-[#666666] text-lg mt-4">
            Search for thrilling experiences, destinations,
            and activities around the world.
          </p>

        </div>

        {/* SEARCH BAR */}

        <div className="bg-white rounded-[2rem] p-5 shadow-sm flex items-center gap-4 mt-12">

          <Search className="text-[#999]" size={24} />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full outline-none text-lg bg-transparent"
          />

        </div>

        {/* QUICK SEARCH TAGS */}

        <div className="flex gap-4 mt-8 overflow-x-auto pb-2">

          {Object.keys(activities).map((item, index) => (

            <button
              key={index}
              onClick={() => setSearch(item)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap transition font-medium ${
                search === item
                  ? "bg-[#F97316] text-white"
                  : "bg-white text-[#555] hover:bg-[#EEE]"
              }`}
            >

              {item}

            </button>

          ))}

        </div>

        {/* RESULTS */}

        <div className="mt-12">

          <h2 className="text-3xl font-bold text-[#2D2D2D]">
            Search Results
          </h2>

          <p className="text-[#666666] mt-2">
            Showing results for:
            <span className="font-semibold text-[#F97316]">
              {" "} {search}
            </span>
          </p>

        </div>

        {/* RESULT CARDS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">

          {filteredResults.length > 0 ? (

            filteredResults.map((activity, index) => (

              <div
                key={index}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition duration-300"
              >

                {/* IMAGE */}

                <div className="relative">

                  <img
                    src={activity.image}
                    alt=""
                    className="h-64 w-full object-cover"
                  />

                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md">

                    <Star
                      size={16}
                      className="text-yellow-500 fill-yellow-500"
                    />

                    <span className="font-semibold">
                      {activity.rating}
                    </span>

                  </div>

                </div>

                {/* CONTENT */}

                <div className="p-6">

                  <div className="flex justify-between items-start gap-4">

                    <div>

                      <h2 className="text-2xl font-bold text-[#2D2D2D]">
                        {activity.title}
                      </h2>

                      <div className="flex items-center gap-2 mt-3 text-[#666666]">

                        <MapPin size={18} />

                        <p>{activity.location}</p>

                      </div>

                      <div className="flex items-center gap-2 mt-3 text-[#666666]">

                        <Clock3 size={18} />

                        <p>{activity.duration}</p>

                      </div>

                    </div>

                    <h3 className="text-[#F97316] font-bold text-xl">
                      {activity.price}
                    </h3>

                  </div>

                  <button className="w-full mt-8 bg-[#F97316] text-white py-4 rounded-2xl font-medium hover:scale-[1.02] transition">

                    View Details

                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="col-span-full text-center py-20">

              <h2 className="text-3xl font-bold text-[#2D2D2D]">
                No Results Found
              </h2>

              <p className="text-[#666666] mt-4">
                Try searching for activities like
                Paragliding, Surfing, or Scuba Diving.
              </p>

            </div>

          )}

        </div>

      </div>

    </section>
  );
}