"use client";


import styles from "./quizDisplay.module.css"
import { Input } from "../form/Form";
import { useState } from "react";

export default function PromptResponse({ canClientCheck, quiz }) {
  const [userResponse, setUserResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState("empty");
  const [responseCorrect, setResponseCorrect] = useState(false);

  function handleInput(e) {
    e.preventDefault();
    setResponseStatus("incomplete");
    setUserResponse(e.target.value);
  }

  function handleCheckAnswer() {
    setResponseStatus("complete");

    const isCorrect = quiz.correctResponses.find(
      (x) => x.toLowerCase() === userResponse.toLowerCase()
    );

    if (isCorrect) {
      const party = new Particle('particles', { number: 200 });
      party.start();

      setTimeout(() => {
        party.stop();
      }, 10000);

      const audio = new Audio("/assets/sounds/clap.wav");
      audio.volume = 0.2;
      audio.play();
    }
    setResponseCorrect(isCorrect != undefined);
  }

  return (
    <div className={styles.quizCard}>
      <h4>{quiz.prompt}</h4>

      <Input
        label='Your Response'
        value={userResponse}
        onChange={handleInput}
      />

      <div id="particles"></div>

      <button onClick={handleCheckAnswer} className="submitButton">Check Answer</button>

      {responseCorrect && responseStatus === "complete" && <div>Correct!</div>}
      {!responseCorrect && responseStatus === "complete" && (
        <div>
          Incorrect. Acceptable answers are
          <ul>
            {quiz.correctResponses.map((ans) => {
              return <li key={ans}>{ans}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

class Particle {
  constructor(id, opt) {
    this.box = document.getElementById(id);
    this.number = opt.number || 100;
    this.colors = ['#ffca76', '#ffb9b9', '#fff180'];
    this.width = opt.width || 15;
    this.height = opt.height || 7;
    this.duration = opt.duration || 6000;
    this.delay = opt.delay || 200;
  }

  handleArrayParams(arr) {
    return Array.isArray(arr) && arr.length > 0 && arr.every(el => el[0] === '#') ? arr : false;
  }

  getRandom(max, min = 0) {
    min = Math.ceil(min);
    max = Math.floor(max + 1);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  getRange(num, range = 0.5) {
    const symbol = Math.random() > 0.5 ? +1 : -1;
    return num + this.getRandom(Math.floor(num * range)) * symbol;
  }

  start() {
    for (let i = 0; i < this.number; i++) {
      const temp = document.createElement('span');
      temp.style.cssText += `
        position: absolute;
        z-index: 100;
        transform-style: preserve-3d;
        animation-timing-function: cubic-bezier(${this.getRandom(3) * 0.1}, 0, 1, 1);
        animation-iteration-count: infinite;
        width: ${this.getRange(this.width, 0.7)}px;
        height: ${this.getRange(this.height, 0.7)}px;
        top: -${this.width * 2}px;
        left: calc(${this.getRandom(100)}% - ${this.width * 0.5}px);
        background-color: ${this.colors[this.getRandom(this.colors.length - 1)]};
        animation-name: fallen_${this.getRandom(5, 1)};
        animation-duration: ${this.getRange(this.duration)}ms;
        animation-delay: ${this.getRange(this.delay)}ms;
       `;
      this.box.append(temp);
    }
  }

  stop() {
    this.box.innerHTML = '';
  }
}
