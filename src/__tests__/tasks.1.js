import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LuckyNumbers from '../components/LuckyNumbers';


/**
 * Helper function: Returns an Array with Objects with multiple series of lucky numbers 
 * @param {Function} triggerCreateNumbersBtnFn - Fn that executes userEvent.click(createNumbersButton).
 * @param {Number} numSeries - how many series of numbers should be created
 * @param {Boolean} isSuperNumber - get super number (last luckyNumber in range between 1-10)
 * @returns {Object[]} Returns an Array which each lucky number as a object 
 * containing all following numbers after clicks
 */
const getSeriesOfLuckyNumbers = (triggerCreateNumbersBtnFn, numSeries=20, isSuperNumber=false) => {
  
  let numbersEl = null;
  if(isSuperNumber) {
    // find all Elements that contain a number from 1-10
    numbersEl = screen.getAllByText(/\b([1-9]|10)\b/);
  } else {
    // find all Elements that contain a number from 1-49
    numbersEl = screen.getAllByText(/\b([1-9]|[12][0-9]|3[0-9]|4[0-9])\b/);
  }
  
  // check if there are 7 numbers that have changed after at least 20 clicks 
  const originNumbersObjArr = numbersEl.map( numEl => ({
    num: numEl.textContent,
    isChanging: false,
    numsAfterClicks: []
  })); 

  // trigger n clicks to get n series of lucky numbers (n = numSeries)
  for(let i=0; i<numSeries; i++) {
    triggerCreateNumbersBtnFn();
    let numbersArrAfterClick = numbersEl.map( numEl => numEl.textContent); 

    // check after each click if original number (after first click) has changed
    originNumbersObjArr.forEach((numObj,i) => {
      if(!numObj.isChanging && numObj.num !== numbersArrAfterClick[i]) {
        originNumbersObjArr[i].isChanging = true;
      }
      // safe the (changed) number after the click 
      originNumbersObjArr[i].numsAfterClicks.push( parseInt(numbersArrAfterClick[i]) );
    })
  }

  // changinNumbers <=> lucky numbers
  let changingNumbers = originNumbersObjArr.filter( numObj => numObj.isChanging );

  if(isSuperNumber) {
    //find super number (number that stayed in range 1 - 10 during during all triggered clicks)
    return changingNumbers.filter( numObj => {
      return numObj.numsAfterClicks.every(n => n >= 1 && n <=10)
    })
  }
  // return numbers that have changed (=> lucky numbers)
  return changingNumbers;
}


describe("LuckyNumbers Component", ()=>{

  test("'Show me lucky numbers' button exists", ()=> {
    render(<LuckyNumbers />);
    const showBtn = screen.getByRole("button",{name:/(show|lucky|number)/img});
    expect(showBtn).toBeInTheDocument();
  })

  test("Clicking 'Show me lucky numbers' creates seven numbers from 1 to 49", ()=> {
    render(<LuckyNumbers />);
    const showBtn = screen.getByRole("button",{name:/(show|lucky|number)/img});
    userEvent.click(showBtn);

    const luckyNumbers = getSeriesOfLuckyNumbers(()=>{  userEvent.click(showBtn); });

   
    //find all numbers out of range which occured during clicking
    const isNotInRange = [];
    luckyNumbers.forEach(numObj=> {
      
      const outOfRangeNums = numObj.numsAfterClicks.filter( num => {
        const numAsInt = parseInt(num);
        return numAsInt < 1 || numAsInt > 49
      });
      isNotInRange.push(...outOfRangeNums)
    });
  
    expect(luckyNumbers).toHaveLength(7);
    expect(isNotInRange).toHaveLength(0);
  })

  test("Last number (super number) is always between 1 and 10", ()=> {
    render(<LuckyNumbers />);
    const showBtn = screen.getByRole("button",{name:/(show|lucky|number)/img});
    userEvent.click(showBtn);

    //find super number (number that was during all clicks in range 1 - 10)
    const superNumber = getSeriesOfLuckyNumbers( ()=>{ userEvent.click(showBtn);}, 20, true )
    expect(superNumber).toHaveLength(1);
  })

  test("Every click on 'Show me lucky numbers' creates unique numbers", ()=> {
    render(<LuckyNumbers />);
    const showBtn = screen.getByRole("button",{name:/(show|lucky|number)/img});
    userEvent.click(showBtn);

    // store numbers that have changed (=> lucky numbers)
    const luckyNumbers = getSeriesOfLuckyNumbers(()=>{userEvent.click(showBtn);});
    luckyNumbers.pop(); // remove super number
    
    // * find duplicates in series of lucky numbers after first click *
    let foundDuplicates = false;

    const firstLuckyNumbersInt = luckyNumbers.map( n => parseInt(n.num) ); //get number from Object
    if( (new Set(firstLuckyNumbersInt)).size !== firstLuckyNumbersInt.length ) {
      foundDuplicates = true;

    } else {
      // * find duplicates in all series of lucky numbers *
      
      for(let i=0; i<luckyNumbers[0].numsAfterClicks.length; i++) {
        // create arrays containing series of lucky numbers
        const currentSeriesOfNumbers = [];
        for(let j=0; j<luckyNumbers.length; j++) {
          currentSeriesOfNumbers.push(luckyNumbers[j].numsAfterClicks[i]);
        }
        // check every array (=series of lucky numbers) for duplicates
        const uniqueNumbersCount = new Set(currentSeriesOfNumbers).size;
        if( uniqueNumbersCount < 6 ) {
          foundDuplicates = true
        }
      } //end for
    }
    expect(foundDuplicates).toBeFalsy();
  })


  test("'reset' button exists", ()=> {
    render(<LuckyNumbers />);
    const resetBtn = screen.getByRole("button",{name:/(reset|rset|rest)/img});
    expect(resetBtn).toBeInTheDocument();
  })

  test("'reset' button removes lucky numbers", ()=> {
    render(<LuckyNumbers />);
    const resetBtn = screen.getByRole("button",{name:/(reset|rset|rest)/img});
    const showBtn = screen.getByRole("button",{name:/(show|lucky|number)/img});
    userEvent.click(showBtn);

     // find all Elements that contain a number from 1-49
    const numbersElBeforeReset = screen.getAllByText(/\b([1-9]|[12][0-9]|3[0-9]|4[0-9])\b/);
    userEvent.click(resetBtn);
    const numbersElAfterReset = screen.getAllByText(/\b([1-9]|[12][0-9]|3[0-9]|4[0-9])\b/);
    console.log({before:numbersElBeforeReset.length, after:numbersElAfterReset.length })
    //After reset 7 numbers should disappear (since we have 7 lucky numbers)
    expect(numbersElAfterReset).toHaveLength(numbersElBeforeReset.length-7);
  })

});
