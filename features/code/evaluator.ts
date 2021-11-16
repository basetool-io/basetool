const curlyRegex = /{{(.*)}}/i;

/**
 * This method gets two params. The context and the binding.
 *
 * Example:
 * evaluateBinding({
 *  context: { record: field.record, value: field.value },
 *  input: field.column.baseOptions.backgroundColor, // {{ value.toLowerCase().includes('z') ? 'yellow' : 'green' }}
 * });
 */

export const evaluateBinding = ({
  context,
  input,
}: {
  context: Record<string, unknown>;
  input: string;
}): string | undefined => {
  if (!input || !context) return;

  // assign params and values
  const contextParams = Object.keys(context);
  const contextValues = Object.values(context);

  // fetch the contents between the curly braces
  const matches = input.match(curlyRegex);

  if (!matches || matches.length < 2) return;

  // Add return if missing
  const statement = matches[1].startsWith("return")
    ? matches[1]
    : `return ${matches[1]}`;

  // create the evaluation function
  const evalFn = new Function(...contextParams, statement);
  // evaluate the context
  try {
    return evalFn(...contextValues);
  } catch (error) {
    console.error("Evaluation error:", error);
  }
};
