var swiper = new Swiper(".swiper", {
    // effect: "cube",
    allowTouchMove: false,
    grabCursor: false,
    cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 20,
        shadowScale: 0.94,
    },
    // mousewheel:true
});
swiper.sliderMove = function (s, e) {
    console.log(s)
}
function Navigate(indx) {
    for (let i of document.querySelectorAll(".Links li")) i.classList.remove("activeLink")
    Array.from(document.querySelectorAll(".Links li"))[indx].classList.add("activeLink")
    swiper.slideTo(indx, 1000, true)
}

const cropsArray = [
    "Jowar", "Maize (corn)", "Millet", "Rice (paddy and deepwater rice)", "Almonds", "Apples", "Apricots", "Bananas",
    "Cantaloupe", "Chikoo", "Coconut", "Dates", "Figs", "Guava", "Jamun", "Litchi", "Luffa", "Mango", "Melon", "Orange",
    "Pomegranate", "Plums", "Pears", "Phalsa", "Papaya", "Peaches", "Sarda", "Sugarcane", "Walnut", "Watermelon",
    "Arhar (Tur)", "Black gram (Urad)", "Cotton", "Cowpea (Chavala)", "Green gram (Moong)", "Groundnut", "Guar",
    "Moth bean", "Mung bean", "Sesame (Til)", "Soybean", "Urad bean", "Red gram (Pigeon Pea)", "Fennel (Saunf)",
    "Bitter gourd (Karela)", "Bottle gourd", "Brinjal", "Chili", "Green bean", "Ladies' fingers (Okra)", "Sponge gourd",
    "Tinda", "  Tomato", "Turmeric", "Barley", "Oat (Avena sativa)", "Wheat", "Banana", "Ber", "Date", "Grape", "Grape Fruit",
    "Guava", "Kinnow", "Lemon", "Lime", "Mandarin Orange", "Mangoes", "Mulberries", "Orange", "Chickpea", "Kulthi (Horse Gram)",
    "Lobias", "Masoor", "Pigeon Pea", "Alfalfa (Lucerne)", "Coriander (Coriandrum sativum)", "Cumin (Cuminum cyminum)",
    "Fenugreek (Trigonella foenumgraecum)", "Linseed", "Mustard (Brassica juncea)", "Isabgol (Plantago ovata)",
    "Sunflower", "Bengal Gram", "Red Gram", "Black Pepper", "Bean", "Beetroot (Chukunder)", "Brinjal (Baingan)",
    "Broccoli (Hari Gobhi)", "Cabbage (Patta Gobhi)", "Capsicum", "Carrot (Gajar)", "Cauliflower (Gobhi)", "Chickpea (Channa)",
    "Fenugreek (Methi)", "Garlic (Lehsun)", "Lady Finger (Bhendi)", "Lettuce (Salad Gobhi)", "Pea (Mattar)",
    "Onion (Allium cepa)", "Potato (Aloo)", "Radish (Mooli)", "Spinach (Palak)", "Sweet Potato (Shakarkand)", "Tomato",
    "Turnip (Shalgum)", "Tobacco", "Bitter Gourd", "Fodder", "Pumpkin", "Guar (Cluster Beans)", "Strawberry", "Arhar (Pigeon Pea)",
    "Masur (Lentil)", "Sugarcane", "Tea", "Coffee", "Rubber", "Tobacco", "Cashew Nuts", "Bamboo", "Areca Nut (Betel Nut)"
];

function populateCrops() {
    const unitsSelect = document.getElementById("name");

    // Clear existing options
    unitsSelect.innerHTML = '<option value="">Select Crop</option>';

    // Populate with new options from the array
    cropsArray.forEach(crop => {
        const option = document.createElement("option");
        option.value = crop; // Set the value to be exactly the same as the crop name
        option.text = crop; // Display the crop name
        unitsSelect.appendChild(option);
    });
}

// Call the function to populate crops on page load
window.onload = populateCrops;