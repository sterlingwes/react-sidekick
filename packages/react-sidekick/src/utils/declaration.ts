import React from "react";
import { transform } from "react-test-render-transformer";
import TestRenderer from "react-test-renderer";

type ComponentType = (props: unknown | undefined) => JSX.Element;

interface DeclarationJson {
  component: ComponentType;
  propConfigurations?: Array<unknown>;
}

export class SnapshotDeclaration {
  json: DeclarationJson;

  constructor(declaration: DeclarationJson) {
    // TODO: lint / validate
    this.json = declaration;
  }

  async renderEach(): Promise<string[]> {
    if (!this.json.propConfigurations) {
      const jsString = await this.render(this.json.component);
      return [jsString];
    }

    const jsStrings = [];
    for (let config of this.json.propConfigurations) {
      const result = await this.render(this.json.component, config);
      jsStrings.push(result);
    }

    return jsStrings;
  }

  async render(component: ComponentType, props?: any): Promise<string> {
    const element = React.createElement(component, props);
    const testRenderer = TestRenderer.create(element);
    const tree = testRenderer.toJSON();

    if (!tree) {
      throw new Error(
        `Cannot snapshot ${element} which returned a "null" tree.`
      );
    }

    // @ts-ignore issue with TestRenderer types
    const jsString = transform(tree);

    console.log({ jsString });

    return jsString;
  }
}
