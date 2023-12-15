import React, { useState } from "react";
import "../../App.css";

const LuckyNumbers = () => {
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [additionalNumber, setAdditionalNumber] = useState(null);

  const getRandomNumber = (max) => Math.floor(Math.random() * max) + 1;

  const generateLuckyNumbers = () => {
    const generatedNumbers = [];
    while (generatedNumbers.length < 6) {
      const number = getRandomNumber(49);
      if (!generatedNumbers.includes(number)) {
        generatedNumbers.push(number);
      }
    }
    setLuckyNumbers(generatedNumbers);
  };
  const generateSuperNumber = () => {
    const additional = getRandomNumber(10);
    setAdditionalNumber(additional);
  };

  const resetLuckyNumbers = () => {
    setLuckyNumbers([]);
    setAdditionalNumber(null);
  };

  const handleGenerateNumbers = () => {
    generateSuperNumber();
    generateLuckyNumbers();
  };

  return (
    <div className="container">
      <h1>Lotto 6 / 49</h1>
      <h5>Generating lucky numbers</h5>
      {luckyNumbers.length > 0 && (
        <div className="box">
          <ul>
            {luckyNumbers.map((number) => (
              <li key={number}>{number}</li>
            ))}
            <li>{additionalNumber}</li>
          </ul>
        </div>
      )}
      <button onClick={resetLuckyNumbers}>Reset</button>
      <button onClick={handleGenerateNumbers}>Show me lucky numbers</button>
    </div>
  );
};

export default LuckyNumbers;
