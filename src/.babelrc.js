module.exports = (api) => {
  return {
    ignore: api.env("test") ? [] : ["./*.bs.js", "./**/*.bs.js"],
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: api.env("test") ? "current" : "4",
          },
          useBuiltIns: "usage",
          corejs: 3,
          shippedProposals: true,
        },
      ],
    ],
    plugins: [
      //["babel-plugin-polyfill-corejs3", { method: "usage-pure" }],
      "babel-plugin-macros",
    ],
  };
};
