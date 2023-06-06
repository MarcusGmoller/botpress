# constants

## ports

OPENAPI_GENERATOR_SERVER_PORT = 8081
READINESS_PORT = 8082

## commands

GENERATE_RESSOURCES = ['pnpm-install', 'openapi-generator-server', 'readiness', 'generate-client']
BUILD_RESSOURCES = GENERATE_RESSOURCES + ['build-client', 'build-sdk', 'build-cli']
COMMAND_RESSOURCES = {
  'generate': GENERATE_RESSOURCES,
  'build': BUILD_RESSOURCES
}
AVAILABLE_COMMANDS = [k for k in COMMAND_RESSOURCES.keys()]

# config

config.define_string('cmd')
cfg = config.parse()
command = cfg.get('cmd', 'build')

if command not in AVAILABLE_COMMANDS:
  fail('command must be one of %s' % AVAILABLE_COMMANDS)

enabled_services = COMMAND_RESSOURCES[command]
config.clear_enabled_resources()
config.set_enabled_resources(enabled_services)

# resources

## pnpm install

local_resource(
  name='pnpm-install',
  cmd='pnpm install',
  labels=['scripts'],
)

## openapi-generator-server

openapi_generator_resource = {
  'image': 'openapitools/openapi-generator-online:v6.6.0',
  'ports': ['%s:8080' % OPENAPI_GENERATOR_SERVER_PORT],
  'restart': 'always',
}

docker_compose(encode_yaml({
  'version': '3.5',
  'services': {
    'openapi-generator-server': openapi_generator_resource,
  },
}))

dc_resource(name='openapi-generator-server', labels=['utils'])

## readiness

local_resource(
  name="readiness",
  allow_parallel=True,
  serve_cmd='pnpm ready',
  serve_env={
    'PORT': '%s' % READINESS_PORT,
    'LOG_LEVEL': 'info',
    'CONFIG': encode_json([
      { 'type': 'http', 'name': 'openapi-generator-server', 'url': 'http://localhost:%s' % OPENAPI_GENERATOR_SERVER_PORT },
    ]),
  },
  labels=['utils'],
  readiness_probe=probe(http_get=http_get_action(port=READINESS_PORT, path='/ready'), period_secs=1, failure_threshold=10),
  resource_deps=[
    'openapi-generator-server',
    'pnpm-install',
  ]
)

## generate client

local_resource(
  name='generate-client',
  allow_parallel=True,
  dir='packages/client',
  cmd='pnpm generate',
  env={
    'OPENAPI_GENERATOR_ENDPOINT': 'http://localhost:%s' % OPENAPI_GENERATOR_SERVER_PORT,
  },
  labels=['client'],
  resource_deps=['readiness']
)

## build client

local_resource(
  name='build-client',
  allow_parallel=True,
  dir='packages/client',
  cmd='pnpm build',
  labels=['client'],
  resource_deps=['generate-client']
)

## build sdk

local_resource(
  name='build-sdk',
  allow_parallel=True,
  dir='packages/sdk',
  cmd='pnpm build',
  labels=['sdk'],
  resource_deps=['build-client']
)

## build cli

local_resource(
  name='build-cli',
  allow_parallel=True,
  dir='packages/cli',
  cmd='pnpm build',
  labels=['cli'],
  resource_deps=['build-sdk']
)
