import { createProject } from "@ts-morph/bootstrap";
import { ImportDeclaration, SourceFile, SyntaxKind } from "typescript";

import { handleImportDeclaration, interestingCrawlPaths } from "./imports";

describe("handleImportDeclaration", () => {
  const testImports = `
    import React from "react";
    import { Provider as RRProvider } from "react-redux";
    import { createNativeStackNavigator } from "@react-navigation/native-stack";
    import Component, { SomeOtherComponent } from './components';

    const Stack = createNativeStackNavigator();
`;

  let file: SourceFile;

  beforeEach(async () => {
    const project = await createProject({ useInMemoryFileSystem: true });
    file = project.createSourceFile("./some/path.tsx", testImports);
  });

  it("should build a map of module paths to export names", () => {
    const crawlPaths = {};

    file.forEachChild((child) => {
      if (child.kind === SyntaxKind.ImportDeclaration) {
        handleImportDeclaration(child as ImportDeclaration, crawlPaths);
      }
    });

    expect(crawlPaths).toEqual({
      "./components": ["SomeOtherComponent"],
      "@react-navigation/native-stack": ["createNativeStackNavigator"],
      react: ["React"],
      "react-redux": ["RRProvider"],
    });
  });
});

describe("interestingCrawlPaths", () => {
  const basePaths = (paths: string[]) =>
    paths.map((path) => path.split("react-sidekick/").pop());

  it("should return interesting relative project paths when matching component name list", () => {
    const crawlPaths = {
      "./components": ["SomeOtherComponent"],
      "@react-navigation/native-stack": ["createNativeStackNavigator"],
      react: ["React"],
      "react-redux": ["RRProvider"],
    };

    const componentIdentifiers = new Set(["SomeOtherComponent"]);
    const baseFilePath = "./src/Main.tsx";

    const interestingPaths = interestingCrawlPaths(
      crawlPaths,
      componentIdentifiers,
      baseFilePath
    );

    expect(basePaths(interestingPaths)).toEqual(["src/components"]);
  });
});
