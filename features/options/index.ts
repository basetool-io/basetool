type PossibleValues = string | boolean | number | null | undefined;

const OPTIONS: Record<string, PossibleValues> = {
  runInProxy: false,
};

const optionsHandler = {
  get: async (key: string): Promise<PossibleValues> => {
    return OPTIONS[key];
  },
};

export default optionsHandler;
