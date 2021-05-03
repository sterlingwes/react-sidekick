import { transform } from "./index";
import { rnGradientJSONFixture } from "./fixtures/react-native-to-json";

describe("test renderer transformer", () => {
  describe("simple RN hierarchy", () => {
    it("should return JS string with one element", () => {
      const jsString = transform(rnGradientJSONFixture);
      expect(jsString).toMatchSnapshot();
    });
  });
});
