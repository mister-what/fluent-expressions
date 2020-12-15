module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "6",
        },
        modules: false,
        shippedProposals: true,
        corejs: 3,
        useBuiltIns: "usage",
      },
    ],
  ],
  plugins: [
    //["babel-plugin-polyfill-corejs3", { method: "usage-pure" }],
    "babel-plugin-macros",
  ],
};
