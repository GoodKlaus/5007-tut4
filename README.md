# Ticket To Ride With a Persistent Database
## Code Clone Link: https://github.com/GoodKlaus/5007-tut4.git
## Commands to Compile
```
npm init

npm install express@4
npm install --save-dev @babel/core@7 @babel/cli@7
npm install --save-dev @babel/preset-react@7
npm install --no-save @babel/plugin-transform-arrow-functions@7
npm uninstall @babel/plugin-transform-arrow-functions@7
npm install --save-dev @babel/preset-env
npm install graphql@0 apollo-server-express@2
npm install mongodb@3

npx babel src --presets @babel/react --out-dir public
mongo traveller scripts/init.mongo.js
node server/server.js
```
