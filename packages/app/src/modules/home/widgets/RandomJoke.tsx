import { useState } from 'react';
import SmileIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import { WidgetCard } from '../WidgetCard';
import styles from './RandomJoke.module.css';

const JOKES = [
  {
    question: 'Why did the developer quit his job?',
    answer: "Because he didn't get arrays.",
  },
  {
    question: 'How many programmers does it take to change a light bulb?',
    answer: "None, that's a hardware problem.",
  },
  {
    question: 'Why do programmers prefer dark mode?',
    answer: 'Because light attracts bugs.',
  },
  {
    question: 'What did one array say to the other?',
    answer: 'See you at index zero.',
  },
  {
    question: 'Why did the developer go to the doctor?',
    answer: 'Because he had a chronic performance problem.',
  },
  {
    question: "What is a Python programmer's favorite animal?",
    answer: "The snake, of course. It doesn't need curly braces.",
  },
];

export function RandomJoke() {
  // Picked once per visit to the page, there is nothing to configure.
  const [joke] = useState(
    () => JOKES[Math.floor(Math.random() * JOKES.length)],
  );

  return (
    <WidgetCard icon={<SmileIcon />} title="Random joke">
      <div className={styles.content}>
        <p className={styles.question}>{joke.question}</p>
        <p className={styles.answer}>{joke.answer}</p>
      </div>
    </WidgetCard>
  );
}
