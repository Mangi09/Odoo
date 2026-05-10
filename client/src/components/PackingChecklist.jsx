import { useState } from "react";
import { X } from "lucide-react";
import jsPDF from "jspdf";

const initialChecklist = [
    {
        category: "Documents",
        items: [
            { name: "Passport", checked: true },
            { name: "Flight Tickets", checked: true },
            { name: "Travel Insurance", checked: false },
        ],
    },

    {
        category: "Clothing",
        items: [
            { name: "Casual Shirts", checked: false },
            { name: "Walking Shoes", checked: true },
            { name: "Jacket", checked: false },
        ],
    },

    {
        category: "Electronics",
        items: [
            { name: "Phone Charger", checked: true },
            { name: "Power Adapter", checked: false },
        ],
    },
];

export default function PackingChecklist() {

    const [checklist, setChecklist] =
        useState(initialChecklist);

    const [newItem, setNewItem] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("Documents");

    const [newCategory, setNewCategory] =
        useState("");

    // TOGGLE CHECKBOX

    const toggleItem = (
        categoryIndex,
        itemIndex
    ) => {

        const updatedChecklist = [...checklist];

        updatedChecklist[categoryIndex]
            .items[itemIndex]
            .checked =
            !updatedChecklist[categoryIndex]
                .items[itemIndex]
                .checked;

        setChecklist(updatedChecklist);
    };

    // ADD ITEM

    const addItem = () => {

        if (newItem.trim() === "") return;

        const updatedChecklist = [...checklist];

        const categoryIndex =
            updatedChecklist.findIndex(
                (category) =>
                    category.category === selectedCategory
            );

        updatedChecklist[categoryIndex].items.push({
            name: newItem,
            checked: false,
        });

        setChecklist(updatedChecklist);

        setNewItem("");
    };

    // ADD CATEGORY

    const addCategory = () => {

        if (newCategory.trim() === "") return;

        const updatedChecklist = [
            ...checklist,

            {
                category: newCategory,
                items: [],
            },
        ];

        setChecklist(updatedChecklist);

        setSelectedCategory(newCategory);

        setNewCategory("");
    };

    // REMOVE ITEM

    const removeItem = (
        categoryIndex,
        itemIndex
    ) => {

        const updatedChecklist = [...checklist];

        updatedChecklist[categoryIndex]
            .items.splice(itemIndex, 1);

        setChecklist(updatedChecklist);
    };

    // RESET ALL

    const resetAll = () => {

        const updatedChecklist = checklist.map(
            (category) => ({
                ...category,

                items: category.items.map(
                    (item) => ({
                        ...item,
                        checked: false,
                    })
                ),
            })
        );

        setChecklist(updatedChecklist);
    };

    // DOWNLOAD PDF

    const downloadPDF = () => {

        const doc = new jsPDF();

        let y = 20;

        doc.setFontSize(22);

        doc.text(
            "Travel Packing Checklist",
            20,
            y
        );

        y += 20;

        checklist.forEach((category) => {

            doc.setFontSize(16);

            doc.text(category.category, 20, y);

            y += 10;

            category.items.forEach((item) => {

                doc.setFontSize(12);

                doc.text(
                    `${item.checked ? "[x]" : "[ ]"} ${item.name}`,
                    30,
                    y
                );

                y += 8;
            });

            y += 10;
        });

        doc.save("packing-checklist.pdf");
    };

    // COUNTS

    const totalItems = checklist.reduce(
        (total, category) =>
            total + category.items.length,
        0
    );

    const packedItems = checklist.reduce(
        (total, category) =>
            total +
            category.items.filter(
                (item) => item.checked
            ).length,
        0
    );

    const progress =
        totalItems > 0
            ? (packedItems / totalItems) * 100
            : 0;

    return (

        <section className="px-6 lg:px-12 py-10">

            <div className="max-w-5xl mx-auto">

                {/* TOP */}

                <div>

                    <p className="text-[#F97316] font-semibold">
                        PACKING CHECKLIST
                    </p>

                    <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">

                        Paris & Rome Adventure

                    </h1>

                    <p className="text-[#666666] text-lg mt-4">

                        Organize your travel essentials
                        before your trip.

                    </p>

                </div>

                {/* MAIN CARD */}

                <div className="bg-white rounded-[2rem] shadow-sm p-8 mt-12">

                    {/* ADD ITEM */}

                    <div className="grid lg:grid-cols-2 gap-4">

                        <input
                            type="text"
                            placeholder="Add new item..."
                            value={newItem}
                            onChange={(e) =>
                                setNewItem(e.target.value)
                            }
                            className="bg-[#F5F3F2] rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#F97316]"
                        />

                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(
                                    e.target.value
                                )
                            }
                            className="bg-[#F5F3F2] rounded-2xl p-4 outline-none"
                        >

                            {checklist.map(
                                (category, index) => (

                                    <option
                                        key={index}
                                        value={category.category}
                                    >

                                        {category.category}

                                    </option>

                                )
                            )}

                        </select>

                    </div>

                    {/* BUTTONS */}

                    <div className="flex flex-wrap gap-4 mt-4">

                        <button
                            onClick={addItem}
                            className="bg-[#F97316] text-white px-6 py-4 rounded-2xl hover:scale-105 transition"
                        >

                            + Add Item

                        </button>

                        <input
                            type="text"
                            placeholder="New category..."
                            value={newCategory}
                            onChange={(e) =>
                                setNewCategory(e.target.value)
                            }
                            className="bg-[#F5F3F2] rounded-2xl p-4 outline-none"
                        />

                        <button
                            onClick={addCategory}
                            className="bg-[#F97316] text-white px-6 py-4 rounded-2xl hover:scale-105 transition"
                        >

                            + Create Category

                        </button>

                    </div>

                    {/* PROGRESS */}

                    <div className="mt-10">

                        <div className="flex justify-between mb-4">

                            <p className="text-[#666666] font-medium">

                                {packedItems}/{totalItems}
                                {" "}
                                items packed

                            </p>

                            <p className="font-semibold text-[#F97316]">

                                {Math.round(progress)}%

                            </p>

                        </div>

                        <div className="w-full h-4 bg-[#EEE] rounded-full overflow-hidden">

                            <div
                                style={{
                                    width: `${progress}%`,
                                }}
                                className="h-full bg-[#F97316] rounded-full transition-all duration-300"
                            ></div>

                        </div>

                    </div>

                    {/* CHECKLIST */}

                    <div className="space-y-10 mt-12">

                        {checklist.map(
                            (category, categoryIndex) => (

                                <div key={categoryIndex}>

                                    {/* CATEGORY */}

                                    <div className="flex items-center justify-between">

                                        <h2 className="text-2xl font-bold text-[#2D2D2D]">

                                            {category.category}

                                        </h2>

                                        <div className="bg-[#FFF4EC] text-[#F97316] px-4 py-2 rounded-2xl text-sm font-medium">

                                            {
                                                category.items.filter(
                                                    (item) =>
                                                        item.checked
                                                ).length
                                            }
                                            /
                                            {category.items.length}

                                        </div>

                                    </div>

                                    {/* ITEMS */}

                                    <div className="space-y-4 mt-6">

                                        {category.items.map(
                                            (item, itemIndex) => (

                                                <div
                                                    key={itemIndex}
                                                    className="bg-[#F5F3F2] rounded-2xl p-5 flex items-center justify-between"
                                                >

                                                    <div className="flex items-center gap-4">

                                                        <input
                                                            type="checkbox"
                                                            checked={item.checked}
                                                            onChange={() =>
                                                                toggleItem(
                                                                    categoryIndex,
                                                                    itemIndex
                                                                )
                                                            }
                                                            className="w-5 h-5 accent-[#F97316]"
                                                        />

                                                        <p
                                                            className={`text-lg ${item.checked
                                                                    ? "line-through text-[#999]"
                                                                    : "text-[#2D2D2D]"
                                                                }`}
                                                        >

                                                            {item.name}

                                                        </p>

                                                    </div>

                                                    {/* REMOVE */}

                                                    <button
                                                        onClick={() =>
                                                            removeItem(
                                                                categoryIndex,
                                                                itemIndex
                                                            )
                                                        }
                                                        className="text-red-500 hover:scale-110 transition"
                                                    >

                                                        <X size={22} />

                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="flex flex-wrap gap-4 mt-12">

                        <button
                            onClick={resetAll}
                            className="bg-[#F5F3F2] px-6 py-4 rounded-2xl hover:bg-[#EEE] transition"
                        >

                            Reset All

                        </button>

                        <button
                            onClick={downloadPDF}
                            className="bg-[#F97316] text-white px-6 py-4 rounded-2xl hover:scale-105 transition"
                        >

                            Download PDF

                        </button>

                    </div>

                </div>

            </div>

        </section>
    );
}