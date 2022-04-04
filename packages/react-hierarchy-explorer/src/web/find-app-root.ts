import * as vscode from "vscode";
import {
  createSourceFile,
  Identifier,
  ImportSpecifier,
  isArrowFunction,
  isCallExpression,
  isExpressionStatement,
  isIdentifier,
  isImportDeclaration,
  isPropertyAccessExpression,
  ScriptTarget,
  StringLiteral,
} from "typescript";

interface SuccessResult {
  uri: vscode.Uri;
  fail?: undefined;
}

export enum FindRootFailure {
  noWorkspace,
  noEntryFile,
  badEntryFile,
}

interface FailureResult {
  uri?: undefined;
  fail: FindRootFailure;
}

type Result = SuccessResult | FailureResult;

/**
 * returns the workspace path to the file holding the root-most
 * react component in the app hierarchy (usually App.tsx, but
 * that's not for certain...)
 */
export const findAppRoot = async (): Promise<Result> => {
  const [firstWorkspace] = vscode.workspace.workspaceFolders || [];
  if (!firstWorkspace) {
    return { fail: FindRootFailure.noWorkspace };
  }

  // @(index|App)?(.ios).{ts,js,tsx,jsx}
  let files = await vscode.workspace.findFiles("*.{ts,js,tsx,jsx}");
  files = files.filter((file) =>
    /(index|App)(\.ios)?\.[jt]sx?$/.test(file.path)
  );

  console.log({ files });

  if (!files || !files.length) {
    return { fail: FindRootFailure.noEntryFile };
  }

  const source = await vscode.workspace.fs.readFile(files[0]);
  const sourceUri = files[0];
  const sourceFile = createSourceFile(
    "index.ts",
    new TextDecoder().decode(source),
    ScriptTarget.Latest
  );

  const componentModulePaths: Record<string, string> = {};
  let matchedName: string | undefined;

  sourceFile.statements.forEach((statement) => {
    if (isImportDeclaration(statement)) {
      const modulePath = (statement.moduleSpecifier as StringLiteral).text;

      if (statement.importClause?.namedBindings) {
        statement.importClause?.namedBindings.forEachChild((binding) => {
          const exportName = (binding as ImportSpecifier).name
            .escapedText as string;
          componentModulePaths[exportName] = modulePath;
        });
      }

      if (statement.importClause?.name) {
        const exportName = (statement.importClause.name as Identifier)
          .escapedText as string;
        componentModulePaths[exportName] = modulePath;
      }
    }

    if (
      isExpressionStatement(statement) &&
      isCallExpression(statement.expression) &&
      isPropertyAccessExpression(statement.expression.expression) &&
      statement.expression.expression.name.escapedText === "registerComponent"
    ) {
      const expArgs = statement.expression.arguments;
      const [, value] = Array.from(expArgs);
      if (isArrowFunction(value) && isIdentifier(value.body)) {
        matchedName = value.body.escapedText as string;
      } else if (isIdentifier(value)) {
        matchedName = value.escapedText as string;
      }
    }
  });

  let matchModulePath = componentModulePaths[matchedName ?? ""];
  if (matchModulePath) {
    if (/\.[tj]sx$/.test(matchModulePath) === false) {
      matchModulePath = matchModulePath + ".tsx";
    }
    return {
      uri: vscode.Uri.joinPath(firstWorkspace.uri, matchModulePath),
    };
  }

  if (componentModulePaths.React === "react") {
    // treat as first component file, it likely has JSX in it
    return {
      uri: vscode.Uri.from({ scheme: sourceUri.scheme, path: sourceUri.path }),
    };
  }

  return { fail: FindRootFailure.badEntryFile };
};
