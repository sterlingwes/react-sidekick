import { renderTreeText, traverseFromFile } from "./traverse";

describe("traverseFromFile", () => {
  describe("sample-app", () => {
    const entryPath = "./packages/ast/test/sample-app/Main.tsx";

    it("should represent the full component hierarchy", () => {
      const nodeTree = traverseFromFile(entryPath);
      const renderedAst = renderTreeText(nodeTree);
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
  });
});
