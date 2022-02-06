import { renderTreeText, traverseFromFile } from "./traverse";

describe("traverseFromFile", () => {
  describe("sample-app", () => {
    const entryPath = "./packages/ast/test/sample-app/Main.tsx";
    let state: ReturnType<typeof traverseFromFile>;

    beforeEach(() => {
      state = traverseFromFile(entryPath);
    });

    it("should represent the full component hierarchy", () => {
      const renderedAst = renderTreeText(state.hierarchy);
      expect(renderedAst).toMatchInlineSnapshot(`
        "<_root>
          <Main>
            <RRProvider>
              <NavigationContainer>
                <Stack.Navigator>
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
        expect(keys).toEqual([
          "Main",
          "RRProvider",
          "NavigationContainer",
          "Stack.Navigator",
          "Stack.Group",
          "Stack.Screen",
        ]);
      });
    });
  });
});
