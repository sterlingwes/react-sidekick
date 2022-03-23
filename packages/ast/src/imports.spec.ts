import { createProject } from "@ts-morph/bootstrap";
import { ImportDeclaration, SourceFile, SyntaxKind } from "typescript";

import { handleImportDeclaration, interestingCrawlPaths } from "./imports";

const appFileFixture = `
import React from "react";
import { Provider as RRProvider } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Component, { SomeOtherComponent } from './components';

const RootStack = createNativeStackNavigator();

export const App = () => (
  <RootStack.Screen name="Home" component={Component} />
)
`;

describe("handleImportDeclaration", () => {
  let file: SourceFile;

  beforeEach(async () => {
    const project = await createProject({ useInMemoryFileSystem: true });
    file = project.createSourceFile("./some/app.tsx", appFileFixture);
  });

  it("should build a map of module paths to export names", () => {
    const crawlPaths = {};
    const aliases = {};

    file.forEachChild((child) => {
      if (child.kind === SyntaxKind.ImportDeclaration) {
        handleImportDeclaration(
          child as ImportDeclaration,
          crawlPaths,
          aliases
        );
      }
    });

    expect(crawlPaths).toEqual({
      "./components": [{ name: "SomeOtherComponent", alias: undefined }],
      "@react-navigation/native-stack": [
        { name: "createNativeStackNavigator", alias: undefined },
      ],
      react: [{ name: "React", alias: undefined }],
      "react-redux": [{ alias: "RRProvider", name: "Provider" }],
    });
  });
});

describe("interestingCrawlPaths", () => {
  const basePaths = (paths: string[]) =>
    paths.map((path) => path.split("react-sidekick/").pop());

  it("should return interesting relative project paths when matching component name list", () => {
    const crawlPaths = {
      "./components": [{ name: "SomeOtherComponent", alias: undefined }],
      "@react-navigation/native-stack": [
        { name: "createNativeStackNavigator", alias: undefined },
      ],
      react: [{ name: "React", alias: undefined }],
      "react-redux": [{ alias: "RRProvider", name: "Provider" }],
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
