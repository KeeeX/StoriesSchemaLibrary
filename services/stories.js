"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const rp = require("request-promise-native");

const apiBase = "https://stories.beta.keeex.me/";
const version = "v1"

let _token = null;

/**
 * Authenticate KeeeX Chains
 */
async function _authenticate(credential) {
  let options = {
    method: "POST",
    uri: `${apiBase}/${version}/auth/login`,
    body: credential,
    json: true,
  };

  let data = await rp(options);
  _token = data.token;
}

/**
 * Initialize
 *
 * @param {string} version - API version, default 'v1'
 * @param {Object} credential
 * @param {string} credential.email - user email
 * @param {string} credential.password - password
 *
 * @returns {Promise};
 */
async function init(credential) {
  assert(credential, "Missing credential");
  assert(credential.email, "Missing user email");
  assert(credential.password, "Missing password");

  return _authenticate(credential);
}

async function createSchema(community, file, publicMetadata, schemas) {
  assert(_token, "Unauthorized");

  assert(community, "Missing community");
  assert(file, "Missing schema file");
  assert(fs.existsSync(file), "Schema file doesn't exist");

  let formData = {
    file: {
      value: fs.createReadStream(file),
      options: {
        filename: path.basename(file),
        contentType: "application/json"
      }
    },
  };

  if (publicMetadata) {
    formData.publicMetadata = JSON.stringify(publicMetadata);
  }

  if (schemas) {
    formData.schemas = JSON.stringify(schemas);
  }

  let options = {
    method: "POST",
    uri: `${apiBase}/${version}/schemas/create`,
    headers: {
      Authorization: `Bearer ${_token}`,
    },
    formData: formData,
    json: true,
  };

  let output = await rp(options);

  return output.idx;
}

async function updateSchema(schemaIdx, file, publicMetadata, schemas) {
  assert(_token, "Unauthorized");

  assert(schemaIdx, "Missing schema IDX");
  assert(file, "Missing new schema file");
  assert(fs.existsSync(file), "Schema file doesn't exist");

  let formData = {
    file: {
      value: fs.createReadStream(file),
      options: {
        filename: path.basename(file),
        contentType: "application/json"
      }
    },
  };

  if (publicMetadata) {
    formData.publicMetadata = JSON.stringify(publicMetadata);
  }

  if (schemas) {
    formData.schemas = JSON.stringify(schemas);
  }

  let options = {
    method: "POST",
    uri: `${apiBase}/${version}/schemas/update`,
    headers: {
      Authorization: `Bearer ${_token}`,
    },
    formData: formData,
    json: true,
  };

  let output = await rp(options);

  return output.idx;
}

module.exports = {
  init,
  createSchema,
  updateSchema,
};
