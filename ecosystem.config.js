module.exports = {
  apps : [
    {
      name: "metabnb",
      script: "./bin/www",
      watch: true,
      env: {
        "NODE_ENV": "production",
      }
    }
  ]
}
