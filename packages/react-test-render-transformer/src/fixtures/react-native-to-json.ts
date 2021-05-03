import { ReactTestRendererNode } from "react-test-renderer";

export const rnGradientJSONFixture: ReactTestRendererNode = {
  type: "RCTSafeAreaView",
  props: {
    emulateUnlessSupported: true,
    style: {
      flex: 1,
    },
  },
  children: [
    {
      type: "View",
      props: {
        style: [
          {
            flex: 1,
            backgroundColor: "#F9F8F7",
            paddingTop: 30,
          },
          null,
        ],
      },
      children: [
        {
          type: "View",
          props: {
            style: {
              flex: 1,
            },
          },
          children: [
            {
              type: "View",
              props: {
                style: {
                  marginHorizontal: 20,
                },
              },
              children: [
                {
                  type: "Text",
                  props: {
                    style: [
                      {
                        fontFamily: "ComicSans",
                      },
                      {
                        fontSize: 26,
                        lineHeight: 36,
                      },
                      [
                        [
                          {
                            color: "#403E3D",
                          },
                          [
                            {
                              lineHeight: 36,
                              letterSpacing: 0.2,
                              color: "#403E3D",
                            },
                            {
                              color: "#403E3D",
                              marginBottom: 20,
                            },
                          ],
                        ],
                      ],
                      null,
                    ],
                    adjustsFontSizeToFit: false,
                    minimumFontScale: null,
                  },
                  children: ["This is a title"],
                },
                {
                  type: "Text",
                  props: {
                    style: [
                      {
                        fontFamily: "ComicSans",
                      },
                      {
                        fontSize: 14,
                        lineHeight: 19,
                      },
                      [
                        [
                          {
                            color: "#403E3D",
                          },
                          [
                            {
                              fontSize: 16,
                              lineHeight: 24,
                              color: "#73706E",
                            },
                            {
                              color: "#403E3D",
                            },
                          ],
                        ],
                      ],
                      null,
                    ],
                  },
                  children: ["This is some body text."],
                },
              ],
            },
            {
              type: "View",
              props: {
                style: [
                  {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  null,
                ],
              },
              children: [
                {
                  type: "Image",
                  props: {
                    source: {
                      testUri: "../../../src/images/some/image.png",
                    },
                  },
                  children: null,
                },
              ],
            },
          ],
        },
        {
          type: "View",
          props: {
            style: [
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                alignItems: "center",
              },
              {
                backgroundColor: "#F9F8F7",
              },
            ],
          },
          children: [
            {
              type: "View",
              props: {
                accessible: true,
                accessibilityRole: "button",
                accessibilityState: {
                  disabled: false,
                },
                style: {
                  borderRadius: 20,
                  flexDirection: "row",
                  opacity: 1,
                },
                testID: "ModalButtonPrimary",
                isTVSelectable: true,
                focusable: true,
              },
              children: [
                {
                  type: "BVLinearGradient",
                  props: {
                    style: [
                      {
                        borderRadius: 20,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                        backgroundColor: "#403e3d",
                      },
                    ],
                    startPoint: {
                      x: 0.5,
                      y: 0,
                    },
                    endPoint: {
                      x: 0.5,
                      y: 1,
                    },
                    colors: [4294757485, 4294688341],
                    locations: null,
                  },
                  children: [
                    {
                      type: "Text",
                      props: {
                        style: [
                          {
                            fontFamily: "ComicSans",
                          },
                          {
                            fontSize: 16,
                            lineHeight: 22,
                          },
                          [
                            [
                              {
                                color: "#403E3D",
                              },
                              [
                                {
                                  zIndex: 2,
                                  textAlign: "center",
                                  color: "#403E3D",
                                  flex: 6,
                                  marginVertical: 10,
                                  marginHorizontal: 20,
                                },
                              ],
                            ],
                          ],
                          null,
                        ],
                      },
                      children: ["Login"],
                    },
                    {
                      type: "View",
                      props: {
                        style: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          backgroundColor: "#1A1A19",
                          borderRadius: 20,
                          opacity: 0,
                        },
                        pointerEvents: "none",
                      },
                      children: null,
                    },
                  ],
                },
              ],
            },
            {
              type: "View",
              props: {
                accessible: true,
                accessibilityRole: "button",
                accessibilityState: {
                  disabled: false,
                },
                style: {
                  borderRadius: 20,
                  flexDirection: "row",
                  opacity: 1,
                },
                testID: "ModalButtonSecondary",
                isTVSelectable: true,
                focusable: true,
              },
              children: [
                {
                  type: "View",
                  props: {
                    style: [
                      {
                        borderRadius: 25,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                        backgroundColor: "transparent",
                      },
                      {
                        marginTop: 10,
                      },
                    ],
                    colors: ["transparent", "transparent"],
                  },
                  children: [
                    {
                      type: "Text",
                      props: {
                        style: [
                          {
                            fontFamily: "ComicSans",
                          },
                          {
                            fontSize: 14,
                            lineHeight: 19,
                          },
                          [
                            [
                              {
                                color: "#403E3D",
                              },
                              [
                                {
                                  zIndex: 2,
                                  textAlign: "center",
                                  color: "#73706E",
                                  flex: 6,
                                  marginVertical: 10,
                                  marginHorizontal: 20,
                                },
                              ],
                            ],
                          ],
                          null,
                        ],
                      },
                      children: ["Learn more"],
                    },
                    {
                      type: "View",
                      props: {
                        style: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          backgroundColor: "#1A1A19",
                          borderRadius: 25,
                          opacity: 0,
                        },
                        pointerEvents: "none",
                      },
                      children: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
