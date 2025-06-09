import React, { useState } from 'react';
import assets from '../assets/assets.js';

const messes = ["Mess 1", "Mess 2", "Mess 3", "Mess 4"];

const weeklyMenu = {
  "mess1": {
    "Monday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Misal Pav", image: assets.menu01 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Zunka Bhakri & Thecha", image: assets.menu02 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Pithla Bhakri & Dahi", image: assets.menu03 }
  ],
  "Tuesday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Poha & Chai", image: assets.menu04 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Matki Usal & Roti", image: assets.menu05 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Masale Bhaat & Kadhi", image: assets.menu06 }
  ],
  "Wednesday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Vada Pav & Chai", image: assets.menu07 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Puran Poli & Katachi Amti", image: assets.menu08 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Baingan Bharta & Roti", image: assets.menu01 }
  ],
  "Thursday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Thalipeeth & Curd", image: assets.menu02 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Bharli Vangi & Chapati", image: assets.menu03 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Sol Kadhi & Fish Curry (for non-veg)", image: assets.menu04 }
  ],
  "Friday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Sheera & Chai", image: assets.menu05 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Tambda Rassa & Bhakri", image: assets.menu06 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Pav Bhaji & Buttermilk", image: assets.menu07 }
  ],
  "Saturday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Sabudana Khichdi & Curd", image: assets.menu08 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Varan Bhaat & Ghee", image: assets.menu01 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Shengdana Chutney & Bhakri", image: assets.menu02 }
  ],
  "Sunday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Dhokla & Green Chutney", image: assets.menu03 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Chicken Sukka (non-veg) / Misal Pav (veg)", image: assets.menu04 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Bisi Bele Bhaat", image: assets.menu05 }
  ]

    // Add other days similarly...
  },
  "Mess 2": {
   "Monday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Misal Pav", image: assets.menu01 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Zunka Bhakri & Thecha", image: assets.menu02 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Pithla Bhakri & Dahi", image: assets.menu03 }
  ],
  "Tuesday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Poha & Chai", image: assets.menu04 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Matki Usal & Roti", image: assets.menu05 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Masale Bhaat & Kadhi", image: assets.menu06 }
  ],
  "Wednesday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Vada Pav & Chai", image: assets.menu07 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Puran Poli & Katachi Amti", image: assets.menu08 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Baingan Bharta & Roti", image: assets.menu01 }
  ],
  "Thursday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Thalipeeth & Curd", image: assets.menu02 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Bharli Vangi & Chapati", image: assets.menu03 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Sol Kadhi & Fish Curry (for non-veg)", image: assets.menu04 }
  ],
  "Friday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Sheera & Chai", image: assets.menu05 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Tambda Rassa & Bhakri", image: assets.menu06 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Pav Bhaji & Buttermilk", image: assets.menu07 }
  ],
  "Saturday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Sabudana Khichdi & Curd", image: assets.menu08 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Varan Bhaat & Ghee", image: assets.menu01 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Shengdana Chutney & Bhakri", image: assets.menu02 }
  ],
  "Sunday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Dhokla & Green Chutney", image: assets.menu03 },
    { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Chicken Sukka (non-veg) / Misal Pav (veg)", image: assets.menu04 },
    { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Bisi Bele Bhaat", image: assets.menu05 }
  ]

  },
  "Mess 3": {
    "Monday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Aloo Paratha & Yogurt", image: assets.menu01 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Dal Tadka & Rice", image: assets.menu01},
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Veg Pulao & Cucumber Raita", image: assets.menu02}
    ],
    "Tuesday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Poha & Chai", image: assets.menu02 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Veg Biryani & Raita", image: assets.menu02 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Chole Bhature", image: assets.menu23 }
    ],
    "Wednesday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Vada Pav & Tea", image: assets.menu04 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Aloo Gobi & Chapati", image: assets.menu05 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Methi Thepla & Buttermilk", image: assets.menu06 }
    ],
    "Thursday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Idli & Sambar", image: assets.menu07 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Khichdi & Papad", image: assets.menu28 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Veg Cutlets & Ketchup", image: assets.menu09 }
    ],
    "Friday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Poha & Chutney", image: assets.menu10 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Dal Fry & Chapati", image: assets.menu01 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Rice & Rajma", image: assets.menu02 }
    ],
    "Saturday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Thepla & Curd", image: assets.menu03 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Veg Korma & Rice", image: assets.menu04 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Masala Dosa & Coconut Chutney", image: assets.menu35 }
    ],
    "Sunday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Paratha & Raita", image: assets.menu06 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Paneer Butter Masala & Naan", image: assets.menu07 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Pasta & Garlic Bread", image: assets.menu08 }
    ]
  },
  "Mess 4": {
    "Monday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Poha & Chai", image: assets.menu09 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Vegetable Pulao & Raita", image: assets.menu10 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Pav Bhaji", image: assets.menu01 }
    ],
    "Tuesday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Upma & Tea", image: assets.menu02 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Chole & Bhature", image: assets.menu03 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Dal Makhani & Rice", image: assets.menu04 }
    ],
    "Wednesday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Aloo Tikki & Chutney", image: assets.menu05 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Biryani & Raita", image: assets.menu06 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Dosa & Sambar", image: assets.menu07 }
    ],
    "Thursday": [
    { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Idli & Chutney", image: assets.menu08 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Pasta & Garlic Bread", image: assets.menu09 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Gobi Manchurian & Fried Rice", image: assets.menu10 }
    ],
    "Friday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Vada Pav & Chutney", image: assets.menu01 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Vegetable Biryani & Raita", image: assets.menu02 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Kadhi Pakora & Rice", image: assets.menu03 }
    ],
    "Saturday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Bread Butter & Jam", image: assets.menu04 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Pav Bhaji", image: assets.menu05 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Chapati & Sabzi", image: assets.menu06 }
    ],
    "Sunday": [
      { time: "8:00 AM - 9:00 AM", type: "Breakfast", item: "Sabudana Khichdi", image: assets.menu07 },
      { time: "12:30 PM - 2:00 PM", type: "Lunch", item: "Paneer Butter Masala & Naan", image: assets.menu08 },
      { time: "7:30 PM - 9:00 PM", type: "Dinner", item: "Rice & Rajma", image: assets.menu09 }
    ]
  }
};

