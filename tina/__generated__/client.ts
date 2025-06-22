import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '9cb0b5a17ee69d97c0f2c4165a5ba1142f76f589', queries,  });
export default client;
  