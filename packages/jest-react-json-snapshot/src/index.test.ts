import { simpleFixture } from "./fixtures/simple.fixture";

describe("jest react json snapshot serializer", () => {
  describe("simple tree", () => {
    it("should produce a JSON snapshot w/ callsite info", () => {
      expect(simpleFixture).toMatchSnapshot();
    });
  });
});
