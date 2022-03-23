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

    file.forEachChild((child) => {
      if (child.kind === SyntaxKind.ImportDeclaration) {
        handleImportDeclaration(child as ImportDeclaration, crawlPaths);
      }
    });

    expect(crawlPaths).toMatchInlineSnapshot(`
      Object {
        "./components": Array [
          Object {
            "alias": undefined,
            "name": "SomeOtherComponent",
          },
          Object {
            "alias": "Component",
            "name": "default",
          },
        ],
        "@react-navigation/native-stack": Array [
          Object {
            "alias": undefined,
            "name": "createNativeStackNavigator",
          },
        ],
        "react": Array [
          Object {
            "alias": "React",
            "name": "default",
          },
        ],
        "react-redux": Array [
          Object {
            "alias": "RRProvider",
            "name": "Provider",
          },
        ],
      }
    `);
  });
});

describe("interestingCrawlPaths", () => {
  const basePaths = (paths: string[]) =>
    paths.map((path) => path.split("react-sidekick/").pop());

  it("should return interesting relative project paths when matching component name list", () => {
    const crawlPaths = {
      "./components": [{ name: "SomeOtherComponent", alias: undefined }],
      react: [{ name: "default", alias: "React" }],
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
