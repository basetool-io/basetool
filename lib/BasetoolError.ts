class BasetoolError extends Error {
  public links?: string[];

  constructor(message: string, data?: { links?: string[] }) {
    super(message);
    this.links = data?.links;
  }
}

export default BasetoolError;
