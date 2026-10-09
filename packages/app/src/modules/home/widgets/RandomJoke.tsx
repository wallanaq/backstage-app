import { useState } from 'react';
import SmileIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import { WidgetCard } from '../WidgetCard';
import styles from './RandomJoke.module.css';

const JOKES = [
  {
    question: 'Por que o programador largou o emprego?',
    answer: 'Porque ele não recebeu arrays.',
  },
  {
    question: 'Quantos programadores são necessários para trocar uma lâmpada?',
    answer: 'Nenhum, isso é um problema de hardware.',
  },
  {
    question: 'Por que os programadores preferem o modo escuro?',
    answer: 'Porque a luz atrai bugs.',
  },
  {
    question: 'O que um array disse para o outro?',
    answer: 'Nos vemos no índice zero.',
  },
  {
    question: 'Por que o desenvolvedor foi ao médico?',
    answer: 'Porque estava com um problema de performance crônico.',
  },
  {
    question: 'Qual é o animal favorito de quem programa em Python?',
    answer: 'A cobra, claro. Ela não precisa de chaves.',
  },
];

export function RandomJoke() {
  // Picked once per visit to the page, there is nothing to configure.
  const [joke] = useState(
    () => JOKES[Math.floor(Math.random() * JOKES.length)],
  );

  return (
    <WidgetCard icon={<SmileIcon />} title="Piada aleatória">
      <div className={styles.content}>
        <p className={styles.question}>{joke.question}</p>
        <p className={styles.answer}>{joke.answer}</p>
      </div>
    </WidgetCard>
  );
}
