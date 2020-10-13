export type Frame = {
  filePath: string;
  lineNumber: number;
  column: number;
};

export const parseStackFrame = (stack: string): Frame | null => {
  const stackParts = stack.split("\n");
  const callerFrame = stackParts[3];
  if (!callerFrame) return null;
  const frameMatch = callerFrame.match(/([^\s\(\)]+):([0-9]+):([0-9]+)/);
  if (!frameMatch) return null;

  return {
    filePath: frameMatch[1],
    lineNumber: parseInt(frameMatch[2]),
    column: parseInt(frameMatch[3]),
  };
};
