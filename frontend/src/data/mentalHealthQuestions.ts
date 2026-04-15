export type Question = { id: string; text: string; options: { label: string; value: number }[] };
export type Instrument = { key: string; title: string; description: string; questions: Question[] };

const likertFrequency = [
  { label: 'Nenhuma vez', value: 0 },
  { label: 'Vários dias', value: 1 },
  { label: 'Mais da metade dos dias', value: 2 },
  { label: 'Quase todos os dias', value: 3 },
];

export const PHQ9: Instrument = {
  key: 'phq9',
  title: 'Avaliação de Humor (PHQ-9)',
  description: 'Nas últimas 2 semanas, com que frequência você foi incomodada pelos seguintes problemas?',
  questions: [
    { id: '1', text: 'Pouco interesse ou prazer em fazer as coisas', options: likertFrequency },
    { id: '2', text: 'Se sentiu para baixo, deprimida ou sem esperança', options: likertFrequency },
    { id: '3', text: 'Dificuldade para adormecer, permanecer dormindo ou dormiu demais', options: likertFrequency },
    { id: '4', text: 'Se sentiu cansada ou com pouca energia', options: likertFrequency },
    { id: '5', text: 'Falta de apetite ou comeu demais', options: likertFrequency },
    { id: '6', text: 'Se sentiu mal consigo mesma, ou achou que é um fracasso ou que decepcionou sua família', options: likertFrequency },
    { id: '7', text: 'Dificuldade para se concentrar nas coisas, como ler ou assistir televisão', options: likertFrequency },
    { id: '8', text: 'Lentidão para se movimentar ou falar, ou ao contrário, ficou tão agitada que ficava andando de um lado para o outro', options: likertFrequency },
    { id: '9', text: 'Pensou em se machucar ou que seria melhor estar morta', options: likertFrequency },
  ],
};

export const GAD7: Instrument = {
  key: 'gad7',
  title: 'Avaliação de Ansiedade (GAD-7)',
  description: 'Nas últimas 2 semanas, com que frequência você foi incomodada pelos seguintes problemas?',
  questions: [
    { id: '1', text: 'Se sentiu nervosa, ansiosa ou muito tensa', options: likertFrequency },
    { id: '2', text: 'Não conseguiu parar ou controlar as preocupações', options: likertFrequency },
    { id: '3', text: 'Ficou preocupada demais com diferentes coisas', options: likertFrequency },
    { id: '4', text: 'Teve dificuldade para relaxar', options: likertFrequency },
    { id: '5', text: 'Ficou tão agitada que ficou difícil ficar parada', options: likertFrequency },
    { id: '6', text: 'Ficou facilmente aborrecida ou irritada', options: likertFrequency },
    { id: '7', text: 'Sentiu medo como se algo horrível fosse acontecer', options: likertFrequency },
  ],
};

const pssLikert = [
  { label: 'Nunca', value: 0 }, { label: 'Quase nunca', value: 1 },
  { label: 'Às vezes', value: 2 }, { label: 'Com alguma frequência', value: 3 },
  { label: 'Com muita frequência', value: 4 },
];
const pssLikertReverse = [
  { label: 'Nunca', value: 4 }, { label: 'Quase nunca', value: 3 },
  { label: 'Às vezes', value: 2 }, { label: 'Com alguma frequência', value: 1 },
  { label: 'Com muita frequência', value: 0 },
];

export const PSS10: Instrument = {
  key: 'pss10',
  title: 'Avaliação de Estresse (PSS-10)',
  description: 'No último mês, com que frequência você...',
  questions: [
    { id: '1', text: 'Ficou transtornada por causa de algo que aconteceu inesperadamente?', options: pssLikert },
    { id: '2', text: 'Sentiu que era incapaz de controlar coisas importantes em sua vida?', options: pssLikert },
    { id: '3', text: 'Sentiu-se nervosa e estressada?', options: pssLikert },
    { id: '4', text: 'Sentiu confiança na sua capacidade de lidar com problemas pessoais?', options: pssLikertReverse },
    { id: '5', text: 'Sentiu que as coisas estavam indo bem?', options: pssLikertReverse },
    { id: '6', text: 'Achou que não conseguia lidar com todas as coisas que tinha que fazer?', options: pssLikert },
    { id: '7', text: 'Conseguiu controlar as irritações em sua vida?', options: pssLikertReverse },
    { id: '8', text: 'Sentiu que estava por cima das dificuldades?', options: pssLikertReverse },
    { id: '9', text: 'Ficou irritada por coisas que estavam fora do seu controle?', options: pssLikert },
    { id: '10', text: 'Sentiu que as dificuldades se acumulavam tanto que não conseguia superá-las?', options: pssLikert },
  ],
};

export const ALL_INSTRUMENTS: Instrument[] = [PHQ9, GAD7, PSS10];
