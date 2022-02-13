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
    const renderedAst = renderTreeText(state.hierarchy);
    expect(renderedAst).toMatchInlineSnapshot(`
      "<_Root>
        <Main>
          <RRProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <MenuButton />
                <Stack.Screen />
                <Stack.Group>
                  <Stack.Screen>
                    <SettingsScreen>
                      <SettingsScreen>
                        <SafeAreaView>
                          <Pressable>
                            <View>
                              <Text />
                            </View>
                          </Pressable>
                          <Pressable>
                            <View>
                              <Text />
                            </View>
                          </Pressable>
                        </SafeAreaView>
                      </SettingsScreen>
                    </SettingsScreen>
                  </Stack.Screen>
                  <Stack.Screen>
                    <SettingsProfileScreen>
                      <SettingsProfileScreen>
                        <View>
                          <Text />
                          <TextInput />
                          <TextInput />
                          <Text />
                        </View>
                      </SettingsProfileScreen>
                    </SettingsProfileScreen>
                  </Stack.Screen>
                </Stack.Group>
              </Stack.Navigator>
            </NavigationContainer>
          </RRProvider>
        </Main>
      </_Root>"
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
          "SettingsScreen-0.0.0.0.2.0.0",
          "Stack.Screen-0.0.0.0.2.1",
          "SettingsProfileScreen-0.0.0.0.2.1.0",
          "SettingsProfileScreen-0.0.0.0.2.1.0.0",
          "View-0.0.0.0.2.1.0.0.0",
          "Text-0.0.0.0.2.1.0.0.0.0",
          "TextInput-0.0.0.0.2.1.0.0.0.1",
          "TextInput-0.0.0.0.2.1.0.0.0.2",
          "Text-0.0.0.0.2.1.0.0.0.3",
          "SettingsScreen-0.0.0.0.2.0.0.0",
          "SafeAreaView-0.0.0.0.2.0.0.0.0",
          "Pressable-0.0.0.0.2.0.0.0.0.0",
          "View-0.0.0.0.2.0.0.0.0.0.0",
          "Text-0.0.0.0.2.0.0.0.0.0.0.0",
          "Pressable-0.0.0.0.2.0.0.0.0.1",
          "View-0.0.0.0.2.0.0.0.0.1.0",
          "Text-0.0.0.0.2.0.0.0.0.1.0.0",
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

  describe("plugins", () => {
    describe("react navigation", () => {
      beforeEach(() => {
        const program = buildProgram(entryPath);
        const sourceFile = program.getSourceFile(entryPath);
        if (!sourceFile) throw new Error("No sourcefile!");

        state = traverseFromFile(sourceFile, {
          plugins: [require("../src/libraries/react-navigation")],
          projectFiles: [entryPath],
          program,
        });
      });

      it("should have its own state linking screen route names to component names", () => {
        expect(Object.keys(state.thirdParty)).toEqual(["reactNavigation"]);
        expect((state.thirdParty.reactNavigation as any).routes).toEqual({
          Settings: "SettingsScreen",
          SettingsProfile: "SettingsProfileScreen",
        });
        expect(
          Array.from((state.thirdParty.reactNavigation as any).components)
        ).toEqual(["SettingsScreen", "SettingsProfileScreen"]);
      });

      it("should change the leaf nodes in the main AST state", () => {
        const ids = Array.from(state.leafNodes);
        expect(ids).toMatchInlineSnapshot(`
          Array [
            "MenuButton-0.0.0.0.0",
            "Stack.Screen-0.0.0.0.1",
            "SettingsScreen-0.0.0.0.2.0.0",
            "SettingsProfileScreen-0.0.0.0.2.1.0",
          ]
        `);
      });
    });
  });
});
