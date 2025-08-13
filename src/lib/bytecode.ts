export const measureBytes = (bytecode: string) => {
  return Buffer.from(
    bytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
    'hex',
  ).length;
};
