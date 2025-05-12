export const getRandomColor = (): string => {
  const colors = [
    '#958DF1',
    '#F98181',
    '#FBBC88',
    '#FAF594',
    '#70CFF8',
    '#94FADB',
    '#B9F18D',
    '#FF7DE9',
    '#FF97B5',
    '#FF9E66',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}