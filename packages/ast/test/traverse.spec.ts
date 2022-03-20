import { DiagnosticTree } from "../src/diagnostic.util";
import { buildProgram } from "../src/program";
import { renderDiagnosticText, renderTreeText } from "../src/render";
import { traverseFromFile, traverseProject } from "../src/traverse";

describe("sample-app tests", () => {
  const dirname = "./packages/ast/test/sample-app";
  const entryPath = "./packages/ast/test/sample-app/Main.tsx";
  let state: Awaited<ReturnType<typeof traverseFromFile>>;

  beforeEach(async () => {
    state = await traverseProject(entryPath, {
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
                <Stack.Screen>
                  <ActionList>
                    <ActionList>
                      <TouchableOpacity>
                        <View>
                          <Text />
                        </View>
                      </TouchableOpacity>
                    </ActionList>
                  </ActionList>
                </Stack.Screen>
                <Stack.Screen>
                  <DetailScreen>
                    <DetailScreen>
                      <View>
                        <Text />
                        <Text />
                      </View>
                    </DetailScreen>
                  </DetailScreen>
                </Stack.Screen>
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

  describe("files", () => {
    it("should annotate nodes with file Ids used in files lookup", () => {
      expect(state.files).toEqual({
        "1": "packages/ast/test/sample-app/Main.tsx",
        "2": "./packages/ast/test/sample-app/screens/ActionList.tsx",
        "3": "./packages/ast/test/sample-app/screens/DetailScreen.tsx",
        "4": "./packages/ast/test/sample-app/components/index.ts",
        "5": "./packages/ast/test/sample-app/screens/SettingsProfileScreen.tsx",
        "6": "./packages/ast/test/sample-app/screens/SettingsScreen.tsx",
      });
    });
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
          "ActionList-0.0.0.0.1.0",
          "Stack.Screen-0.0.0.0.2",
          "DetailScreen-0.0.0.0.2.0",
          "Stack.Group-0.0.0.0.3",
          "Stack.Screen-0.0.0.0.3.0",
          "SettingsScreen-0.0.0.0.3.0.0",
          "Stack.Screen-0.0.0.0.3.1",
          "SettingsProfileScreen-0.0.0.0.3.1.0",
          "ActionList-0.0.0.0.1.0.0",
          "TouchableOpacity-0.0.0.0.1.0.0.0",
          "View-0.0.0.0.1.0.0.0.0",
          "Text-0.0.0.0.1.0.0.0.0.0",
          "View-0.0.0.0.1.0.0.1",
          "View-0.0.0.0.1.0.0.1.0",
          "Text-0.0.0.0.1.0.0.1.0.0",
          "FlatList-0.0.0.0.1.0.0.1.1",
          "RefreshControl-0.0.0.0.1.0.0.1.1.0",
          "DetailScreen-0.0.0.0.2.0.0",
          "View-0.0.0.0.2.0.0.0",
          "Text-0.0.0.0.2.0.0.0.0",
          "Text-0.0.0.0.2.0.0.0.1",
          "SettingsProfileScreen-0.0.0.0.3.1.0.0",
          "View-0.0.0.0.3.1.0.0.0",
          "Text-0.0.0.0.3.1.0.0.0.0",
          "TextInput-0.0.0.0.3.1.0.0.0.1",
          "TextInput-0.0.0.0.3.1.0.0.0.2",
          "Text-0.0.0.0.3.1.0.0.0.3",
          "SettingsScreen-0.0.0.0.3.0.0.0",
          "SafeAreaView-0.0.0.0.3.0.0.0.0",
          "Pressable-0.0.0.0.3.0.0.0.0.0",
          "View-0.0.0.0.3.0.0.0.0.0.0",
          "Text-0.0.0.0.3.0.0.0.0.0.0.0",
          "Pressable-0.0.0.0.3.0.0.0.0.1",
          "View-0.0.0.0.3.0.0.0.0.1.0",
          "Text-0.0.0.0.3.0.0.0.0.1.0.0",
        ]
      `);
    });
  });

  describe("leafNodes lookup", () => {
    beforeEach(async () => {
      const program = await buildProgram(entryPath);
      const sourceFile = program.getSourceFile(entryPath);
      if (!sourceFile) throw new Error("No sourcefile!");

      state = await traverseFromFile(sourceFile, {
        projectFiles: [entryPath],
        program,
        dirname,
      });
    });

    it("should have IDs in the set representing tree leaf nodes (no children)", () => {
      const ids = Array.from(state.leafNodes);
      expect(ids).toMatchInlineSnapshot(`
        Array [
          "MenuButton-0.0.0.0.0",
          "Stack.Screen-0.0.0.0.1",
          "Stack.Screen-0.0.0.0.2",
          "Stack.Screen-0.0.0.0.3.0",
          "Stack.Screen-0.0.0.0.3.1",
        ]
      `);
    });
  });

  describe("virtual fs program", () => {
    it("should complete traversal & build the same hierarchy as non-virtual", async () => {
      const virtualState = await traverseProject(entryPath, {
        plugins: [require("../src/libraries/react-navigation")],
        compilerOptions: {
          virtualFs: true,
        },
      });

      const renderedVirtualState = renderTreeText(virtualState.hierarchy);

      const nonVirtualState = await traverseProject(entryPath, {
        plugins: [require("../src/libraries/react-navigation")],
      });

      const renderedNonVirtualState = renderTreeText(nonVirtualState.hierarchy);

      expect(renderedNonVirtualState).toEqual(renderedVirtualState);
    });
  });

  describe("diagnostics", () => {
    let state: Awaited<ReturnType<typeof traverseProject>>;
    let diagnosticTree: DiagnosticTree;

    beforeEach(async () => {
      diagnosticTree = { children: [] };

      state = await traverseProject(entryPath, {
        runDiagnostic: true,
        plugins: [require("../src/libraries/react-navigation")],
      });
    });

    it("should populate the tree with reasons for node selection", () => {
      if (!state.diagnosticTree) throw new Error("Expected diagnostic result");
      const diagnostic = renderDiagnosticText(state.diagnosticTree);
      expect(diagnostic).toMatchSnapshot();
    });
  });

  describe("plugins", () => {
    describe("react navigation", () => {
      beforeEach(async () => {
        const program = await buildProgram(entryPath);
        const sourceFile = program.getSourceFile(entryPath);
        if (!sourceFile) throw new Error("No sourcefile!");

        state = await traverseFromFile(sourceFile, {
          plugins: [require("../src/libraries/react-navigation")],
          projectFiles: [entryPath],
          program,
          dirname,
        });
      });

      it("should have its own state linking screen route names to component names", () => {
        expect(Object.keys(state.thirdParty)).toEqual(["reactNavigation"]);
        expect((state.thirdParty.reactNavigation as any).routes).toEqual({
          Detail: "DetailScreen",
          Home: "ActionList",
          Settings: "SettingsScreen",
          SettingsProfile: "SettingsProfileScreen",
        });
        expect(
          Array.from((state.thirdParty.reactNavigation as any).components)
        ).toEqual([
          "ActionList",
          "DetailScreen",
          "SettingsScreen",
          "SettingsProfileScreen",
        ]);
      });

      it("should change the leaf nodes in the main AST state", () => {
        const ids = Array.from(state.leafNodes);
        expect(ids).toMatchInlineSnapshot(`
          Array [
            "MenuButton-0.0.0.0.0",
            "ActionList-0.0.0.0.1.0",
            "DetailScreen-0.0.0.0.2.0",
            "SettingsScreen-0.0.0.0.3.0.0",
            "SettingsProfileScreen-0.0.0.0.3.1.0",
          ]
        `);
      });
    });
  });
});
