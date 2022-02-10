import { renderTreeText } from "../src/render";
import {
  buildProgram,
  traverseFromFile,
  traverseProject,
} from "../src/traverse";

describe("sample-app tests", () => {
  const entryPath = "./packages/ast/test/sample-app/Main.tsx";
  let state: ReturnType<typeof traverseFromFile>;

  beforeEach(() => {
    state = traverseProject(entryPath, {
      plugins: [require("../src/libraries/react-navigation")],
    });
  });

  it("should represent the full component hierarchy", () => {
    const renderedAst = renderTreeText(state.hierarchy, state.elements);
    expect(renderedAst).toMatchInlineSnapshot(`
      "<_root>
        <Main>
          <RRProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <MenuButton />
                <Stack.Screen />
                <Stack.Group>
                  <Stack.Screen />
                  <Stack.Screen />
                </Stack.Group>
              </Stack.Navigator>
            </NavigationContainer>
          </RRProvider>
        </Main>
      </_root>"
    `);
  });

  describe("elements lookup", () => {
    it("should have keys with IDs for each unique component in the hierarchy", () => {
      const keys = Object.keys(state.elements);
      expect(keys).toMatchInlineSnapshot(`
        Array [
          "Main-0",
          "RRProvider-0.0",
          "NavigationContainer-0.0.0",
          "Stack.Navigator-0.0.0.0",
          "MenuButton-0.0.0.0.0",
          "Stack.Screen-0.0.0.0.1",
          "Stack.Group-0.0.0.0.2",
          "Stack.Screen-0.0.0.0.2.0",
          "Stack.Screen-0.0.0.0.2.1",
        ]
      `);
    });
  });

  describe("leafNodes lookup", () => {
    beforeEach(() => {
      const program = buildProgram(entryPath);
      const sourceFile = program.getSourceFile(entryPath);
      if (!sourceFile) throw new Error("No sourcefile!");

      state = traverseFromFile(sourceFile, {
        projectFiles: [entryPath],
        program,
      });
    });

    it("should have IDs in the set representing tree leaf nodes (no children)", () => {
      const ids = Array.from(state.leafNodes);
      expect(ids).toMatchInlineSnapshot(`
        Array [
          "MenuButton-0.0.0.0.0",
          "Stack.Screen-0.0.0.0.1",
          "Stack.Screen-0.0.0.0.2.0",
          "Stack.Screen-0.0.0.0.2.1",
        ]
      `);
    });
  });
});
