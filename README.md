# Kevin - Configuration Manager

Do you like configuring stuff? - of course no!

Do you like changing the stuff you configured? - Hell no!

Do you like playing detective and understand which value belong to what environment? - maybe...

## Kevin to the rescue
Kevin provides a unified framework gto handle the configuration for all the environments at one place.

Do you need another environment? No problem, with Kevin you can create a configuration for your specific environment in few clicks.
And ... as abonus, you can inherit all configuration parameters of a different environment and chnage only the parameters you need!.

## Getting started

- Install Kevin core:
 ```bash
 npm i @kevin-infra/core
 ```
- Connect to a repository
Kevin use a `Repository` in order to store the configuration informations, and a `Provider` for communication with the repository.
To connect Kevin to a certain repository, simply create a provider, and provide it while initialiing `KevinService`:
```typescript

import Redis from 'ioredis';
import { RedisProvider } from '@kevin-infra/redis';
import { KevinService } from '@kevin-infra/core/services';

const provider = new RedisProvider( new Redis(
        'redis://localhost:6379'
      ));
      
const kevinService = new KevinService(provider);

```

## Managing Environments

Environment is a collection of keys used by a certain deploymnet (Dev, Prod, QA, Staging etc').

Environments are managed in Kevin in a tree stracture, for example:

```
-Root
-- Prod
-- Dev
--- Staging
--- QA
```

In the above example:
- `Prod` and  `Dev` will inherit all the keys of the `Root` environment
- `Staging` and `QA` will inhterit all the keys of the `Dev` environment.

Each environment can override the values of the parent environment and provide a unique value for the environment.

### Create the root environment 

First we need to initialize the root environment:

``` typescript

const rootEnviroment = await createRootEnvironment();

```

The `rootEnvironment` contains the information of the created environment:
- name: The name of the environment.
- id: the id of the enviroment:
- parentEnviroment: Information about the parent env (null for the root environment).

### Create a sub environment

To create a sun environment under `root` (or any other environment), run the following code:
```typescript

const newEnvironmentInfo = await this.kevinService.createEnvironment(
      "my-new-env-name",
      PARENT_ENVIRONMENT_ID
    );

```

## Managing Keys
### Getting all environments keys

```typescript

await kevinService.setCurrentEnvironment(ENVIRONMENT_ID) // Setting kevin to work against specific environment.

const kevinKeys: Array<IKevinValue> =  await kevinService.getEnvironmentData();

```

### Getting value for a specifc key


```typescript

await kevinService.setCurrentEnvironment(ENVIRONMENT_ID) // Setting kevin to work against specific environment.

const value: IKevinValue =  await kevinService.getValue("my-key");

```

### Setting a value

```typescript

await kevinService.setCurrentEnvironment(ENVIRONMENT_ID) // Setting kevin to work against specific environment.

const value: IKevinValue =  await kevinService.setValue("my-key", "my-value");

```


### Adding a new key.


```typescript

await kevinService.setCurrentEnvironment(ENVIRONMENT_ID) // Setting kevin to work against specific environment.

const value: IKevinValue =  await kevinService.addKey("my-key", "my-value", "default-value");

```

The `default-value` is an *optional* default value that can be passed in order to set a value at the root environment.

If no value was provided, the key in the root environment will be set with an empty string.

## More Information
- Providers.
- Kevin Website.
