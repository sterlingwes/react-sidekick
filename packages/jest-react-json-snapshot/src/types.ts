/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * types below conform to plugin interface which is not available from DefinitelyTyped
 * https://github.com/facebook/jest/blob/e61796985e8651090d1aebd2a2bbe890f52b96db/packages/pretty-format/src/types.ts#L115
 */

type Colors = {
  comment: { close: string; open: string };
  content: { close: string; open: string };
  prop: { close: string; open: string };
  tag: { close: string; open: string };
  value: { close: string; open: string };
};
type Indent = (arg0: string) => string;
type Refs = Array<unknown>;
type Print = (arg0: unknown) => string;

type Config = {
  callToJSON: boolean;
  colors: Colors;
  escapeRegex: boolean;
  escapeString: boolean;
  indent: string;
  maxDepth: number;
  min: boolean;
  plugins: Plugins;
  printFunctionName: boolean;
  spacingInner: string;
  spacingOuter: string;
};

type Printer = (
  val: unknown,
  config: Config,
  indentation: string,
  depth: number,
  refs: Refs,
  hasCalledToJSON?: boolean
) => string;

type Test = (arg0: any) => boolean;

type NewPlugin = {
  serialize: (
    val: any,
    config: Config,
    indentation: string,
    depth: number,
    refs: Refs,
    printer: Printer
  ) => string;
  test: Test;
};

type PluginOptions = {
  edgeSpacing: string;
  min: boolean;
  spacing: string;
};

type OldPlugin = {
  print: (
    val: unknown,
    print: Print,
    indent: Indent,
    options: PluginOptions,
    colors: Colors
  ) => string;
  test: Test;
};

type Plugin = NewPlugin | OldPlugin;

type Plugins = Array<Plugin>;

export type SnapshotPluginSerialize = NewPlugin["serialize"];

export type SnapshotPluginTest = Test;
