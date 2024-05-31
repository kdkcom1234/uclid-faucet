module.exports = {
  apps: [
    {
      name: "uclid-faucet",
      script: "node_modules/.bin/next",
      args: "start -p 5173 -H 0.0.0.0",
      instances: 2,
      exec_mode: "cluster",
    },
  ],
};
