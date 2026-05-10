// BudgetItinerary.jsx

import { useState } from "react";

const initialData = [
  {
    day: "Day 1",
    activities: [
      {
        activity: "Flight to Paris",
        expense: "₹45,000",
      },

      {
        activity: "Hotel Check-in",
        expense: "₹12,000",
      },

      {
        activity: "Eiffel Tower Visit",
        expense: "₹2,500",
      },
    ],
  },

  {
    day: "Day 2",
    activities: [
      {
        activity: "Cafe Breakfast",
        expense: "₹1,200",
      },

      {
        activity: "Louvre Museum",
        expense: "₹2,000",
      },

      {
        activity: "Seine River Cruise",
        expense: "₹3,500",
      },
    ],
  },
];

export default function BudgetItinerary() {

  const [days, setDays] = useState(initialData);

  // ADD ACTIVITY

  const addActivity = (dayIndex) => {

    const updatedDays = [...days];

    updatedDays[dayIndex].activities.push({
      activity: "",
      expense: "",
    });

    setDays(updatedDays);
  };

  // REMOVE ACTIVITY

  const removeActivity = (
    dayIndex,
    activityIndex
  ) => {

    const updatedDays = [...days];

    updatedDays[dayIndex].activities.splice(
      activityIndex,
      1
    );

    setDays(updatedDays);
  };

  // HANDLE INPUT CHANGES

  const handleChange = (
    dayIndex,
    activityIndex,
    field,
    value
  ) => {

    const updatedDays = [...days];

    updatedDays[dayIndex].activities[activityIndex][field] =
      value;

    setDays(updatedDays);
  };

  return (

    <section className="px-6 lg:px-12 py-10">

      <div className="max-w-6xl mx-auto">

        {/* TOP */}

        <div>

          <p className="text-[#F97316] font-semibold">
            ITINERARY VIEW
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">

            Europe Adventure Plan

          </h1>

          <p className="text-[#666666] text-lg mt-4">

            Organize your activities and manage
            expenses day by day.

          </p>

        </div>

        {/* MAIN BOX */}

        <div className="bg-white rounded-[2rem] shadow-sm p-8 mt-12">

          {/* HEADER */}

          <div className="grid grid-cols-[120px_1fr_180px_120px] gap-6 border-b border-[#EEE] pb-5">

            <h2 className="font-semibold text-[#666666]">
              Day
            </h2>

            <h2 className="font-semibold text-[#666666]">
              Physical Activity
            </h2>

            <h2 className="font-semibold text-[#666666]">
              Expense
            </h2>

            <h2 className="font-semibold text-[#666666]">
              Action
            </h2>

          </div>

          {/* DAYS */}

          <div className="space-y-14 mt-10">

            {days.map((day, dayIndex) => (

              <div key={dayIndex}>

                {/* DAY TAG */}

                <div className="inline-block bg-[#F97316] text-white px-5 py-2 rounded-2xl font-medium">

                  {day.day}

                </div>

                {/* ACTIVITIES */}

                <div className="mt-8 space-y-6">

                  {day.activities.map(
                    (activity, activityIndex) => (

                      <div key={activityIndex}>

                        <div className="grid grid-cols-[120px_1fr_180px_120px] gap-6 items-center">

                          {/* EMPTY COLUMN */}

                          <div></div>

                          {/* ACTIVITY */}

                          <input
                            type="text"
                            value={activity.activity}
                            onChange={(e) =>
                              handleChange(
                                dayIndex,
                                activityIndex,
                                "activity",
                                e.target.value
                              )
                            }
                            placeholder="Enter activity..."
                            className="bg-[#F5F3F2] rounded-2xl p-5 outline-none focus:ring-2 focus:ring-[#F97316]"
                          />

                          {/* EXPENSE */}

                          <input
                            type="text"
                            value={activity.expense}
                            onChange={(e) =>
                              handleChange(
                                dayIndex,
                                activityIndex,
                                "expense",
                                e.target.value
                              )
                            }
                            placeholder="₹0"
                            className="bg-[#F5F3F2] rounded-2xl p-5 outline-none focus:ring-2 focus:ring-[#F97316]"
                          />

                          {/* REMOVE BUTTON */}

                          <button
                            onClick={() =>
                              removeActivity(
                                dayIndex,
                                activityIndex
                              )
                            }
                            className="bg-red-500 text-white px-5 py-4 rounded-2xl hover:bg-red-600 transition"
                          >

                            Remove

                          </button>

                        </div>

                        {/* CONNECTOR */}

                        {activityIndex !==
                          day.activities.length - 1 && (

                          <div className="ml-[250px] h-10 flex items-center">

                            <div className="w-[2px] h-full bg-[#DDD]"></div>

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

                {/* ADD BUTTON */}

                <button
                  onClick={() => addActivity(dayIndex)}
                  className="mt-8 bg-[#F97316] text-white px-6 py-3 rounded-2xl hover:scale-105 transition"
                >

                  + Add Activity

                </button>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}