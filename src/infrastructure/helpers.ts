export const getArgv = (argv: string[], key: string, fallbackValue: string): string => {
  const command = argv.find(element => element.startsWith( `--${ key }=`));
  const value = command ? command.replace( `--${ key }=` , '' ) : null;

  return value || fallbackValue;
};
