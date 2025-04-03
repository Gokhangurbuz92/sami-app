"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.helloWorld = void 0;
import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.json({message: "Hello from Firebase!"});
});
// # sourceMappingURL=index.js.map