const DemoMenu = () => {
  const [selectedMess, setSelectedMess] = useState("mess1");

  return (
    <div className="container-fluid py-4 my-4">
      <div className="container">
        <div className="text-center">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Our Demo Menu
          </small>
          <h1 className="display-5 mb-5">Weekly Menu of the Messes</h1>
        </div>
        <div className="tab-class text-center">
          <ul className="nav nav-pills d-inline-flex justify-content-center mb-5">
            {messes.map((mess, i) => (
              <li className="nav-item p-2" key={i}>
                <button
                  className={`d-flex py-2 mx-2 border border-primary justify-content-center rounded-pill ${selectedMess === `mess${i + 1}` ? 'bg-primary text-white ' : 'bg-white text-dark '}`}
                  style={{ width: '150px' }}
                  onClick={() => setSelectedMess(`mess${i + 1}`)}
                >
                  {mess}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="accordion" id="weeklyMenu">
          {Object.keys(weeklyMenu[selectedMess]).map((day, index) => (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} style={{ fontSize: '1.5rem', color: '#D4A762', fontWeight: 'bold' }}>
                  {day}
                </button>
              </h2>
              <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#weeklyMenu">
                <div className="accordion-body">
                  {weeklyMenu[selectedMess][day].map((meal, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-3">
                      <img className="img-fluid rounded-circle" src={meal.image} alt={meal.item} style={{ width: '50px', height: '50px' }} />
                      <div className="ps-3">
                        <h5 className="mb-1">{meal.type} - {meal.time}</h5>
                        <p className="mb-0">{meal.item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoMenu;
