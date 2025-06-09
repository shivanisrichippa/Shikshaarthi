// SupercoinTerms.jsx
import React, { useState } from 'react';
import './SupercoinTerms.css';

const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={onClick} aria-expanded={isOpen}>
        {title}
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="accordion-content">{content}</div>}
    </div>
  );
};

const SupercoinTerms = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const terms = [
    { title: "Student Verification", content: "To participate, you must be a currently enrolled student at a valid college. We may require verification of your student status." },
    { title: "Originality & Verification of Information", content: "All information shared (rental rooms, mess, services, etc.) must be original, accurate, and not copied from other sources. Supercoins will ONLY be credited after our team has successfully verified the authenticity and uniqueness of the information. This process may take some time." },
    { title: "No Duplicates", content: "If the same piece of information has already been shared by another user and verified, subsequent submissions of that identical information will not be eligible for Supercoins. 'First come, first served' for verified original info!" },
    { title: "Coin Crediting", content: "Supercoins are non-transferable and have no cash value outside the Shikshaarthi platform. Coin values for actions are subject to change." },
    { title: "Prize Redemption", content: "Redeemed prizes are subject to availability. Physical prizes will be shipped to addresses within India. Digital prizes will be delivered electronically. Shikshaarthi reserves the right to substitute prizes of equal or greater value." },
    { title: "Account Activity", content: "Shikshaarthi reserves the right to disqualify any user found to be engaging in fraudulent activities, spamming, or attempting to manipulate the Supercoin system. This may result in forfeiture of coins and rewards." },
  ];

  const handleAccordionClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="supercoin-terms-section">
      <h2 className="section-title">📜 Terms & <span>Conditions</span></h2>
      <p className="section-subtitle">Please read these carefully before participating in the Supercoin feature.</p>
      <div className="accordion-container">
        {terms.map((term, index) => (
          <AccordionItem
            key={index}
            title={term.title}
            content={term.content}
            isOpen={openIndex === index}
            onClick={() => handleAccordionClick(index)}
          />
        ))}
      </div>
    </section>
  );
};
export default SupercoinTerms;