function computeDimensionsByRatio(height: number, width: number) {
  const ratio = height >= width ? width / height : height / width;

  return height >= width ? { height: 2, width: ratio * 2 } : { width: 2, height: ratio * 2 };
}

export { computeDimensionsByRatio };
